using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EGChatbot.Domain.Models;
// using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace EGChatbot.Domain.Data
{

    public class ApplicationDbContext : DbContext
    {
  private readonly IConfiguration _config;

        //private readonly AuditLoggingInterceptor _auditLoggingInterceptor;
      public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IConfiguration configuration) : base(options)
        {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        _config = configuration;
      }


        public DbSet<Session> Sessions { get; set; } = null!;
      public DbSet<ChatConversation> ChatConversation { get; set; } = null!;
      public DbSet<ChatMessage> ChatMessage { get; set; } = null!;




    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      // Apply default configs as a aresult of typical EFCore Conventions
      base.OnModelCreating(modelBuilder);

      modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
      modelBuilder.Entity<ChatConversation>(entity =>
      {
        entity.HasIndex(x => x.FoundryConversationId).IsUnique();
        entity.Property(x => x.FoundryConversationId).IsRequired();
        entity.Property(x => x.SessionId).IsRequired();
        entity.Property(x => x.Content).IsRequired();
        entity.HasOne(x => x.Session)
          .WithMany()
          .HasForeignKey(x => x.SessionId)
          .OnDelete(DeleteBehavior.Cascade);
      });

      modelBuilder.Entity<ChatMessage>(entity =>
      {
        entity.HasKey(x => x.Id);
        entity.Property(x => x.Role).IsRequired();
        entity.Property(x => x.Content).IsRequired();
        entity.Property(x => x.Status).IsRequired();
        entity.HasIndex(x => new { x.ChatConversationId, x.CreatedAt });
        entity.HasOne(x => x.ChatConversation)
          .WithMany(x => x.Messages)
          .HasForeignKey(x => x.ChatConversationId)
          .OnDelete(DeleteBehavior.Cascade);
      });
    //   modelBuilder.SetupSeedingtDefaults();

    //   modelBuilder.SetupUpdatedAtDefaults();
    //   modelBuilder.SetupSoftDeleteFilter();


      // Setup Seeding for Roles Table - Runs during Migration;

    }
    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
      base.OnConfiguring(builder);

      if (builder.IsConfigured)
      {
        return;
      }

      var connectionString = _config.GetConnectionString("DefaultConnection")
        ?? _config["DefaultConnection"];

      if (string.IsNullOrWhiteSpace(connectionString))
      {
        throw new InvalidOperationException(
          "Database connection string 'DefaultConnection' is not configured. " +
          "Set 'ConnectionStrings:DefaultConnection' in configuration."
        );
      }

      builder.UseNpgsql(
        connectionString,
        x => x.MigrationsAssembly("EGChatbot.Domain")
      );
    }

    }

    
}

