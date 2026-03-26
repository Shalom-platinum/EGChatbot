# EGChatbot

EG Group Chatbot — an AI-powered conversational assistant that enables staff to interact with internal data and processes through a natural-language chat interface, backed by Azure AI Foundry.

## Objectives

EGChatbot is designed to provide an intelligent, organisation-facing chatbot experience without relying on generic off-the-shelf chat products. The initial goals are:

- Provide a conversational UI through which staff can query internal systems and content using natural language.
- Integrate with **Azure AI Foundry** (Agent Framework) to power AI responses, with full token and duration tracking per message.
- Support distinct identity models — **external users** via Azure AD B2C and **internal/ERP users** via Azure Active Directory.
- Persist chat sessions and full conversation history so that context is maintained across interactions.
- Expose a clean REST API that the frontend and any future consumers can rely on.

The scope and objectives of the platform will evolve over time. This document describes the starting point.

## Repository Folder Structure

| Folder | Purpose |
|---|---|
| `src-net/` | Backend REST API and business-logic libraries written in .NET 9 / C#. |
| `src-node/` | Frontend chat application built on Node.js / TypeScript / React (Vite). |

## Quick Start

The platform consists of two independently runnable halves — the .NET backend and the React frontend.

### Prerequisites

| Tool | Minimum version | Install guide |
|---|---|---|
| .NET SDK | 9.0 | https://dotnet.microsoft.com/download |
| Node.js | 20 LTS | https://github.com/nvm-sh/nvm#installing-and-updating |
| npm | 10+ | bundled with Node.js |

### 1 — Backend API (`src-net/`)

```bash
# Navigate to the API project
cd src-net

# Restore NuGet packages and build
dotnet restore
dotnet build

# Run the API (default: https://localhost:7xxx)
dotnet run --project EGChatbot.Api
```

The API exposes an OpenAPI document at `/openapi` (via Scalar) when running in Development mode.

> `appsettings.json` and all `appsettings.*.json` files are excluded from source control. Refer to the configuration section below for the required keys.

### 2 — Chat UI (`src-node/`)

```bash
cd src-node
npm install --legacy-peer-deps
npm run dev        # starts Vite dev server (default: http://localhost:5173)
```

## Architecture Overview

```
┌────────────────────────────────────────────────┐
│                  Browser client                │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │            Chat UI (src-node)             │  │
│  │         React + TypeScript + Vite         │  │
│  └──────────────────┬───────────────────────┘  │
│                     │  REST / JSON              │
└─────────────────────┼──────────────────────────┘
                      │
                      ▼
     ┌────────────────────────────────────────┐
     │             EGChatbot.Api              │
     │       ASP.NET Core 9 – Minimal API     │
     │                                        │
     │  ┌────────────────────────────────┐    │
     │  │     EGChatbot.Application      │    │
     │  │  Business logic, services,     │    │
     │  │  EF Core, Agent integration    │    │
     │  │                                │    │
     │  │  ┌────────────────────────┐   │    │
     │  │  │   EGChatbot.Domain     │   │    │
     │  │  │  Entities, models,     │   │    │
     │  │  │  interfaces, enums     │   │    │
     │  │  └────────────────────────┘   │    │
     │  └────────────────────────────────┘    │
     └───────────────┬────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
 ┌─────────────────┐   ┌────────────────────┐
 │    Database     │   │  Azure AI Foundry  │
 │  (SQL Server /  │   │  (Agent Framework) │
 │   PostgreSQL)   │   └────────────────────┘
 └─────────────────┘
```

### .NET Project Layout

| Project | Responsibility |
|---|---|
| `EGChatbot.Api` | HTTP endpoints, middleware, auth configuration, rate limiting, OpenAPI |
| `EGChatbot.Application` | `ChatService`, `SessionService`, `AgentFrameworkService` — all business logic |
| `EGChatbot.Domain` | Domain models (`Session`, `ChatConversation`, `ChatMessage`), EF Core `DbContext`, OAuth section constants |
| `EGChatbot.Common` | Shared utilities and cross-cutting models |

## Authentication

The platform supports two identity flows:

| Section key | Provider | Use case |
|---|---|---|
| `CltPortAadExternal` | Azure AD B2C | External / client-portal users |
| `CltPortAadInternal` | Azure Active Directory | Internal staff |
| `ErpAad` | Azure Active Directory | ERP system integration |

The relevant OAuth configuration sections are defined in `EGChatbot.Domain.OAuthSections`.

`appsettings.json` and all `appsettings.*.json` files are excluded from source control. Add the following top-level sections to your local settings file:

```json
{
  "CltPortAadExternal": { ... },
  "CltPortAadInternal": { ... },
  "ErpAad": { ... },
  "Cors": {
    "AllowedOrigins": [ "http://localhost:5173" ]
  },
  "ConnectionStrings": {
    "DefaultConnection": "<your-db-connection-string>"
  }
}
```

## CI / CD

GitHub Actions workflows are stored in `.github/workflows/`.

| Workflow | Trigger | Description |
|---|---|---|
| `website-test-front-swa.yml` | push to `main` or `aaa/XXXXX` | Builds the React app and deploys it to an Azure Static Web App (Test environment). |
| `website-test-back-appservice.yml` | push / PR to `main` or `AAA/**` | Builds and publishes the .NET API, then deploys to the `enterprise-group-backend` Azure App Service (Test environment). |

## Contributing

Branch from `main` using the convention `AAA/<branch-name>`.
