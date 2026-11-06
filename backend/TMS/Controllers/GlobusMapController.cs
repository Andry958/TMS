using System.Net;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TMS.Controllers;

[ApiController]
[Authorize]
[Route("api/globus")]
public sealed class GlobusMapController : ControllerBase
{
    private const int MaxDevicesPerPage = 200;
    private const int MaxConcurrentRequests = 4;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GlobusMapController> _logger;
    private readonly TMSDbContext _db;

    public GlobusMapController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GlobusMapController> logger,
        TMSDbContext db)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
        _db = db;
    }

    [HttpGet("devices")]
    public async Task<IActionResult> GetDevices(CancellationToken cancellationToken)
    {
        var token = _configuration["Globus:ApiToken"];
        if (string.IsNullOrWhiteSpace(token))
        {
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Globus API is not configured",
                detail: "Set the Globus:ApiToken server-side setting to load GPS devices.");
        }

        var apiBaseUri = GetApiBaseUri();
        if (apiBaseUri is null)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "Invalid Globus API configuration");
        }

        try
        {
            var devices = await GetPaginatedDataAsync(
                apiBaseUri, token, "devices", MaxDevicesPerPage, cancellationToken);

            return Ok(devices.Select(device => new
            {
                Id = device.TryGetProperty("id", out var id) ? id.Clone() : (JsonElement?)null,
                Serial = ReadString(device, "serial"),
                Name = ReadString(device, "name"),
                PlateNumber = ReadString(device, "plateNumber"),
                Status = ReadString(device, "status"),
                Model = ReadString(device, "model")
            }));
        }
        catch (GlobusApiException exception)
        {
            _logger.LogWarning(
                "Globus device-list request failed with status {StatusCode}.",
                (int)exception.StatusCode);
            return Problem(
                statusCode: exception.StatusCode == HttpStatusCode.TooManyRequests
                    ? StatusCodes.Status429TooManyRequests
                    : StatusCodes.Status502BadGateway,
                title: "Unable to load GPS devices from Globus",
                detail: exception.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden
                    ? "Check that the Globus API token has the devices:read permission."
                    : $"Globus API returned HTTP {(int)exception.StatusCode}.");
        }
    }

    [HttpGet("map-data")]
    public async Task<IActionResult> GetMapData(CancellationToken cancellationToken)
    {
        var token = _configuration["Globus:ApiToken"];
        if (string.IsNullOrWhiteSpace(token))
        {
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Globus API is not configured",
                detail: "Set the Globus:ApiToken server-side setting to enable the fleet map.");
        }

        var apiBaseUri = GetApiBaseUri();
        if (apiBaseUri is null)
        {
            _logger.LogError("The configured Globus API base URL is invalid.");
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "Invalid Globus API configuration");
        }

        try
        {
            using var concurrencyGate = new SemaphoreSlim(MaxConcurrentRequests);
            var devices = await GetPaginatedDataAsync(
                apiBaseUri, token, "devices", MaxDevicesPerPage, cancellationToken);

            var positionedDevicesTask = Task.WhenAll(devices.Select(async device =>
            {
                var serial = ReadString(device, "serial");
                var position = string.IsNullOrWhiteSpace(serial)
                    ? null
                    : await GetLatestTelemetryAsync(
                        apiBaseUri, token, serial, concurrencyGate, cancellationToken);

                return new { device, position };
            }));

            return Ok(new { devices = await positionedDevicesTask });
        }
        catch (GlobusApiException exception)
        {
            _logger.LogWarning(
                "Globus API request failed with status {StatusCode}.",
                (int)exception.StatusCode);

            var statusCode = exception.StatusCode == HttpStatusCode.TooManyRequests
                ? StatusCodes.Status429TooManyRequests
                : StatusCodes.Status502BadGateway;

            return Problem(
                statusCode: statusCode,
                title: "Unable to load fleet data from Globus",
                detail: exception.StatusCode == HttpStatusCode.Unauthorized ||
                        exception.StatusCode == HttpStatusCode.Forbidden
                    ? "Check the Globus API token and its devices:read and telemetry:read permissions."
                    : $"Globus API returned HTTP {(int)exception.StatusCode}.");
        }
    }

    [HttpGet("devices/{serial}/telemetry/count")]
    public async Task<IActionResult> GetDeviceTelemetryCount(
        string serial,
        CancellationToken cancellationToken)
    {
        var companyId = await GetCurrentCompanyIdAsync(cancellationToken);
        if (!companyId.HasValue)
        {
            return Forbid();
        }

        var count = await _db.GlobusTelemetryPoints.AsNoTracking().CountAsync(
            point => point.CompanyId == companyId.Value && point.DeviceSerial == serial,
            cancellationToken);
        return Ok(new { count });
    }

    private async Task<int?> GetCurrentCompanyIdAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await _db.Users.AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.CompanyId)
            .SingleOrDefaultAsync(cancellationToken);
    }

    [HttpGet("devices/{serial}/telemetry")]
    public async Task<IActionResult> GetDeviceTelemetry(
        string serial,
        [FromQuery] DateTimeOffset from,
        [FromQuery] DateTimeOffset to,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(serial) ||
            from == default ||
            to == default ||
            from >= to)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid telemetry time range",
                detail: "Specify a valid time range where the start precedes the end.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var companyId = string.IsNullOrWhiteSpace(userId)
            ? null
            : await _db.Users.AsNoTracking()
                .Where(user => user.Id == userId)
                .Select(user => user.CompanyId)
                .SingleOrDefaultAsync(cancellationToken);
        if (!companyId.HasValue)
        {
            return Forbid();
        }

        var deviceIsLinked = await _db.FleetVehicles.AsNoTracking().AnyAsync(
            vehicle => vehicle.CompanyId == companyId.Value &&
                       vehicle.GpsDeviceId != null &&
                       vehicle.GpsDeviceId.Trim() == serial.Trim(),
            cancellationToken);
        if (!deviceIsLinked)
        {
            return NotFound();
        }

        var rangeStart = from.ToUniversalTime();
        var rangeEnd = to.ToUniversalTime();
        var matchingPointsCount = await _db.GlobusTelemetryPoints.AsNoTracking().CountAsync(
            point => point.CompanyId == companyId.Value &&
                     point.DeviceSerial == serial &&
                     point.RecordedAtUtc >= rangeStart &&
                     point.RecordedAtUtc <= rangeEnd,
            cancellationToken);
        var sampleInterval = Math.Max(1, (int)Math.Ceiling(matchingPointsCount / 5000d));
        var query = _db.GlobusTelemetryPoints.FromSqlInterpolated($"""
            SELECT [Id], [CompanyId], [DeviceSerial], [RecordedAtUtc], [Latitude], [Longitude],
                   [SpeedKmh], [CourseDegrees], [AltitudeMeters], [IgnitionOn], [SensorsJson],
                   [CollectedAtUtc]
            FROM (
                SELECT *, ROW_NUMBER() OVER (ORDER BY [RecordedAtUtc]) AS [RowNumber],
                       COUNT_BIG(*) OVER () AS [TotalCount]
                FROM [GlobusTelemetryPoints]
                WHERE [CompanyId] = {companyId.Value}
                  AND [DeviceSerial] = {serial}
                  AND [RecordedAtUtc] >= {rangeStart}
                  AND [RecordedAtUtc] <= {rangeEnd}
            ) AS [SampledPoints]
            WHERE [RowNumber] % {sampleInterval} = 1 OR [RowNumber] = [TotalCount]
            """).AsNoTracking();

        var storedPoints = await query.OrderBy(point => point.RecordedAtUtc)
            .ToListAsync(cancellationToken);
        var points = storedPoints.Select(point =>
        {
            JsonElement? sensors = null;
            if (!string.IsNullOrWhiteSpace(point.SensorsJson))
            {
                using var sensorsDocument = JsonDocument.Parse(point.SensorsJson);
                sensors = sensorsDocument.RootElement.Clone();
            }

            return JsonSerializer.SerializeToElement(new
            {
                timestamp = point.RecordedAtUtc,
                lat = point.Latitude,
                lng = point.Longitude,
                speed = point.SpeedKmh,
                course = point.CourseDegrees,
                altitude = point.AltitudeMeters,
                ignition = point.IgnitionOn,
                sensors
            }, JsonOptions);
        });

        return Ok(points);
    }

    private Uri? GetApiBaseUri()
    {
        var baseUrl = _configuration["Globus:BaseUrl"] ?? "https://globus.cloudgps.online/api-v1";
        return Uri.TryCreate($"{baseUrl.TrimEnd('/')}/", UriKind.Absolute, out var apiBaseUri) &&
               (apiBaseUri.Scheme == Uri.UriSchemeHttps || apiBaseUri.IsLoopback)
            ? apiBaseUri
            : null;
    }

    private async Task<List<JsonElement>> GetPaginatedDataAsync(
        Uri apiBaseUri,
        string token,
        string endpoint,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var items = new List<JsonElement>();
        var page = 1;
        var totalPages = 1;

        do
        {
            using var document = await GetJsonAsync(
                apiBaseUri,
                token,
                $"{endpoint}?page={page}&limit={pageSize}",
                cancellationToken) ?? throw new InvalidOperationException("A Globus response was unexpectedly empty.");

            if (document.RootElement.TryGetProperty("data", out var data) &&
                data.ValueKind == JsonValueKind.Array)
            {
                items.AddRange(data.EnumerateArray().Select(item => item.Clone()));
            }

            if (document.RootElement.TryGetProperty("meta", out var meta) &&
                meta.TryGetProperty("totalPages", out var totalPagesElement) &&
                totalPagesElement.TryGetInt32(out var responseTotalPages))
            {
                totalPages = Math.Max(responseTotalPages, page);
            }

            page++;
        } while (page <= totalPages);

        return items;
    }

    private async Task<JsonElement?> GetLatestTelemetryAsync(
        Uri apiBaseUri,
        string token,
        string serial,
        SemaphoreSlim concurrencyGate,
        CancellationToken cancellationToken)
    {
        await concurrencyGate.WaitAsync(cancellationToken);
        try
        {
            using var document = await GetJsonAsync(
                apiBaseUri,
                token,
                $"devices/{Uri.EscapeDataString(serial)}/telemetry",
                cancellationToken,
                allowNotFound: true);

            if (document is null || !document.RootElement.TryGetProperty("data", out var data))
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

            return data.ValueKind == JsonValueKind.Object
                ? NormalizeTelemetry(data)
                : null;
        }
        finally
        {
            concurrencyGate.Release();
        }
    }

    private async Task<JsonDocument?> GetJsonAsync(
        Uri apiBaseUri,
        string token,
        string endpoint,
        CancellationToken cancellationToken,
        bool allowNotFound = false)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, new Uri(apiBaseUri, endpoint));
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var client = _httpClientFactory.CreateClient();
        using var response = await client.SendAsync(request, cancellationToken);
        if (allowNotFound && response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new GlobusApiException(response.StatusCode);
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonDocument.Parse(content, new JsonDocumentOptions());
    }

    private static string? ReadString(JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var property) &&
        property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;

    private static JsonElement NormalizeTelemetry(JsonElement telemetry)
    {
        var normalized = new JsonObject
        {
            ["timestamp"] = ReadString(telemetry, "timestamp"),
            ["lat"] = ReadNumber(telemetry, "lat", "latDeg", "mapLatDeg"),
            ["lng"] = ReadNumber(telemetry, "lng", "lon", "lonDeg", "mapLonDeg"),
            ["speed"] = ReadNumber(telemetry, "speed", "speedKmh"),
            ["course"] = ReadNumber(telemetry, "course", "courseDeg"),
            ["altitude"] = ReadNumber(telemetry, "altitude", "altitudeM"),
            ["ignition"] = ReadBoolean(telemetry, "ignition", "ignOn")
        };

        if (telemetry.TryGetProperty("sensors", out var sensors))
        {
            normalized["sensors"] = JsonNode.Parse(sensors.GetRawText());
        }
        else if (telemetry.TryGetProperty("sensorsMetric", out var sensorsMetric))
        {
            normalized["sensors"] = JsonNode.Parse(sensorsMetric.GetRawText());
        }

        return JsonSerializer.SerializeToElement(normalized, JsonOptions);
    }

    private static double? ReadNumber(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.Number &&
                property.TryGetDouble(out var value))
            {
                return value;
            }
        }

        return null;
    }

    private static bool? ReadBoolean(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var property))
            {
                if (property.ValueKind == JsonValueKind.True) return true;
                if (property.ValueKind == JsonValueKind.False) return false;
            }
        }

        return null;
    }

    private sealed class GlobusApiException(HttpStatusCode statusCode) : Exception
    {
        public HttpStatusCode StatusCode { get; } = statusCode;
    }
}
