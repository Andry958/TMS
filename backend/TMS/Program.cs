using DataAccess.Data.Entities;
using DataAccess.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using TMS.Services;

var builder = WebApplication.CreateBuilder(args);

// Local credentials are deliberately kept outside version control.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();
builder.Configuration.AddCommandLine(args);

string connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new Exception("No Connection String found.");

if (!OperatingSystem.IsWindows() && connStr.Contains("(localdb)", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        "SQL Server LocalDB is only supported on Windows. Configure a reachable SQL Server using the " +
        "ConnectionStrings__DefaultConnection environment variable or appsettings.Local.json.");
}

builder.Services.AddDbContext<TMSDbContext>(options =>
    options.UseSqlServer(connStr));

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<TMSDbContext>()
.AddDefaultTokenProviders();

var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
            // Keeping this beneath /api lets the Vite reverse proxy forward it in development.
            options.CallbackPath = "/api/signin-google";
        });
}

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    // API clients receive a proper HTTP status rather than an HTML redirect.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddHostedService<GlobusTelemetryCollector>();
builder.WebHost.UseUrls("http://0.0.0.0:7060", "https://0.0.0.0:7061"); // HTTP 7060 + HTTPS 7061

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseForwardedHeaders();

// Swagger доступний завжди
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TMS API V1");
    c.RoutePrefix = "swagger"; // Swagger буде доступний на /swagger
});

// app.UseHttpsRedirection(); // закоментувати для HTTP тесту через Інтернет
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
