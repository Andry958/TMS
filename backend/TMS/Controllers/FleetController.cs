using BusinessLogic.DTOs;
using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TMS.Controllers;

[ApiController]
[Authorize]
[Route("api/fleet")]
public sealed class FleetController : ControllerBase
{
    private const long MaxDocumentBytes = 20 * 1024 * 1024;
    private static readonly Dictionary<string, string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".pdf"] = "application/pdf",
        [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".doc"] = "application/msword",
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg"
    };

    private readonly TMSDbContext _db;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FleetController> _logger;

    public FleetController(TMSDbContext db, IWebHostEnvironment environment, ILogger<FleetController> logger)
    {
        _db = db;
        _environment = environment;
        _logger = logger;
    }

    private async Task<int?> GetCompanyIdAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userId is null
            ? null
            : await _db.Users.Where(user => user.Id == userId)
                .Select(user => user.CompanyId)
                .SingleOrDefaultAsync();
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles()
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();

        var vehicles = await _db.FleetVehicles.AsNoTracking()
            .Where(vehicle => vehicle.CompanyId == companyId.Value)
            .OrderBy(vehicle => vehicle.Plate)
            .Select(vehicle => new
            {
                vehicle.Id,
                vehicle.CompanyId,
                vehicle.Type,
                vehicle.Make,
                vehicle.Year,
                vehicle.Plate,
                vehicle.TrailerPlate,
                vehicle.Vin,
                Euro = vehicle.EuroClass,
                Body = vehicle.BodyType,
                vehicle.Status,
                vehicle.Division,
                vehicle.Mechanic,
                Mileage = vehicle.MileageKm,
                Capacity = vehicle.CapacityTons,
                Volume = vehicle.VolumeM3,
                Pallets = vehicle.PalletCapacity,
                Dimensions = vehicle.CargoDimensions,
                vehicle.DoorHeight,
                Tare = vehicle.TareKg,
                Gross = vehicle.GrossWeightKg,
                vehicle.Equipment,
                vehicle.RefrigerationType,
                vehicle.TemperatureRange,
                vehicle.TemperatureRecorder,
                vehicle.DoubleDeck,
                HydraulicLiftCapacity = vehicle.HydraulicLiftCapacityKg,
                Extras = vehicle.Extras,
                Customs = vehicle.CustomsApproval,
                Adr = vehicle.AdrClass,
                Gps = vehicle.GpsProvider,
                Imei = vehicle.GpsDeviceId,
                vehicle.CanBusStatus,
                Fuel = vehicle.FuelTankLitres,
                FuelLevel = vehicle.FuelLevelLitres,
                Adblue = vehicle.AdblueTankLitres,
                Consumption = vehicle.ConsumptionLitresPer100Km,
                vehicle.EQueueProfile,
                vehicle.TransitSystems,
                vehicle.TransitProfileId,
                vehicle.LastGpsUpdate,
                vehicle.NextServiceDate,
                NextServiceMileage = vehicle.NextServiceMileageKm,
                ServiceWorks = vehicle.PlannedServiceWorks,
                vehicle.TireAxles,
                vehicle.TireTread,
                vehicle.TireDetails,
                vehicle.RepairHistory,
                Ownership = vehicle.OwnershipType,
                vehicle.OwnershipDetails,
                vehicle.Lessor,
                vehicle.LeaseCost,
                vehicle.LeaseCurrency,
                CostPerKm = vehicle.CostPerKm,
                vehicle.CostCurrency,
                vehicle.CreatedAt,
                vehicle.UpdatedAt,
                CurrentDriver = vehicle.Assignments
                    .Where(assignment => assignment.EndedAt == null)
                    .Select(assignment => new { assignment.DriverId, assignment.Driver.FullName, assignment.StartedAt })
                    .FirstOrDefault(),
                AssignmentCount = vehicle.Assignments.Count
            })
            .ToListAsync();
        return Ok(vehicles);
    }

    [HttpGet("vehicles/{id:int}")]
    public async Task<IActionResult> GetVehicle(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var vehicle = await _db.FleetVehicles.AsNoTracking()
            .Where(item => item.Id == id && item.CompanyId == companyId.Value)
            .Select(item => new
            {
                item.Id,
                item.Type,
                item.Make,
                item.Year,
                item.Plate,
                item.TrailerPlate,
                item.Vin,
                Euro = item.EuroClass,
                Body = item.BodyType,
                item.Status,
                item.Division,
                item.Mechanic,
                Mileage = item.MileageKm,
                Capacity = item.CapacityTons,
                Volume = item.VolumeM3,
                Pallets = item.PalletCapacity,
                Dimensions = item.CargoDimensions,
                item.DoorHeight,
                Tare = item.TareKg,
                Gross = item.GrossWeightKg,
                item.Equipment,
                item.RefrigerationType,
                item.TemperatureRange,
                item.TemperatureRecorder,
                item.DoubleDeck,
                HydraulicLiftCapacity = item.HydraulicLiftCapacityKg,
                Extras = item.Extras,
                Customs = item.CustomsApproval,
                Adr = item.AdrClass,
                Gps = item.GpsProvider,
                Imei = item.GpsDeviceId,
                item.CanBusStatus,
                Fuel = item.FuelTankLitres,
                FuelLevel = item.FuelLevelLitres,
                Adblue = item.AdblueTankLitres,
                Consumption = item.ConsumptionLitresPer100Km,
                item.EQueueProfile,
                item.TransitSystems,
                item.TransitProfileId,
                item.LastGpsUpdate,
                item.NextServiceDate,
                NextServiceMileage = item.NextServiceMileageKm,
                ServiceWorks = item.PlannedServiceWorks,
                item.TireAxles,
                item.TireTread,
                item.TireDetails,
                item.RepairHistory,
                Ownership = item.OwnershipType,
                item.OwnershipDetails,
                item.Lessor,
                item.LeaseCost,
                item.LeaseCurrency,
                CostPerKm = item.CostPerKm,
                item.CostCurrency,
                CurrentDriver = item.Assignments
                    .Where(assignment => assignment.EndedAt == null)
                    .Select(assignment => new { assignment.DriverId, assignment.Driver.FullName, assignment.StartedAt })
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();
        return vehicle is null ? NotFound() : Ok(vehicle);
    }

    [HttpPost("vehicles")]
    public async Task<IActionResult> CreateVehicle([FromBody] FleetVehicleRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var validation = ValidateVehicle(request);
        if (validation is not null) return BadRequest(new { message = validation });
        if (await _db.FleetVehicles.AnyAsync(vehicle => vehicle.CompanyId == companyId.Value && vehicle.Plate == request.Plate.Trim()))
            return Conflict(new { message = "Транспортний засіб з таким номером уже існує." });

        var vehicle = new FleetVehicle { CompanyId = companyId.Value, CreatedAt = DateTime.UtcNow };
        ApplyVehicleRequest(vehicle, request);
        _db.FleetVehicles.Add(vehicle);
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            _logger.LogWarning(exception, "Duplicate vehicle plate while creating a fleet vehicle.");
            return Conflict(new { message = "Не вдалося створити транспортний засіб. Перевірте державний номер." });
        }
        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, new { vehicle.Id, vehicle.Plate });
    }

    [HttpPut("vehicles/{id:int}")]
    public async Task<IActionResult> UpdateVehicle(int id, [FromBody] FleetVehicleRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var validation = ValidateVehicle(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var vehicle = await _db.FleetVehicles.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (vehicle is null) return NotFound();
        if (await _db.FleetVehicles.AnyAsync(item => item.Id != id && item.CompanyId == companyId.Value && item.Plate == request.Plate.Trim()))
            return Conflict(new { message = "Транспортний засіб з таким номером уже існує." });
        ApplyVehicleRequest(vehicle, request);
        vehicle.UpdatedAt = DateTime.UtcNow;
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            _logger.LogWarning(exception, "Duplicate vehicle plate while updating vehicle {VehicleId}.", id);
            return Conflict(new { message = "Не вдалося зберегти транспортний засіб. Перевірте державний номер." });
        }
        return Ok(new { vehicle.Id, vehicle.Plate });
    }

    [HttpGet("vehicles/{vehicleId:int}/documents")]
    public async Task<IActionResult> GetVehicleDocuments(int vehicleId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!await _db.FleetVehicles.AnyAsync(vehicle => vehicle.Id == vehicleId && vehicle.CompanyId == companyId.Value))
            return NotFound();
        var documents = await _db.FleetVehicleDocuments.AsNoTracking()
            .Where(document => document.VehicleId == vehicleId)
            .OrderBy(document => document.ExpiryDate)
            .Select(document => new
            {
                document.Id,
                document.Type,
                document.Number,
                document.IssueDate,
                document.ExpiryDate,
                Comment = document.Comment,
                Files = document.Files.Select(file => new
                {
                    file.Id,
                    file.OriginalFileName,
                    file.ContentType,
                    file.SizeBytes,
                    file.UploadedAt
                }).ToList()
            }).ToListAsync();
        return Ok(documents);
    }

    [HttpPost("vehicles/{vehicleId:int}/documents")]
    public async Task<IActionResult> CreateVehicleDocument(int vehicleId, [FromBody] DriverDocumentRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!await _db.FleetVehicles.AnyAsync(vehicle => vehicle.Id == vehicleId && vehicle.CompanyId == companyId.Value))
            return NotFound();
        var validation = ValidateDriverDocument(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var document = new FleetVehicleDocument { VehicleId = vehicleId };
        ApplyVehicleDocument(document, request);
        _db.FleetVehicleDocuments.Add(document);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetVehicleDocuments), new { vehicleId }, new { document.Id });
    }

    [HttpPut("vehicles/{vehicleId:int}/documents/{documentId:int}")]
    public async Task<IActionResult> UpdateVehicleDocument(int vehicleId, int documentId, [FromBody] DriverDocumentRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.FleetVehicleDocuments.FirstOrDefaultAsync(item =>
            item.Id == documentId && item.VehicleId == vehicleId && item.Vehicle.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var validation = ValidateDriverDocument(request);
        if (validation is not null) return BadRequest(new { message = validation });
        ApplyVehicleDocument(document, request);
        await _db.SaveChangesAsync();
        return Ok(new { document.Id });
    }

    [HttpDelete("vehicles/{vehicleId:int}/documents/{documentId:int}")]
    public async Task<IActionResult> DeleteVehicleDocument(int vehicleId, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.FleetVehicleDocuments.Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == documentId && item.VehicleId == vehicleId &&
                item.Vehicle.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var storedNames = document.Files.Select(file => file.StorageFileName).ToList();
        _db.FleetVehicleDocuments.Remove(document);
        await _db.SaveChangesAsync();
        DeleteStoredFiles(storedNames);
        return NoContent();
    }

    [HttpPost("vehicles/{vehicleId:int}/documents/{documentId:int}/file")]
    [RequestSizeLimit(MaxDocumentBytes + 1024 * 1024)]
    public async Task<IActionResult> UploadVehicleDocumentFile(int vehicleId, int documentId, IFormFile? file)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.FleetVehicleDocuments.Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == documentId && item.VehicleId == vehicleId &&
                item.Vehicle.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var validation = await ValidateUploadAsync(file);
        if (validation is not null) return BadRequest(new { message = validation });
        var uploadedFile = file!;
        var extension = Path.GetExtension(uploadedFile.FileName).ToLowerInvariant();
        var storageName = $"{Guid.NewGuid():N}{extension}";
        var storagePath = GetStoragePath(storageName);
        Directory.CreateDirectory(Path.GetDirectoryName(storagePath)!);
        try
        {
            await using (var stream = new FileStream(storagePath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
                await uploadedFile.CopyToAsync(stream, HttpContext.RequestAborted);
            var previousNames = document.Files.Select(item => item.StorageFileName).ToList();
            _db.FleetVehicleDocumentFiles.RemoveRange(document.Files);
            var metadata = new FleetVehicleDocumentFile
            {
                VehicleDocumentId = document.Id,
                StorageFileName = storageName,
                OriginalFileName = Path.GetFileName(uploadedFile.FileName),
                ContentType = AllowedContentTypes[extension],
                SizeBytes = uploadedFile.Length,
                UploadedAt = DateTime.UtcNow
            };
            _db.FleetVehicleDocumentFiles.Add(metadata);
            await _db.SaveChangesAsync();
            DeleteStoredFiles(previousNames);
            return Ok(FileMetadata(metadata));
        }
        catch (Exception exception) when (exception is IOException or DbUpdateException or UnauthorizedAccessException)
        {
            _logger.LogError(exception, "Could not save vehicle document file {DocumentId}.", documentId);
            if (System.IO.File.Exists(storagePath)) System.IO.File.Delete(storagePath);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Не вдалося зберегти файл документа." });
        }
    }

    [HttpGet("vehicles/{vehicleId:int}/documents/{documentId:int}/file")]
    public async Task<IActionResult> GetVehicleDocumentFile(int vehicleId, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var file = await _db.FleetVehicleDocumentFiles.AsNoTracking()
            .Where(item => item.VehicleDocumentId == documentId && item.VehicleDocument.VehicleId == vehicleId &&
                item.VehicleDocument.Vehicle.CompanyId == companyId.Value)
            .OrderByDescending(item => item.UploadedAt)
            .FirstOrDefaultAsync();
        return file is null ? NotFound() : ServeDocumentFile(file.StorageFileName, file.OriginalFileName, file.ContentType);
    }

    [HttpDelete("vehicles/{vehicleId:int}/documents/{documentId:int}/file")]
    public async Task<IActionResult> DeleteVehicleDocumentFile(int vehicleId, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var file = await _db.FleetVehicleDocumentFiles.FirstOrDefaultAsync(item =>
            item.VehicleDocumentId == documentId && item.VehicleDocument.VehicleId == vehicleId &&
            item.VehicleDocument.Vehicle.CompanyId == companyId.Value);
        if (file is null) return NotFound();
        var storageName = file.StorageFileName;
        _db.FleetVehicleDocumentFiles.Remove(file);
        await _db.SaveChangesAsync();
        DeleteStoredFiles([storageName]);
        return NoContent();
    }

    [HttpDelete("vehicles/{id:int}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var vehicle = await _db.FleetVehicles.Include(item => item.Documents).ThenInclude(document => document.Files)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (vehicle is null) return NotFound();
        if (await _db.Trips.AnyAsync(trip => trip.VehicleId == id) ||
            await _db.VehicleDriverAssignments.AnyAsync(assignment => assignment.VehicleId == id))
            return Conflict(new { message = "Автомобіль має історію призначень або рейсів і не може бути видалений. Змініть його статус на «Неактивний»." });
        var storedNames = vehicle.Documents.SelectMany(document => document.Files).Select(file => file.StorageFileName).ToList();
        _db.FleetVehicleDocuments.RemoveRange(vehicle.Documents);
        _db.FleetVehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        DeleteStoredFiles(storedNames);
        return NoContent();
    }

    [HttpGet("drivers")]
    public async Task<IActionResult> GetDrivers([FromQuery] bool includeArchived = false)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var query = _db.Drivers.AsNoTracking().Where(driver => driver.CompanyId == companyId.Value);
        if (!includeArchived) query = query.Where(driver => !driver.IsArchived);
        var drivers = await query.OrderBy(driver => driver.FullName).Select(driver => new
        {
            driver.Id,
            driver.FullName,
            driver.Phone,
            driver.Email,
            driver.AdditionalContact,
            driver.Notes,
            driver.IsArchived,
            CurrentVehicle = driver.Assignments.Where(assignment => assignment.EndedAt == null)
                .Select(assignment => new { assignment.VehicleId, assignment.Vehicle.Plate, assignment.Vehicle.Make, assignment.StartedAt })
                .FirstOrDefault(),
            DocumentCount = driver.Documents.Count,
            TripCount = driver.Trips.Count
        }).ToListAsync();
        return Ok(drivers);
    }

    [HttpGet("drivers/{id:int}")]
    public async Task<IActionResult> GetDriver(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var driver = await _db.Drivers.AsNoTracking()
            .Where(item => item.Id == id && item.CompanyId == companyId.Value)
            .Select(item => new
            {
                item.Id,
                item.FullName,
                item.Phone,
                item.Email,
                item.AdditionalContact,
                item.Notes,
                item.IsArchived,
                CurrentVehicle = item.Assignments.Where(assignment => assignment.EndedAt == null)
                    .Select(assignment => new { assignment.VehicleId, assignment.Vehicle.Plate, assignment.Vehicle.Make, assignment.StartedAt })
                    .FirstOrDefault()
            }).FirstOrDefaultAsync();
        return driver is null ? NotFound() : Ok(driver);
    }

    [HttpPost("drivers")]
    public async Task<IActionResult> CreateDriver([FromBody] DriverRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var validation = ValidateDriver(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var driver = new Driver { CompanyId = companyId.Value, CreatedAt = DateTime.UtcNow };
        ApplyDriverRequest(driver, request);
        _db.Drivers.Add(driver);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDriver), new { id = driver.Id }, new { driver.Id, driver.FullName });
    }

    [HttpPut("drivers/{id:int}")]
    public async Task<IActionResult> UpdateDriver(int id, [FromBody] DriverRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var validation = ValidateDriver(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var driver = await _db.Drivers.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (driver is null) return NotFound();
        ApplyDriverRequest(driver, request);
        driver.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { driver.Id, driver.FullName });
    }

    [HttpPut("drivers/{id:int}/archive")]
    public async Task<IActionResult> SetDriverArchived(int id, [FromQuery] bool archived)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var driver = await _db.Drivers.FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (driver is null) return NotFound();
        if (archived && await _db.VehicleDriverAssignments.AnyAsync(assignment =>
                assignment.DriverId == id && assignment.CompanyId == companyId.Value && assignment.EndedAt == null))
            return Conflict(new { message = "Перед архівуванням завершіть або змініть поточне призначення водія на автомобіль." });
        driver.IsArchived = archived;
        driver.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { driver.Id, driver.IsArchived });
    }

    [HttpGet("drivers/{id:int}/history")]
    public async Task<IActionResult> GetDriverHistory(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!await _db.Drivers.AnyAsync(driver => driver.Id == id && driver.CompanyId == companyId.Value)) return NotFound();
        var assignments = await _db.VehicleDriverAssignments.AsNoTracking()
            .Where(assignment => assignment.DriverId == id && assignment.CompanyId == companyId.Value)
            .OrderByDescending(assignment => assignment.StartedAt)
            .Select(assignment => new
            {
                assignment.Id,
                assignment.VehicleId,
                Vehicle = assignment.Vehicle.Plate,
                assignment.StartedAt,
                assignment.EndedAt,
                assignment.ChangeReason
            }).ToListAsync();
        var trips = await _db.Trips.AsNoTracking()
            .Where(trip => trip.DriverId == id && trip.CompanyId == companyId.Value)
            .OrderByDescending(trip => trip.PlannedStartAt ?? trip.CreatedAt)
            .Include(trip => trip.Vehicle)
            .Include(trip => trip.Driver)
            .Include(trip => trip.Points)
            .Include(trip => trip.Expenses)
            .ToListAsync();
        return Ok(new { assignments, trips = trips.Select(trip => ToTripResponse(trip, false)) });
    }

    [HttpGet("drivers/{driverId:int}/documents")]
    public async Task<IActionResult> GetDriverDocuments(int driverId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!await _db.Drivers.AnyAsync(driver => driver.Id == driverId && driver.CompanyId == companyId.Value)) return NotFound();
        var documents = await _db.DriverDocuments.AsNoTracking()
            .Where(document => document.DriverId == driverId)
            .OrderBy(document => document.ExpiryDate)
            .Select(document => new
            {
                document.Id,
                document.Type,
                document.Number,
                document.IssueDate,
                document.ExpiryDate,
                document.Comment,
                Files = document.Files.Select(file => new
                {
                    file.Id,
                    file.OriginalFileName,
                    file.ContentType,
                    file.SizeBytes,
                    file.UploadedAt
                }).ToList()
            }).ToListAsync();
        return Ok(documents);
    }

    [HttpPost("drivers/{driverId:int}/documents")]
    public async Task<IActionResult> CreateDriverDocument(int driverId, [FromBody] DriverDocumentRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var driver = await _db.Drivers.FirstOrDefaultAsync(item => item.Id == driverId && item.CompanyId == companyId.Value);
        if (driver is null) return NotFound();
        var validation = ValidateDriverDocument(request);
        if (validation is not null) return BadRequest(new { message = validation });
        var document = new DriverDocument { DriverId = driverId };
        ApplyDriverDocument(document, request);
        _db.DriverDocuments.Add(document);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDriverDocuments), new { driverId }, new { document.Id });
    }

    [HttpPut("drivers/{driverId:int}/documents/{documentId:int}")]
    public async Task<IActionResult> UpdateDriverDocument(int driverId, int documentId, [FromBody] DriverDocumentRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.DriverDocuments.FirstOrDefaultAsync(item =>
            item.Id == documentId && item.DriverId == driverId && item.Driver.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var validation = ValidateDriverDocument(request);
        if (validation is not null) return BadRequest(new { message = validation });
        ApplyDriverDocument(document, request);
        await _db.SaveChangesAsync();
        return Ok(new { document.Id });
    }

    [HttpDelete("drivers/{driverId:int}/documents/{documentId:int}")]
    public async Task<IActionResult> DeleteDriverDocument(int driverId, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.DriverDocuments
            .Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == documentId && item.DriverId == driverId && item.Driver.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var storageNames = document.Files.Select(file => file.StorageFileName).ToList();
        _db.DriverDocuments.Remove(document);
        await _db.SaveChangesAsync();
        DeleteStoredFiles(storageNames);
        return NoContent();
    }

    [HttpPost("drivers/{driverId:int}/documents/{documentId:int}/file")]
    [RequestSizeLimit(MaxDocumentBytes + 1024 * 1024)]
    public async Task<IActionResult> UploadDriverDocumentFile(int driverId, int documentId, IFormFile? file)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var document = await _db.DriverDocuments.Include(item => item.Files)
            .FirstOrDefaultAsync(item => item.Id == documentId && item.DriverId == driverId && item.Driver.CompanyId == companyId.Value);
        if (document is null) return NotFound();
        var validation = await ValidateUploadAsync(file);
        if (validation is not null) return BadRequest(new { message = validation });

        var uploadedFile = file!;
        var extension = Path.GetExtension(uploadedFile.FileName).ToLowerInvariant();
        var storageName = $"{Guid.NewGuid():N}{extension}";
        var storagePath = GetStoragePath(storageName);
        Directory.CreateDirectory(Path.GetDirectoryName(storagePath)!);
        try
        {
            await using (var stream = new FileStream(storagePath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
                await uploadedFile.CopyToAsync(stream, HttpContext.RequestAborted);

            var previousNames = document.Files.Select(item => item.StorageFileName).ToList();
            _db.DriverDocumentFiles.RemoveRange(document.Files);
            var metadata = new DriverDocumentFile
            {
                DriverDocumentId = document.Id,
                StorageFileName = storageName,
                OriginalFileName = Path.GetFileName(uploadedFile.FileName),
                ContentType = AllowedContentTypes[extension],
                SizeBytes = uploadedFile.Length,
                UploadedAt = DateTime.UtcNow
            };
            _db.DriverDocumentFiles.Add(metadata);
            await _db.SaveChangesAsync();
            DeleteStoredFiles(previousNames);
            return Ok(FileMetadata(metadata));
        }
        catch (Exception exception) when (exception is IOException or DbUpdateException or UnauthorizedAccessException)
        {
            _logger.LogError(exception, "Could not save driver document file {DocumentId}.", documentId);
            if (System.IO.File.Exists(storagePath)) System.IO.File.Delete(storagePath);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Не вдалося зберегти файл документа." });
        }
    }

    [HttpGet("drivers/{driverId:int}/documents/{documentId:int}/file")]
    public async Task<IActionResult> GetDriverDocumentFile(int driverId, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var metadata = await _db.DriverDocumentFiles.AsNoTracking()
            .Where(file => file.DriverDocumentId == documentId &&
                file.DriverDocument.DriverId == driverId &&
                file.DriverDocument.Driver.CompanyId == companyId.Value)
            .OrderByDescending(file => file.UploadedAt)
            .FirstOrDefaultAsync();
        return metadata is null
            ? NotFound()
            : ServeDocumentFile(metadata.StorageFileName, metadata.OriginalFileName, metadata.ContentType);
    }

    [HttpDelete("drivers/{driverId:int}/documents/{documentId:int}/file")]
    public async Task<IActionResult> DeleteDriverDocumentFile(int driverId, int documentId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var file = await _db.DriverDocumentFiles.FirstOrDefaultAsync(item =>
            item.DriverDocumentId == documentId && item.DriverDocument.DriverId == driverId &&
            item.DriverDocument.Driver.CompanyId == companyId.Value);
        if (file is null) return NotFound();
        var storageName = file.StorageFileName;
        _db.DriverDocumentFiles.Remove(file);
        await _db.SaveChangesAsync();
        DeleteStoredFiles([storageName]);
        return NoContent();
    }

    [HttpGet("vehicles/{vehicleId:int}/assignment")]
    public async Task<IActionResult> GetVehicleAssignments(int vehicleId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!await _db.FleetVehicles.AnyAsync(vehicle => vehicle.Id == vehicleId && vehicle.CompanyId == companyId.Value))
            return NotFound();
        var assignments = await _db.VehicleDriverAssignments.AsNoTracking()
            .Where(assignment => assignment.VehicleId == vehicleId && assignment.CompanyId == companyId.Value)
            .OrderByDescending(assignment => assignment.StartedAt)
            .Select(assignment => new
            {
                assignment.Id,
                assignment.DriverId,
                Driver = assignment.Driver.FullName,
                assignment.StartedAt,
                assignment.EndedAt,
                assignment.ChangeReason
            }).ToListAsync();
        return Ok(assignments);
    }

    [HttpPut("vehicles/{vehicleId:int}/assignment")]
    public async Task<IActionResult> AssignDriver(int vehicleId, [FromBody] VehicleAssignmentRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (request.DriverId <= 0) return BadRequest(new { message = "Оберіть водія." });
        var now = DateTime.UtcNow;
        await using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        var vehicle = await _db.FleetVehicles.FirstOrDefaultAsync(item =>
            item.Id == vehicleId && item.CompanyId == companyId.Value);
        if (vehicle is null) return NotFound();
        if (vehicle.Status == "Неактивний") return Conflict(new { message = "Неактивному автомобілю не можна призначити водія." });
        var driver = await _db.Drivers.FirstOrDefaultAsync(item =>
            item.Id == request.DriverId && item.CompanyId == companyId.Value && !item.IsArchived);
        if (driver is null) return BadRequest(new { message = "Водія не знайдено або він архівований." });
        var current = await _db.VehicleDriverAssignments.FirstOrDefaultAsync(assignment =>
            assignment.VehicleId == vehicleId && assignment.CompanyId == companyId.Value && assignment.EndedAt == null);
        if (current?.DriverId == driver.Id) return Conflict(new { message = "Цей водій уже закріплений за автомобілем." });
        var conflictingAssignments = await _db.VehicleDriverAssignments
            .Where(assignment => assignment.DriverId == driver.Id
                && assignment.CompanyId == companyId.Value
                && assignment.EndedAt == null
                && assignment.VehicleId != vehicleId)
            .ToListAsync();
        foreach (var conflictingAssignment in conflictingAssignments)
        {
            conflictingAssignment.EndedAt = now;
            conflictingAssignment.ChangeReason = "Переміщення водія до іншого автомобіля";
        }
        var startedAt = request.StartedAt?.ToUniversalTime() ?? now;
        if (startedAt > now.AddMinutes(5)) return BadRequest(new { message = "Дата початку призначення не може бути в майбутньому." });
        if (current is not null)
        {
            if (startedAt < current.StartedAt) return BadRequest(new { message = "Дата початку нового призначення передує поточному призначенню." });
            current.EndedAt = startedAt;
            current.ChangeReason = request.ChangeReason?.Trim();
        }
        _db.VehicleDriverAssignments.Add(new VehicleDriverAssignment
        {
            CompanyId = companyId.Value,
            VehicleId = vehicleId,
            DriverId = driver.Id,
            StartedAt = startedAt,
            ChangeReason = request.ChangeReason?.Trim()
        });
        try
        {
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException exception)
        {
            _logger.LogWarning(exception, "Conflicting driver assignment for vehicle {VehicleId}.", vehicleId);
            return Conflict(new { message = "Призначення конфліктує з іншим активним призначенням." });
        }
        return Ok(new { vehicleId, driver.Id, driver.FullName, StartedAt = startedAt });
    }

    [HttpDelete("vehicles/{vehicleId:int}/assignment")]
    public async Task<IActionResult> UnassignDriver(int vehicleId, [FromQuery] string? reason)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var current = await _db.VehicleDriverAssignments.FirstOrDefaultAsync(assignment =>
            assignment.VehicleId == vehicleId && assignment.CompanyId == companyId.Value && assignment.EndedAt == null);
        if (current is null) return NotFound(new { message = "У автомобіля немає поточного призначення." });
        current.EndedAt = DateTime.UtcNow;
        current.ChangeReason = reason?.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("vehicles/{vehicleId:int}/trips")]
    public async Task<IActionResult> GetVehicleTrips(int vehicleId)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        if (!await _db.FleetVehicles.AnyAsync(vehicle => vehicle.Id == vehicleId && vehicle.CompanyId == companyId.Value))
            return NotFound();
        var trips = await _db.Trips.AsNoTracking()
            .Where(trip => trip.VehicleId == vehicleId && trip.CompanyId == companyId.Value)
            .OrderByDescending(trip => trip.PlannedStartAt ?? trip.CreatedAt)
            .Include(trip => trip.Vehicle)
            .Include(trip => trip.Driver)
            .Include(trip => trip.Points)
            .Include(trip => trip.Expenses)
            .ToListAsync();
        return Ok(trips.Select(trip => ToTripResponse(trip, true)));
    }

    [HttpGet("trips/{id:int}")]
    public async Task<IActionResult> GetTrip(int id)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var trip = await _db.Trips.AsNoTracking()
            .Include(item => item.Vehicle)
            .Include(item => item.Driver)
            .Include(item => item.Points)
            .Include(item => item.Expenses)
            .Where(item => item.Id == id && item.CompanyId == companyId.Value)
            .FirstOrDefaultAsync();
        return trip is null ? NotFound() : Ok(ToTripResponse(trip, true));
    }

    [HttpPost("vehicles/{vehicleId:int}/trips")]
    public async Task<IActionResult> CreateTrip(int vehicleId, [FromBody] TripRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var vehicle = await _db.FleetVehicles.FirstOrDefaultAsync(item => item.Id == vehicleId && item.CompanyId == companyId.Value);
        if (vehicle is null) return NotFound();
        var validation = await ValidateTripRequest(request, companyId.Value, vehicle);
        if (validation is not null) return BadRequest(new { message = validation });
        var trip = new Trip { CompanyId = companyId.Value, VehicleId = vehicleId, CreatedAt = DateTime.UtcNow };
        ApplyTripRequest(trip, request);
        _db.Trips.Add(trip);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, new { trip.Id });
    }

    [HttpPut("trips/{id:int}")]
    public async Task<IActionResult> UpdateTrip(int id, [FromBody] TripRequest request)
    {
        var companyId = await GetCompanyIdAsync();
        if (!companyId.HasValue) return Forbid();
        var trip = await _db.Trips.Include(item => item.Points).Include(item => item.Expenses)
            .FirstOrDefaultAsync(item => item.Id == id && item.CompanyId == companyId.Value);
        if (trip is null) return NotFound();
        var vehicle = await _db.FleetVehicles.FirstAsync(item => item.Id == trip.VehicleId && item.CompanyId == companyId.Value);
        var validation = await ValidateTripRequest(request, companyId.Value, vehicle, trip.DriverId);
        if (validation is not null) return BadRequest(new { message = validation });
        var previousPoints = trip.Points.ToList();
        var previousExpenses = trip.Expenses.ToList();
        ApplyTripRequest(trip, request);
        trip.UpdatedAt = DateTime.UtcNow;
        _db.TripPoints.RemoveRange(previousPoints);
        _db.TripExpenses.RemoveRange(previousExpenses);
        await _db.SaveChangesAsync();
        return Ok(new { trip.Id });
    }

    private static TripResponse ToTripResponse(Trip trip, bool includeDetails) => new()
    {
        Id = trip.Id,
        VehicleId = trip.VehicleId,
        VehiclePlate = trip.Vehicle.Plate,
        DriverId = trip.DriverId,
        DriverName = trip.Driver.FullName,
        Title = trip.Title,
        Description = trip.Description,
        Status = trip.Status,
        PlannedStartAt = trip.PlannedStartAt,
        PlannedEndAt = trip.PlannedEndAt,
        ActualStartAt = trip.ActualStartAt,
        ActualEndAt = trip.ActualEndAt,
        IssuedAmount = trip.IssuedAmount,
        TotalExpenses = trip.Expenses.Sum(expense => expense.Amount),
        Balance = trip.IssuedAmount - trip.Expenses.Sum(expense => expense.Amount),
        Currency = trip.Currency,
        StartOdometerKm = trip.StartOdometerKm,
        EndOdometerKm = trip.EndOdometerKm,
        MileageKm = trip.StartOdometerKm.HasValue && trip.EndOdometerKm.HasValue
            ? trip.EndOdometerKm.Value - trip.StartOdometerKm.Value
            : null,
        Points = includeDetails ? trip.Points.OrderBy(point => point.Order).Select(point => new TripPointResponse
        {
            Id = point.Id,
            Order = point.Order,
            Type = point.Type,
            Address = point.Address,
            ArrivalAt = point.ArrivalAt,
            Comment = point.Comment
        }).ToList() : null,
        Expenses = includeDetails ? trip.Expenses.OrderBy(expense => expense.SpentAt).Select(expense => new TripExpenseResponse
        {
            Id = expense.Id,
            Amount = expense.Amount,
            SpentAt = expense.SpentAt,
            Description = expense.Description,
            Category = expense.Category
        }).ToList() : null
    };

    private async Task<string?> ValidateTripRequest(
        TripRequest request,
        int companyId,
        FleetVehicle vehicle,
        int? existingTripDriverId = null)
    {
        if (request.DriverId <= 0 || string.IsNullOrWhiteSpace(request.Title))
            return "Вкажіть водія та назву рейсу.";
        if (request.Points is null || request.Expenses is null)
            return "Список точок маршруту та витрат має бути переданий у запиті.";
        if (!await _db.Drivers.AnyAsync(driver =>
                driver.Id == request.DriverId && driver.CompanyId == companyId &&
                (!driver.IsArchived || driver.Id == existingTripDriverId)))
            return "Водія не знайдено або він архівований.";
        var allowedStatuses = new[] { "Запланований", "У процесі", "Завершений", "Скасований" };
        if (!allowedStatuses.Contains(request.Status)) return "Невідомий статус рейсу.";
        if (request.IssuedAmount < 0) return "Видана сума не може бути від'ємною.";
        if (request.EndOdometerKm.HasValue && !request.StartOdometerKm.HasValue)
            return "Вкажіть початковий одометр перед кінцевим.";
        if (request.StartOdometerKm < 0 || request.EndOdometerKm < 0 ||
            (request.StartOdometerKm.HasValue && request.EndOdometerKm.HasValue && request.EndOdometerKm < request.StartOdometerKm))
            return "Показники одометра некоректні: кілометраж не може бути від'ємним.";
        if (request.PlannedStartAt.HasValue && request.PlannedEndAt.HasValue && request.PlannedEndAt < request.PlannedStartAt)
            return "Дата завершення рейсу передує даті початку.";
        if (request.ActualStartAt.HasValue && request.ActualEndAt.HasValue && request.ActualEndAt < request.ActualStartAt)
            return "Фактична дата завершення передує початку.";
        if (request.Points.Any(point => point is null || point.Order < 0 || string.IsNullOrWhiteSpace(point.Type) ||
            string.IsNullOrWhiteSpace(point.Address)))
            return "Кожна точка маршруту має містити тип, адресу та невід'ємний порядок.";
        if (request.Points.Select(point => point.Order).Distinct().Count() != request.Points.Count)
            return "Порядок точок маршруту не може повторюватися.";
        var allowedPointTypes = new[] { "Початок рейсу", "Довантаження", "Дорозвантаження", "Розвантаження", "Гараж" };
        if (request.Points.Any(point => !allowedPointTypes.Contains(point.Type)))
            return "Невідомий тип точки маршруту.";
        if (request.Expenses.Any(expense => expense is null || expense.Amount <= 0 || string.IsNullOrWhiteSpace(expense.Description)))
            return "Кожна витрата має містити позитивну суму й опис.";
        if (string.IsNullOrWhiteSpace(request.Currency) || request.Currency.Length > 20)
            return "Вкажіть коректний код валюти (до 20 символів).";
        if (vehicle.Status == "Неактивний" && request.Status != "Завершений" && request.Status != "Скасований")
            return "Для неактивного автомобіля не можна створити або продовжити рейс.";
        return null;
    }

    private static void ApplyTripRequest(Trip trip, TripRequest request)
    {
        trip.DriverId = request.DriverId;
        trip.Title = request.Title.Trim();
        trip.Description = request.Description?.Trim();
        trip.Status = request.Status;
        trip.PlannedStartAt = request.PlannedStartAt;
        trip.PlannedEndAt = request.PlannedEndAt;
        trip.ActualStartAt = request.ActualStartAt;
        trip.ActualEndAt = request.ActualEndAt;
        if (request.Status == "У процесі" && !trip.ActualStartAt.HasValue)
            trip.ActualStartAt = DateTime.UtcNow;
        if ((request.Status is "Завершений" or "Скасований") && !trip.ActualEndAt.HasValue)
            trip.ActualEndAt = DateTime.UtcNow;
        trip.IssuedAmount = request.IssuedAmount;
        trip.Currency = request.Currency.Trim().ToUpperInvariant();
        trip.StartOdometerKm = request.StartOdometerKm;
        trip.EndOdometerKm = request.EndOdometerKm;
        trip.Points = request.Points.OrderBy(point => point.Order).Select(point => new TripPoint
        {
            Order = point.Order,
            Type = point.Type.Trim(),
            Address = point.Address.Trim(),
            ArrivalAt = point.ArrivalAt,
            Comment = point.Comment?.Trim()
        }).ToList();
        trip.Expenses = request.Expenses.Select(expense => new TripExpense
        {
            Amount = expense.Amount,
            SpentAt = expense.SpentAt,
            Description = expense.Description.Trim(),
            Category = expense.Category?.Trim()
        }).ToList();
    }

    private static object FileMetadata(DriverDocumentFile file) => new
    {
        file.Id,
        file.OriginalFileName,
        file.ContentType,
        file.SizeBytes,
        file.UploadedAt
    };

    private static object FileMetadata(FleetVehicleDocumentFile file) => new
    {
        file.Id,
        file.OriginalFileName,
        file.ContentType,
        file.SizeBytes,
        file.UploadedAt
    };

    private static string? ValidateVehicle(FleetVehicleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Type) || string.IsNullOrWhiteSpace(request.Make) ||
            string.IsNullOrWhiteSpace(request.Plate))
            return "Тип ТЗ, марка та державний номер є обов'язковими.";
        if (request.Year is < 1950 or > 2100) return "Рік випуску має бути між 1950 та 2100.";
        if (request.MileageKm < 0 || request.CapacityTons < 0 || request.VolumeM3 < 0 ||
            request.TareKg < 0 || request.GrossWeightKg < 0 || request.HydraulicLiftCapacityKg < 0 ||
            request.FuelTankLitres < 0 || request.FuelLevelLitres < 0 || request.AdblueTankLitres < 0 ||
            request.ConsumptionLitresPer100Km < 0 || request.NextServiceMileageKm < 0 ||
            request.LeaseCost < 0 || request.CostPerKm < 0)
            return "Числові параметри транспортного засобу не можуть бути від'ємними.";
        var statuses = new[] { "На базі", "У рейсі", "В ремонті", "Неактивний" };
        if (!statuses.Contains(request.Status)) return "Невідомий статус транспортного засобу.";
        if (request.FuelTankLitres.HasValue && request.FuelLevelLitres > request.FuelTankLitres)
            return "Залишок пального перевищує об'єм бака.";
        return null;
    }

    private static void ApplyVehicleRequest(FleetVehicle vehicle, FleetVehicleRequest request)
    {
        vehicle.Type = request.Type.Trim();
        vehicle.Make = request.Make.Trim();
        vehicle.Year = request.Year;
        vehicle.Plate = request.Plate.Trim().ToUpperInvariant();
        vehicle.TrailerPlate = Clean(request.TrailerPlate);
        vehicle.Vin = Clean(request.Vin);
        vehicle.EuroClass = Clean(request.EuroClass);
        vehicle.BodyType = Clean(request.BodyType);
        vehicle.Status = request.Status;
        vehicle.Division = Clean(request.Division);
        vehicle.Mechanic = Clean(request.Mechanic);
        vehicle.MileageKm = request.MileageKm;
        vehicle.CapacityTons = request.CapacityTons;
        vehicle.VolumeM3 = request.VolumeM3;
        vehicle.PalletCapacity = request.PalletCapacity;
        vehicle.CargoDimensions = Clean(request.CargoDimensions);
        vehicle.DoorHeight = Clean(request.DoorHeight);
        vehicle.TareKg = request.TareKg;
        vehicle.GrossWeightKg = request.GrossWeightKg;
        vehicle.Equipment = Clean(request.Equipment);
        vehicle.RefrigerationType = Clean(request.RefrigerationType);
        vehicle.TemperatureRange = Clean(request.TemperatureRange);
        vehicle.TemperatureRecorder = Clean(request.TemperatureRecorder);
        vehicle.DoubleDeck = Clean(request.DoubleDeck);
        vehicle.HydraulicLiftCapacityKg = request.HydraulicLiftCapacityKg;
        vehicle.Extras = Clean(request.Extras);
        vehicle.CustomsApproval = Clean(request.CustomsApproval);
        vehicle.AdrClass = Clean(request.AdrClass);
        vehicle.GpsProvider = Clean(request.GpsProvider);
        vehicle.GpsDeviceId = Clean(request.GpsDeviceId);
        vehicle.CanBusStatus = Clean(request.CanBusStatus);
        vehicle.FuelTankLitres = request.FuelTankLitres;
        vehicle.FuelLevelLitres = request.FuelLevelLitres;
        vehicle.AdblueTankLitres = request.AdblueTankLitres;
        vehicle.ConsumptionLitresPer100Km = request.ConsumptionLitresPer100Km;
        vehicle.EQueueProfile = Clean(request.EQueueProfile);
        vehicle.TransitSystems = Clean(request.TransitSystems);
        vehicle.TransitProfileId = Clean(request.TransitProfileId);
        vehicle.LastGpsUpdate = Clean(request.LastGpsUpdate);
        vehicle.NextServiceDate = request.NextServiceDate;
        vehicle.NextServiceMileageKm = request.NextServiceMileageKm;
        vehicle.PlannedServiceWorks = Clean(request.PlannedServiceWorks);
        vehicle.TireAxles = Clean(request.TireAxles);
        vehicle.TireTread = Clean(request.TireTread);
        vehicle.TireDetails = Clean(request.TireDetails);
        vehicle.RepairHistory = Clean(request.RepairHistory);
        vehicle.OwnershipType = Clean(request.OwnershipType);
        vehicle.OwnershipDetails = Clean(request.OwnershipDetails);
        vehicle.Lessor = Clean(request.Lessor);
        vehicle.LeaseCost = request.LeaseCost;
        vehicle.LeaseCurrency = Clean(request.LeaseCurrency);
        vehicle.CostPerKm = request.CostPerKm;
        vehicle.CostCurrency = Clean(request.CostCurrency);
    }

    private static string? ValidateDriver(DriverRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Phone))
            return "ПІБ і телефон водія є обов'язковими.";
        if (!string.IsNullOrWhiteSpace(request.Email) && !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(request.Email))
            return "Перевірте формат електронної адреси.";
        return null;
    }

    private static void ApplyDriverRequest(Driver driver, DriverRequest request)
    {
        driver.FullName = request.FullName.Trim();
        driver.Phone = request.Phone.Trim();
        driver.Email = Clean(request.Email);
        driver.AdditionalContact = Clean(request.AdditionalContact);
        driver.Notes = Clean(request.Notes);
    }

    private static string? ValidateDriverDocument(DriverDocumentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Type)) return "Тип документа є обов'язковим.";
        if (request.IssueDate.HasValue && request.ExpiryDate.HasValue && request.ExpiryDate < request.IssueDate)
            return "Дата закінчення дії передує даті видачі.";
        return null;
    }

    private static void ApplyDriverDocument(DriverDocument document, DriverDocumentRequest request)
    {
        document.Type = request.Type.Trim();
        document.Number = Clean(request.Number);
        document.IssueDate = request.IssueDate;
        document.ExpiryDate = request.ExpiryDate;
        document.Comment = Clean(request.Comment);
    }

    private static void ApplyVehicleDocument(FleetVehicleDocument document, DriverDocumentRequest request)
    {
        document.Type = request.Type.Trim();
        document.Number = Clean(request.Number);
        document.IssueDate = request.IssueDate;
        document.ExpiryDate = request.ExpiryDate;
        document.Comment = Clean(request.Comment);
    }

    private async Task<string?> ValidateUploadAsync(IFormFile? file)
    {
        if (file is null || file.Length == 0) return "Оберіть файл.";
        if (file.Length > MaxDocumentBytes) return "Розмір файлу не може перевищувати 20 МБ.";
        var extension = Path.GetExtension(file.FileName);
        if (!AllowedContentTypes.TryGetValue(extension, out var contentType))
            return "Підтримуються PDF, DOC, DOCX, PNG та JPEG.";
        if (!string.IsNullOrWhiteSpace(file.ContentType) && file.ContentType != "application/octet-stream" &&
            !string.Equals(file.ContentType, contentType, StringComparison.OrdinalIgnoreCase))
            return "Тип вмісту файлу не відповідає його розширенню.";
        await using var stream = file.OpenReadStream();
        var header = new byte[8];
        var read = await stream.ReadAsync(header.AsMemory(0, header.Length), HttpContext.RequestAborted);
        var valid = extension.ToLowerInvariant() switch
        {
            ".pdf" => read >= 4 && header.AsSpan(0, 4).SequenceEqual("%PDF"u8),
            ".png" => read >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".jpg" or ".jpeg" => read >= 3 && header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff,
            ".docx" => read >= 4 && header[0] == 0x50 && header[1] == 0x4b,
            ".doc" => read >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1 }),
            _ => false
        };
        return valid ? null : "Вміст файлу не відповідає дозволеному формату.";
    }

    private string GetStoragePath(string fileName)
    {
        if (Path.GetFileName(fileName) != fileName) throw new InvalidOperationException("Invalid storage file name.");
        return Path.Combine(_environment.ContentRootPath, "App_Data", "DriverDocuments", fileName);
    }

    private IActionResult ServeDocumentFile(string storageFileName, string originalFileName, string contentType)
    {
        var path = GetStoragePath(storageFileName);
        if (!System.IO.File.Exists(path)) return NotFound(new { message = "Файл не знайдений у сховищі." });
        var inline = contentType is "application/pdf" or "image/png" or "image/jpeg";
        var disposition = new ContentDispositionHeaderValue(inline ? "inline" : "attachment");
        disposition.SetHttpFileName(Path.GetFileName(originalFileName));
        Response.Headers.ContentDisposition = disposition.ToString();
        return PhysicalFile(path, contentType, enableRangeProcessing: inline);
    }

    private void DeleteStoredFiles(IEnumerable<string> names)
    {
        foreach (var name in names)
        {
            try
            {
                var path = GetStoragePath(name);
                if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
            }
            catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
            {
                _logger.LogError(exception, "Could not remove stored driver document {FileName}.", name);
            }
        }
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
