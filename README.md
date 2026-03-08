# AI QA Command Center

> **Enterprise-grade Quality Intelligence & Release Readiness Platform**

AI QA Command Center is a centralized Decision Support System for engineering organizations. It aggregates quality signals from CI/CD pipelines, testing systems, defect tracking, and microservice health endpoints — providing a single pane of glass for software quality with AI-driven insights.

![Dashboard Preview](docs/dashboard-preview.png)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Module Reference](#module-reference)
- [Configuration Guide](#configuration-guide)
- [Role-Based Access](#role-based-access)
- [AI Engine](#ai-engine)
- [Demo Mode](#demo-mode)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)

---

## Overview

The platform helps engineering and QA leaders answer critical questions:

| Question | Module |
|---|---|
| Is the release ready for production? | Release Readiness Dashboard |
| Which microservices are risky? | Risk Prediction Engine |
| Are pipelines stable? | Pipeline Monitoring |
| Are there flaky tests affecting reliability? | Flaky Test Detection |
| Which areas lack sufficient test coverage? | Coverage Insights |
| What risks should be mitigated before release? | Release Advisor |

**Design Philosophy:** AI provides recommendations but human users retain final release authority (Decision Support Mode).

---

## Key Features

- 🎯 **Release Readiness Score** — Composite 0–100 score with transparent weighted metrics
- 🤖 **AI Release Advisor** — Hold/Go recommendations with confidence scores and explainability
- 🏥 **Microservice Health Monitoring** — Real-time health status, error rates, latency tracking
- 📊 **Test Analytics** — Pass/fail/skip trends, automation rates, execution history
- ⚡ **Flaky Test Detection** — Identifies unstable tests with historical analysis
- 🐛 **Defect Analytics** — Severity distribution, aging, density, and leakage metrics
- 🛡️ **Coverage Insights** — API, UI, manual, and code coverage heatmaps
- 🔄 **Pipeline Monitoring** — CI/CD pipeline stability and failure tracking
- 📅 **Release Timeline** — Visual timeline of commits, builds, tests, defects, deployments
- 🔮 **Risk Prediction** — ML-based risk scoring per service and release
- 💬 **QA AI Assistant** — Conversational interface for quality queries
- ⚙️ **Multi-Project Support** — Projects, teams, releases, environments

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React)               │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ Dashboard  │ │ Analytics │ │ AI Assistant   │  │
│  │ Widgets    │ │ Pages     │ │ (Chat UI)      │  │
│  └───────────┘ └───────────┘ └───────────────┘  │
├─────────────────────────────────────────────────┤
│              State & Data Layer                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ React     │ │ Mock Data │ │ Integration    │  │
│  │ Query     │ │ Engine    │ │ Adapters       │  │
│  └───────────┘ └───────────┘ └───────────────┘  │
├─────────────────────────────────────────────────┤
│              Backend Services                    │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ Auth &    │ │ AI        │ │ Data           │  │
│  │ RBAC      │ │ Gateway   │ │ Aggregation    │  │
│  └───────────┘ └───────────┘ └───────────────┘  │
├─────────────────────────────────────────────────┤
│              External Integrations               │
│  Azure DevOps · Jira · SonarQube · CI/CD APIs   │
└─────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or bun)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd ai-qa-command-center

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Running Tests

```bash
npm test
```

---

## Module Reference

### 1. Release Readiness Dashboard (`/`)

The main dashboard displaying:
- **Readiness Gauge** — Animated SVG gauge (0–100)
- **Readiness Trend** — Score history across releases
- **Risk Factors** — Contributing issues affecting readiness

**Scoring Model:**

| Factor | Weight |
|---|---|
| Test Pass Rate | 30% |
| Defect Severity | 20% |
| Automation Coverage | 15% |
| Pipeline Stability | 15% |
| Service Health | 10% |
| Code Coverage | 10% |

### 2. Release Advisor (`/release-advisor`)

AI-generated release recommendations with:
- **Go / Hold / No-Go** status
- **Confidence Level** (percentage)
- **Explainable Reasons** — Why the recommendation was made
- **Risk Factors** — Specific blockers and concerns

### 3. Service Health (`/services`)

Microservice monitoring showing:
- Health status (Healthy / Degraded / Unhealthy)
- Error rate and latency metrics
- Last deployment timestamp
- Pipeline status per service
- Environment selector (Dev / QA / Stage / Prod / Perf)

### 4. Test Analytics (`/test-analytics`)

Test execution analytics including:
- Total / Passed / Failed / Skipped counts
- Automation pass percentage
- Execution trend charts
- Filters by project, team, pipeline, service, release, date range

### 5. Flaky Test Detection (`/flaky-tests`)

Identifies unreliable tests via historical analysis:
- Flakiness score per test
- Top flaky tests ranking
- Unstable pipeline correlation
- AI-suggested root causes

### 6. Defect Analytics (`/defects`)

Defect tracking and analysis:
- Severity distribution (Critical / High / Medium / Low)
- Defect aging and density metrics
- Defect leakage between environments
- Trend charts per release

### 7. Coverage Insights (`/coverage`)

Multi-layer coverage analysis:
- API automation coverage
- UI automation coverage
- Manual test coverage
- Code coverage (SonarQube integration)
- Coverage heatmap by microservice

### 8. Pipelines (`/pipelines`)

CI/CD pipeline monitoring:
- Pipeline status (Success / Failed / Running)
- Failure rate trends
- Build duration tracking
- Stage-level breakdown

### 9. Release Timeline (`/timeline`)

Visual timeline of release events:
- Commits, builds, test runs
- Defect creation and resolution
- Deployment events
- Milestone markers

### 10. Risk Prediction (`/risk`)

AI-powered risk scoring:
- Per-service risk assessment
- Historical trend analysis
- High-risk component identification
- Risk factor breakdown

### 11. QA AI Assistant (`/ai-assistant`)

Conversational interface for quality queries:
- Natural language questions about quality metrics
- Context-aware responses
- Suggested follow-up questions

### 12. Settings (`/settings`)

Platform configuration:
- AI provider settings
- Integration management
- Environment configuration
- Branding customization

---

## Configuration Guide

### For Administrators

#### AI Provider Configuration

Navigate to **Settings → AI Configuration** to set up AI providers:

1. Select a provider (OpenAI, Anthropic, Google, Meta)
2. Enter your API key
3. Choose model, temperature, and token limits
4. Assign providers to specific modules (Risk Prediction, QA Assistant, Defect Analysis)

#### Integration Setup

Connect external systems via **Settings → Integrations**:

- **Azure DevOps** — Pipeline data, test results, work items, repositories
- **Jira** — Defect tracking (optional)
- **SonarQube** — Code coverage reports

#### Environment Management

Configure environments via **Settings → Environments**:

- Define environments (Dev, QA, Stage, Prod, Performance)
- Map pipelines per environment
- Set service health endpoints
- Configure health check URLs (`/health`, `/actuator/health`)

#### Branding

Customize via **Settings → Branding**:
- Upload company logo
- Set brand colors
- Change application name
- Select dashboard theme

### For QA Managers

- Use the **Release Readiness Dashboard** to monitor overall release health
- Check the **Release Advisor** for AI-powered Go/No-Go recommendations
- Review **Defect Analytics** for severity trends and leakage
- Monitor **Coverage Insights** to identify undertested areas

### For QA Engineers

- Use **Test Analytics** to track execution results
- Monitor **Flaky Tests** to identify unreliable tests in your area
- Check **Pipelines** for build failures affecting your tests
- Use the **QA Assistant** for quick quality queries

### For Developers

- Review **Service Health** for your microservices
- Check **Risk Prediction** before releases
- Use **Coverage Insights** to verify test coverage for your code
- Monitor **Pipelines** for build and deployment status

---

## Role-Based Access

| Role | Permissions |
|---|---|
| **Admin** | Full access — integrations, AI config, environments, branding, projects, teams |
| **QA Manager** | View all dashboards, manage test configurations, approve releases |
| **QA Engineer** | View dashboards, manage test cases, report defects |
| **Developer** | View dashboards, view service health, view coverage |
| **Viewer** | Read-only access to all dashboards |

Authentication integrates with **Microsoft Entra ID** for enterprise SSO.

---

## AI Engine

### Supported Providers

| Provider | Models |
|---|---|
| OpenAI | GPT-4, GPT-4o, GPT-3.5 Turbo |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus |
| Google | Gemini Pro, Gemini Ultra |
| Meta | LLaMA 3 |

### Enterprise AI Safety

- All AI recommendations include **confidence scores** and **explainable reasoning**
- **Decision Support Mode** — AI advises, humans decide
- **Audit logging** for all AI recommendations
- Support for **private AI endpoints** (Azure OpenAI, AWS Bedrock, Google Vertex AI)
- **Data redaction** — PII and source code stripped before AI calls
- **AI-disabled mode** available for maximum security environments

---

## Demo Mode

When integrations are not connected, the platform operates in **Demo Mode** with synthetic data for a financial services platform:

- **12 microservices** (PaymentService, AuthService, etc.)
- **8 CI/CD pipelines**
- **20 releases** with history
- **10,000+ test executions**
- **Realistic defect distribution** across severity levels

Toggle Demo Mode in **Settings** or via the sidebar indicator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + Custom Design System |
| Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Animations | Framer Motion |
| Routing | React Router v6 |
| State | TanStack React Query |
| Fonts | Inter + JetBrains Mono |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add my feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

Proprietary — All rights reserved.
