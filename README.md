# 🚀 ForgeOS
### *The AI Engineering Operating System*

> **Satu sistem** untuk merencanakan, membangun, menguji, dan mengirimkan produk melalui kecerdasan buatan yang terkoordinasi.

---

## 📖 Overview

**ForgeOS** is a personal hybrid cloud/local AI Engineering Operating System that transforms user intent into verified deliverables through adaptive planning, agent orchestration, sandboxed execution, quality gates, and governed delivery.

ForgeOS is **outcome-first** and **artifact-driven**: it ensures that software, configurations, and platform enhancements are backed by empirical test evidence before any delivery or release.

---

## 🏗️ System Architecture

ForgeOS follows a 7-layer modular monolith architecture (see [Target Architecture](docs/implementation/TARGET_ARCHITECTURE.md)):

```
┌────────────────────────────────────────────────────────┐
│               Human Interface Layer                    │
│   (Web Dashboard · Projects · Quality · Platform)      │
├────────────────────────────────────────────────────────┤
│                Application / API Layer                 │
│              (REST / tRPC · WebSocket)                │
├────────────────────────────────────────────────────────┤
│                     Control Plane                      │
│   (Orchestrator · Workflow Engine · Policy · Gates)    │
├────────────────────────────────────────────────────────┤
│                   Intelligence Layer                   │
│   (Agents · Skills · Model Gateway · Evaluator)        │
├────────────────────────────────────────────────────────┤
│                    Knowledge Layer                     │
│   (Artifact Registry · Persistent Memory · Audit)      │
├────────────────────────────────────────────────────────┤
│                   Execution Plane                      │
│   (Sandbox · Local Runner · Git Worktrees · Builds)    │
├────────────────────────────────────────────────────────┤
│                  External Providers                    │
│   (LLM APIs · Object Storage · Git Hosts · CI/CD)      │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
ForgeOS/
├── apps/               # User-facing applications (Next.js web workspace)
├── platform/           # Core platform modules & engines:
│   ├── orchestrator/       # Conversational orchestrator & planner
│   ├── workflow-engine/    # Durable workflow state machine
│   ├── agent-registry/     # Role, skill, tool & model catalog
│   ├── artifact-registry/  # Versioned artifact management
│   ├── persistent-memory/  # Governed memory & context subsystem
│   ├── policy-engine/      # RBAC, approval gates & security policies
│   ├── quality-engine/     # Test evaluation & automated gates
│   ├── model-gateway/      # Multi-provider LLM adapters
│   ├── observability/      # Logging, metrics & audit tracing
│   └── platform-builder/   # Controlled self-evolution subsystem
├── packages/           # Shared types, UI component library, and configs
├── agents/             # Agent role definitions and instruction packs
├── architecture/       # Architectural diagrams and ADRs
├── design/             # Wireframes, prototypes, design tokens
├── infrastructure/     # Database schemas, containers, runner configs
├── tests/              # Unit, integration, e2e, and security suites
├── runtime-data/       # Ephemeral local data (Git-ignored)
├── docs/               # Architecture and implementation records
└── requirements/       # Full product and module specifications
```

---

## 🚦 Roadmap & Implementation Status

- [x] **Phase 0: Discovery & Audit** — Repository audit, gap analysis, target architecture, and plan established.
- [ ] **Phase 1: Core Foundation** — Monorepo toolchain, database schema, workflow engine, policy gates, artifact registry.
- [ ] **Phase 2: End-to-End Engineering** — Orchestrator, model gateway, sandboxed runner, Git worktrees, quality gates.
- [ ] **Phase 3: Design & Persistent Memory** — Memory service, context manager, Design Studio.
- [ ] **Phase 4: Platform Builder** — Capability graph, ChangeSets, conversational self-evolution.
- [ ] **Phase 5: Reliability & Intelligence** — Self-healing, cost routing, recovery, observability.
- [ ] **Phase 6: Production & Expansion** — Deployment pipelines, multi-runner adapters, backup/restore.

Detailed implementation records can be found in [`docs/implementation/`](docs/implementation/).

---

## 🛠️ Quick Start

### 1. Requirements
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 2. Configuration
Copy the sample environment file and configure variables:
```bash
cp .env.example .env
```

### 3. Start Backing Infrastructure
```bash
docker compose up -d
```

---

## 📜 Documentation & Governance

- [Agent Guidelines (AGENTS.md)](AGENTS.md)
- [Contributing Guide (CONTRIBUTING.md)](CONTRIBUTING.md)
- [Current State Audit](docs/implementation/CURRENT_STATE_AUDIT.md)
- [Gap Analysis](docs/implementation/GAP_ANALYSIS.md)
- [Target Architecture](docs/implementation/TARGET_ARCHITECTURE.md)
- [Implementation Plan](docs/implementation/IMPLEMENTATION_PLAN.md)
- [Requirements Traceability](docs/implementation/REQUIREMENTS_TRACEABILITY.md)
- [Open Questions](docs/implementation/OPEN_QUESTIONS.md)
