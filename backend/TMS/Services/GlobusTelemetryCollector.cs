using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace TMS.Services;

public sealed class GlobusTelemetryCollector(
    IServiceScopeFactory scopeFactory,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<GlobusTelemetryCollector> logger) : BackgroundService
{
    private static readonly TimeSpan CollectionInterval = TimeSpan.FromSeconds(30);
    private const int MaxConcurrentRequests = 4;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var cycle = Stopwatch.StartNew();
            try
            {
                await CollectAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Globus telemetry collection cycle failed.");
            }

            var remainingDelay = CollectionInterval - cycle.Elapsed;
            if (remainingDelay > TimeSpan.Zero)
            {
                await Task.Delay(remainingDelay, stoppingToken);
            }
        }
    }

    private async Task CollectAsync(CancellationToken cancellationToken)
    {
        var token = configuration["Globus:ApiToken"];
        if (string.IsNullOrWhiteSpace(token))
        {
            logger.LogWarning("Globus telemetry collection skipped because the API token is not configured.");
            await Task.Delay(CollectionInterval, cancellationToken);
            return;
        }

        var baseUrl = configuration["Globus:BaseUrl"] ?? "https://globus.cloudgps.online/api-v1";
        if (!Uri.TryCreate($"{baseUrl.TrimEnd('/')}/", UriKind.Absolute, out var apiBaseUri) ||
            (apiBaseUri.Scheme != Uri.UriSchemeHttps && !apiBaseUri.IsLoopback))
        {
            logger.LogError("Globus telemetry collection skipped because the API base URL is invalid.");
            await Task.Delay(CollectionInterval, cancellationToken);
            return;
        }

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TMSDbContext>();
        var linkedDevices = await db.FleetVehicles.AsNoTracking()
            .Where(vehicle => vehicle.GpsDeviceId != null && vehicle.GpsDeviceId != "")
            .Select(vehicle => new { vehicle.CompanyId, Serial = vehicle.GpsDeviceId! })
            .Distinct()
            .ToListAsync(cancellationToken);

        using var concurrencyGate = new SemaphoreSlim(MaxConcurrentRequests);
        var observations = await Task.WhenAll(linkedDevices.Select(async device =>
        {
            await concurrencyGate.WaitAsync(cancellationToken);
            try
            {
                return new
                {
                    device.CompanyId,
                    device.Serial,
                    Point = await FetchLatestPointAsync(apiBaseUri, token, device.Serial, cancellationToken)
                };
            }
            finally
            {
                concurrencyGate.Release();
            }
        }));

        var validObservations = observations
            .Where(observation => observation.Point is not null)
            .ToArray();
        if (validObservations.Length == 0)
        {
            return;
        }

        var collectedAt = DateTimeOffset.UtcNow;
        foreach (var observation in validObservations)
        {
            var point = observation.Point!;
            var latest = await db.GlobusTelemetryPoints.AsNoTracking()
                .Where(stored => stored.CompanyId == observation.CompanyId &&
                                 stored.DeviceSerial == observation.Serial)
                .MaxAsync(stored => (DateTimeOffset?)stored.RecordedAtUtc, cancellationToken);
            if (latest.HasValue && point.RecordedAtUtc <= latest.Value)
            {
                continue;
            }

            db.GlobusTelemetryPoints.Add(new GlobusTelemetryPoint
            {
                CompanyId = observation.CompanyId,
                DeviceSerial = observation.Serial,
                RecordedAtUtc = point.RecordedAtUtc,
                Latitude = point.Latitude,
                Longitude = point.Longitude,
                SpeedKmh = point.SpeedKmh,
                CourseDegrees = point.CourseDegrees,
                AltitudeMeters = point.AltitudeMeters,
                IgnitionOn = point.IgnitionOn,
                SensorsJson = point.SensorsJson,
                CollectedAtUtc = collectedAt
            });
        }

        var savedCount = await db.SaveChangesAsync(cancellationToken);
        if (savedCount > 0)
        {
            logger.LogInformation("Stored {Count} new Globus telemetry points.", savedCount);
        }
    }

    private async Task<TelemetryPoint?> FetchLatestPointAsync(
        Uri apiBaseUri,
        string token,
        string serial,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            new Uri(apiBaseUri, $"devices/{Uri.EscapeDataString(serial)}/telemetry"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var response = await httpClientFactory.CreateClient().SendAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Globus telemetry request returned HTTP {(int)response.StatusCode}.",
                null,
                response.StatusCode);
        }

        using var document = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(cancellationToken),
            cancellationToken: cancellationToken);
        if (!document.RootElement.TryGetProperty("data", out var data))
        {
            return null;
        }

        if (data.ValueKind == JsonValueKind.Array)
        {
            if (data.GetArrayLength() == 0)
            {
                return null;
            }
            data = data[data.GetArrayLength() - 1];
        }

        if (data.ValueKind != JsonValueKind.Object ||
            !TryReadDateTime(data, "timestamp", out var recordedAt) ||
            !TryReadNumber(data, out var latitude, "lat", "latDeg", "mapLatDeg") ||
            !TryReadNumber(data, out var longitude, "lng", "lon", "lonDeg", "mapLonDeg") ||
            latitude is < -90 or > 90 ||
            longitude is < -180 or > 180)
        {
            return null;
        }

        return new TelemetryPoint(
            recordedAt,
            latitude,
            longitude,
            ReadNumber(data, "speed", "speedKmh"),
            ReadNumber(data, "course", "courseDeg"),
            ReadNumber(data, "altitude", "altitudeM"),
            ReadBoolean(data, "ignition", "ignOn"),
            ReadSensors(data));
    }

    private static string? ReadSensors(JsonElement telemetry)
    {
        if (telemetry.TryGetProperty("sensors", out var sensors) ||
            telemetry.TryGetProperty("sensorsMetric", out sensors))
        {
            return sensors.ValueKind is JsonValueKind.Object or JsonValueKind.Array
                ? sensors.GetRawText()
                : null;
        }
        return null;
    }

    private static double? ReadNumber(JsonElement element, params string[] propertyNames) =>
        TryReadNumber(element, out var value, propertyNames) ? value : null;

    private static bool TryReadNumber(
        JsonElement element,
        out double value,
        params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.Number &&
                property.TryGetDouble(out value))
            {
                return true;
            }
        }
        value = default;
        return false;
    }

    private static bool? ReadBoolean(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (!element.TryGetProperty(propertyName, out var property)) continue;
            if (property.ValueKind == JsonValueKind.True) return true;
            if (property.ValueKind == JsonValueKind.False) return false;
            if (property.ValueKind == JsonValueKind.Number && property.TryGetInt32(out var number))
            {
                return number != 0;
            }
        }
        return null;
    }

    private static bool TryReadDateTime(
        JsonElement element,
        string propertyName,
        out DateTimeOffset value)
    {
        value = default;
        return element.TryGetProperty(propertyName, out var property) &&
               property.ValueKind == JsonValueKind.String &&
               DateTimeOffset.TryParse(
                   property.GetString(),
                   CultureInfo.InvariantCulture,
                   DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                   out value);
    }

    private sealed record TelemetryPoint(
        DateTimeOffset RecordedAtUtc,
        double Latitude,
        double Longitude,
        double? SpeedKmh,
        double? CourseDegrees,
        double? AltitudeMeters,
        bool? IgnitionOn,
        string? SensorsJson);
}
