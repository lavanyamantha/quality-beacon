# QA Dashboard — Proxy Server

A lightweight Express server that keeps integration credentials **server-side** so tokens never reach the browser.

## Architecture

```
Browser (React)  →  Proxy Server (Express)  →  Azure DevOps / Jira / GitHub / etc.
   No tokens           Holds all tokens           Receives authenticated requests
```

## Quick Start

```bash
cd server
cp .env.example .env       # Fill in your credentials
npm install
npm start                  # Runs on http://localhost:3001
```

Then in the frontend `.env.local`:
```
VITE_PROXY_URL=http://localhost:3001
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/integrations` | List configured integrations (no tokens exposed) |
| `POST` | `/api/proxy/:type` | Forward an API request through the proxy |
| `GET` | `/api/proxy/:type/health` | Health check an integration endpoint |

### POST `/api/proxy/:type`

```json
{
  "method": "GET",
  "path": "/_apis/projects?api-version=7.1",
  "headers": {}
}
```

The proxy attaches the correct auth headers (Basic, Bearer, PRIVATE-TOKEN) based on the integration type.

## Production Deployment

### Docker

```bash
cd server
docker build -t qa-dashboard-proxy .
docker run -p 3001:3001 --env-file .env qa-dashboard-proxy
```

### Azure App Service / AWS ECS / Any Node host

1. Deploy the `server/` folder as a Node.js application
2. Set environment variables in your platform's secret management
3. Point `VITE_PROXY_URL` to the deployed proxy URL

### Security Notes

- Credentials are **only** in server-side environment variables
- The proxy does **not** expose tokens in any response
- Base URLs are returned via `/api/integrations` for deep-linking
- Add authentication middleware (e.g., Entra ID) in production to restrict proxy access to your team
