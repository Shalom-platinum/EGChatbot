using System.Security.Claims;
using System.Threading.RateLimiting;
using EGChatbot.Api.ModuleEndpoints;
using EGChatbot.Api.Writers;
using EGChatbot.Application.Services;
using EGChatbot.Common.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using EGChatbot.Domain.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Enable PII logging for debugging auth issues (ONLY IN DEVELOPMENT)
if (builder.Environment.IsDevelopment())
{
    Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
}

// Add ServiceDefaults (telemetry, health checks)
builder.AddServiceDefaults();

// Add ProblemDetails service for standardized RFC 7807 error responses
builder.Services.AddProblemDetails();

// Configure CORS for local development and production
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:8080" };

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Configure the response when a limit is hit
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Define a policy named "IpSafe"
    options.AddPolicy("IpSafe", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            // Use the remote IP address as the unique key (partition)
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,             // Max 5 requests
                Window = TimeSpan.FromSeconds(1), // Per 1 second
                QueueLimit = 0               // Do not queue; reject immediately
            }));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // In development, allow any localhost port for flexibility
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                }
                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});


builder.Services.AddDbContext<ApplicationDbContext>();


// Override ClientId and TenantId from environment variables if provided
// These will be set by azd during deployment or by AppHost in local dev
var clientId = builder.Configuration["ENTRA_SPA_CLIENT_ID"]
    ?? builder.Configuration["AzureAd:ClientId"];

if (!string.IsNullOrEmpty(clientId))
{
    builder.Configuration["AzureAd:ClientId"] = clientId;
    // Set audience to match the expected token audience claim
    builder.Configuration["AzureAd:Audience"] = $"api://{clientId}";
}

var tenantId = builder.Configuration["ENTRA_TENANT_ID"]
    ?? builder.Configuration["AzureAd:TenantId"];

if (!string.IsNullOrEmpty(tenantId))
{
    builder.Configuration["AzureAd:TenantId"] = tenantId;
}

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellation) =>
    {
        document.Info.Title = "CPOR Manager API";
        document.Info.Version = "v1";
        document.Info.Description = "API for document management and PDF Generation";

        document.Servers =
        [
            new OpenApiServer { Url = "https://cpormanager-dybveffkg4gbbwh9.westeurope-01.azurewebsites.net" }
        ];

        // Add Bearer authentication scheme
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, OpenApiSecurityScheme>();

        document.Components.SecuritySchemes.Add("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT token"
        });


        // Apply Bearer to all operations
        document.SecurityRequirements = new List<OpenApiSecurityRequirement>
    {
            new() {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            }
    };
        return Task.CompletedTask;
    });


});

// Register Azure AI Agent Service for Azure AI Foundry v2 Agents
// Uses Azure.AI.Projects SDK which works with v2 Agents API (/agents/ endpoint with human-readable IDs).
// builder.Services.AddScoped<OpenApiToolExecutor>();

builder.Services.AddScoped<AgentFrameworkService>();


var app = builder.Build();

// Add exception handling middleware for production
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}


// Add status code pages for consistent error responses
app.UseStatusCodePages();


// Map health checks
app.MapDefaultEndpoints();
app.MapChatEndpoints();
app.MapSessionEndpoints();

// Serve static files from wwwroot (frontend)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

// Note: HTTPS redirection not needed - Azure Container Apps handles SSL termination at ingress
// The container receives HTTP traffic on port 8080

// // Add authentication and authorization middleware
// Add RATE LIMITING
// ADD TOKEN LIMIT MAX PER ANONYMOUS/GUEST ID




// Fallback route for SPA - serve index.html for any non-API routes
app.MapFallbackToFile("index.html");

// Configure Kestrel to listen on the configured port
var port = builder.Configuration["PORT"] ?? "5232";



app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.Title = "CPOR Manager API";
    options.Servers = [

    new ScalarServer
        (
            "https://cpormanager-dybveffkg4gbbwh9.westeurope-01.azurewebsites.net",
             "Production"
        ),
        new ScalarServer
        (
            $"http://localhost:{port}",
            "Development"
        )
    ];
    options.Authentication = new ScalarAuthenticationOptions
    {
        PreferredSecuritySchemes = ["Bearer"],
    };
});

   if (app.Environment.IsProduction())
    {
        // Use HSTS
        app.UseHsts();

        // Run Migration; We'll get DB Backup if anything goes wrong
        // Or use a 2 step approach of applying to staging before production;
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate(); // apply migrations

    }
app.Run();
