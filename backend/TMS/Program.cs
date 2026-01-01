using DataAccess.Data;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();

string connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new Exception("No Connection String found.");

// ✅ DbContext — ПЕРШИМ
builder.Services.AddDbContext<TMSDbContext>(options =>
    options.UseSqlServer(connStr));

// ✅ Identity — ПІСЛЯ DbContext
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<TMSDbContext>()
.AddDefaultTokenProviders();

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<TMSDbContext>(options =>
    options.UseSqlServer(connStr,
        b => b.MigrationsAssembly("DataAccess")));

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication(); // ⬅️ ВАЖЛИВО
app.UseAuthorization();

app.MapControllers();

app.Run();
