using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using DataAccess.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace TMS.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Паролі не збігаються." });
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName?.Trim(),
            LastName = request.LastName?.Trim(),
            CreatedAt = DateTime.UtcNow,
            LastLogin = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Не вдалося створити обліковий запис.", errors = result.Errors.Select(error => error.Description) });
        }

        await _signInManager.SignInAsync(user, isPersistent: false);
        return CreatedAtAction(nameof(Me), ToResponse(user));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized(new { message = "Неправильний email або пароль." });
        }

        var result = await _signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            var message = result.IsLockedOut
                ? "Обліковий запис тимчасово заблоковано через багато невдалих спроб."
                : "Неправильний email або пароль.";
            return Unauthorized(new { message });
        }

        user.LastLogin = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        return Ok(ToResponse(user));
    }

    [AllowAnonymous]
    [HttpGet("google")]
    public IActionResult Google([FromQuery] string? returnUrl)
    {
        if (!GoogleIsConfigured())
        {
            return Problem("Google sign-in has not been configured yet.", statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var safeReturnUrl = GetSafeReturnUrl(returnUrl);
        var callbackUrl = Url.Action(nameof(GoogleCallback), new { returnUrl = safeReturnUrl })!;
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(GoogleDefaults.AuthenticationScheme, callbackUrl);
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [AllowAnonymous]
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string? returnUrl)
    {
        var safeReturnUrl = GetSafeReturnUrl(returnUrl);
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info is null)
        {
            return RedirectWithError(safeReturnUrl, "google");
        }

        var signInResult = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider, info.ProviderKey, isPersistent: true, bypassTwoFactor: true);

        if (!signInResult.Succeeded)
        {
            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(email))
            {
                return RedirectWithError(safeReturnUrl, "google-email");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FirstName = info.Principal.FindFirstValue(ClaimTypes.GivenName),
                    LastName = info.Principal.FindFirstValue(ClaimTypes.Surname),
                    CreatedAt = DateTime.UtcNow,
                    LastLogin = DateTime.UtcNow
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return RedirectWithError(safeReturnUrl, "google-account");
                }
            }

            var linkResult = await _userManager.AddLoginAsync(user, info);
            if (!linkResult.Succeeded)
            {
                return RedirectWithError(safeReturnUrl, "google-link");
            }

            await _signInManager.SignInAsync(user, isPersistent: true);
        }
        else
        {
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user is not null)
            {
                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
            }
        }

        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        return Redirect(safeReturnUrl);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        return user is null ? Unauthorized() : Ok(ToResponse(user));
    }

    private static UserResponse ToResponse(User user) => new(
        user.Id,
        user.Email ?? string.Empty,
        user.FirstName,
        user.LastName,
        user.CompanyId);

    private bool GoogleIsConfigured() =>
        !string.IsNullOrWhiteSpace(_configuration["Authentication:Google:ClientId"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Authentication:Google:ClientSecret"]);

    private string GetSafeReturnUrl(string? returnUrl)
    {
        var allowedUrls = _configuration.GetSection("Authentication:Google:AllowedReturnUrls").Get<string[]>() ?? [];
        var defaultUrl = allowedUrls.FirstOrDefault() ?? "/";
        if (!Uri.TryCreate(returnUrl, UriKind.Absolute, out var uri)) return defaultUrl;

        return allowedUrls.Any(allowed => string.Equals(
            uri.GetLeftPart(UriPartial.Authority),
            allowed.TrimEnd('/'),
            StringComparison.OrdinalIgnoreCase))
            ? returnUrl!
            : defaultUrl;
    }

    private IActionResult RedirectWithError(string returnUrl, string error) =>
        Redirect($"{returnUrl}?authError={Uri.EscapeDataString(error)}");
}

public sealed class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [Required]
    public string ConfirmPassword { get; init; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; init; }

    [StringLength(100)]
    public string? LastName { get; init; }
}

public sealed class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;

    public bool RememberMe { get; init; }
}

public sealed record UserResponse(string Id, string Email, string? FirstName, string? LastName, int? CompanyId);
