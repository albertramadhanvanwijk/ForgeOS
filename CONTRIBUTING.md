# Contributing to ForgeOS

Thank you for your interest in contributing to **ForgeOS — The AI Engineering Operating System**!

---

## 1. Code of Conduct & Core Values

- **Outcome-Driven**: We prioritize verified outcomes over raw output or generated boilerplate.
- **Traceability**: Every functional change should tie back to a tracked requirement in `requirements/` and be reflected in `docs/implementation/REQUIREMENTS_TRACEABILITY.md`.
- **Quality First**: Tests are first-class citizens. A feature is only complete when backed by passing unit, integration, and security checks.

---

## 2. Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- pnpm (v9+ recommended)
- Docker & Docker Compose (for PostgreSQL and local services)
- Git (configured with clean credentials)

### Local Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/albertramadhanvanwijk/ForgeOS.git
   cd ForgeOS
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start backing services:
   ```bash
   docker compose up -d
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```

---

## 3. Architecture & Code Organization

ForgeOS is architected as a modular monolith inside a monorepo structure:
- `apps/` — User interfaces (`apps/web`)
- `platform/` — Core control plane modules (`orchestrator`, `workflow-engine`, `persistent-memory`, etc.)
- `packages/` — Shared libraries (`types`, `ui`, `api-contracts`, `config`)
- `infrastructure/` — Database schemas, migrations, container configs
- `tests/` — Test suites (`unit`, `integration`, `e2e`, `security`, `agent-evaluations`)
- `runtime-data/` — Ephemeral local data (strictly git-ignored)

---

## 4. Testing & Quality Standards

Before committing changes, ensure all verification checks pass:

- **Typecheck**: `pnpm typecheck`
- **Linting & Formatting**: `pnpm lint`
- **Unit & Integration Tests**: `pnpm test`
- **End-to-End Tests**: `pnpm test:e2e`

### Hard Rules:
- Never disable or remove existing tests to bypass test failures.
- Never lower quality gate thresholds.
- Bounded auto-repair and self-healing must always preserve baseline regression tests.

---

## 5. Git & Commit Guidelines

We enforce the Conventional Commits specification:
- `feat(module): add new functionality`
- `fix(module): resolve a verified bug`
- `test(module): add or update test coverage`
- `docs(module): update documentation or specifications`
- `chore(toolchain): update build tooling, dependencies, or configs`

Every commit must maintain clean tracking:
- Never commit credentials or secrets.
- Verify that `runtime-data/` and local caches are ignored.
