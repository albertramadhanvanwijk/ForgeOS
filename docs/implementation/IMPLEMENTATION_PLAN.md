# ForgeOS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build ForgeOS from a greenfield repository into a production-ready AI Engineering Operating System following the 7-phase roadmap.

**Architecture:** Modular monolith (ADR-003). Next.js + NestJS + PostgreSQL + pnpm workspaces. Split into services only when measurable need justifies it.

**Tech Stack:** Next.js 14, NestJS, TypeScript, Prisma, PostgreSQL, MinIO, Vitest, Playwright, pnpm, OpenTelemetry, Pino.

**Spec:** `requirements/` (17 core docs) + `requirements/persistent-memory/` (10 docs)

---

## Global Constraints

- Never commit secrets, credentials, private runtime data, or sensitive generated artifacts.
- `runtime-data/` is git-ignored — never commit runtime content.
- All completion claims require evidence (test results, not just "it compiles").
- Failed mandatory quality gates block release — never lower thresholds to force a pass.
- Agents cannot grant themselves permissions.
- Prompt injection cannot override system policy.
- No silent production changes.
- Approval scope is version-specific — material changes require reevaluation.
- Memory is contextual, not authoritative — never overrides policy, runtime state, or system instructions.

## Review Focus

1. **False success claims** — every "done" must be backed by actual test output, not just code existence.
2. **Permission boundary leaks** — an agent run must never be able to escalate its own scope.
3. **Approval scope drift** — approvals must be tied to exact artifact version/hash, not broadly to "this feature".
4. **Workflow restart safety** — after any interruption, the workflow must reconstruct correct state from checkpoints, not create duplicate side effects.
5. **Cross-project memory leakage** — memory retrieval must enforce project isolation server-side, never relying only on prompt instructions.

---

## Phase 0 — Repository Audit & Documentation ✅ COMPLETE

**Exit criteria:** Actual state documented. ✅

- [x] Repository structure audited
- [x] All requirements files read and understood
- [x] `docs/implementation/CURRENT_STATE_AUDIT.md` created
- [x] `docs/implementation/GAP_ANALYSIS.md` created
- [x] `docs/implementation/TARGET_ARCHITECTURE.md` created
- [x] `docs/implementation/IMPLEMENTATION_PLAN.md` created (this file)
- [x] `docs/implementation/REQUIREMENTS_TRACEABILITY.md` created
- [x] `docs/implementation/OPEN_QUESTIONS.md` created

---

## Phase 1 — Core Foundation

**Exit criteria:** Simple workflow persists, traces artifacts, recovers after restart.

**Open questions to resolve first:** OQ-001 (NestJS vs Fastify), OQ-005 (Auth strategy), OQ-006 (Object storage)

### Task 1.1: Monorepo Bootstrap & Toolchain

**Files:**
- Create: `package.json` (root, pnpm workspaces)
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `packages/config/eslint-base.js`
- Create: `packages/config/vitest-base.ts`
- Create: `.github/workflows/ci.yml`
- Create: `docker-compose.yml` (PostgreSQL + MinIO)
- Create: `.env.example` (document all required vars)

**Interfaces:**
- Produces: working pnpm workspace, `pnpm install` succeeds, `docker-compose up` starts PostgreSQL + MinIO

- [ ] **Step 1:** Create `pnpm-workspace.yaml` with `apps/*`, `platform/*`, `packages/*`
- [ ] **Step 2:** Create root `package.json` with workspace config and dev scripts
- [ ] **Step 3:** Create `tsconfig.base.json` (strict, ES2022, module: NodeNext)
- [ ] **Step 4:** Create `packages/config/` with shared ESLint and Vitest configs
- [ ] **Step 5:** Create `docker-compose.yml` with `postgres:16` and `minio/minio` services
- [ ] **Step 6:** Write `.env.example` with all required vars (DATABASE_URL, STORAGE_ENDPOINT, etc.)
- [ ] **Step 7:** Verify `docker-compose up -d` starts without error
- [ ] **Step 8:** Create `.github/workflows/ci.yml` (typecheck + lint + unit tests)
- [ ] **Step 9:** Commit: `chore(monorepo): bootstrap pnpm workspace, toolchain, docker-compose`

---

### Task 1.2: Shared Types & Database Schema

**Files:**
- Create: `packages/types/src/index.ts`
- Create: `packages/types/package.json`
- Create: `infrastructure/database/schema.prisma`
- Create: `infrastructure/database/migrations/` (Prisma managed)
- Create: `infrastructure/database/seed.ts`

**Interfaces:**
- Produces: `@forgeos/types` — exported TypeScript interfaces for all core entities
- Produces: Prisma schema with `User`, `Project`, `Conversation`, `WorkflowDefinition`, `WorkflowRun`, `Task`, `AgentRun`, `Artifact`, `ArtifactVersion`, `ApprovalRecord`, `QualityGateResult`, `AuditEvent` tables

- [ ] **Step 1:** Write failing test: `expect(prisma.project.create).toBeDefined()`
- [ ] **Step 2:** Run test → FAIL (no schema)
- [ ] **Step 3:** Write `schema.prisma` with all core entities, enums, and relations
- [ ] **Step 4:** Run `pnpm prisma migrate dev --name init`
- [ ] **Step 5:** Run test → PASS
- [ ] **Step 6:** Write `packages/types/src/index.ts` exporting all entity interfaces (derived from Prisma types)
- [ ] **Step 7:** Run: `pnpm typecheck` → 0 errors
- [ ] **Step 8:** Commit: `feat(schema): add core database schema and shared types`

---

### Task 1.3: NestJS Backend Scaffold

**Files:**
- Create: `platform/orchestrator/package.json`
- Create: `platform/orchestrator/src/main.ts`
- Create: `platform/orchestrator/src/app.module.ts`
- Create: `platform/orchestrator/src/health/health.controller.ts`
- Create: `platform/orchestrator/src/health/health.controller.spec.ts`

**Interfaces:**
- Produces: NestJS app running on port 3001, `GET /health` → `{ status: 'ok' }`
- Consumes: `packages/types`

- [ ] **Step 1:** Write failing test: `GET /health` returns `{ status: 'ok' }`
- [ ] **Step 2:** Run test → FAIL
- [ ] **Step 3:** Scaffold NestJS app with `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-fastify`
- [ ] **Step 4:** Implement `HealthController` with `GET /health`
- [ ] **Step 5:** Run test → PASS
- [ ] **Step 6:** Run `pnpm typecheck` in `platform/orchestrator` → 0 errors
- [ ] **Step 7:** Commit: `feat(orchestrator): NestJS scaffold with health endpoint`

---

### Task 1.4: Project Management API (FR-001, FR-002)

**Files:**
- Create: `platform/orchestrator/src/projects/projects.module.ts`
- Create: `platform/orchestrator/src/projects/projects.service.ts`
- Create: `platform/orchestrator/src/projects/projects.controller.ts`
- Create: `platform/orchestrator/src/projects/dto/`
- Test: `tests/integration/projects.test.ts`

**Interfaces:**
- Produces: `POST /api/projects`, `GET /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id` (archive, not destroy)
- Consumes: Prisma `Project` model

- [ ] **Step 1:** Write failing tests: create project, get project, archive project, reject invalid input
- [ ] **Step 2:** Run tests → FAIL
- [ ] **Step 3:** Implement `ProjectsService` with Prisma CRUD + archive logic
- [ ] **Step 4:** Implement `ProjectsController` with validation DTOs
- [ ] **Step 5:** Run tests → PASS
- [ ] **Step 6:** Commit: `feat(projects): project CRUD and archive API (FR-001, FR-002)`

---

### Task 1.5: Agent/Tool Registry (FR-020–FR-022, FR-024, FR-027)

**Files:**
- Create: `platform/agent-registry/src/`
- Create: `agents/roles/*.json` (agent role definitions)
- Test: `tests/unit/agent-registry.test.ts`

**Interfaces:**
- Produces: `AgentRegistryService.selectAgents(task, project, permissions)` → `AgentRun[]` with rationale
- Produces: `GET /api/registry/roles`, `GET /api/registry/skills`, `GET /api/registry/tools`

- [ ] **Step 1:** Write failing tests: select appropriate agents for task, skip irrelevant agents, record rationale
- [ ] **Step 2:** Run tests → FAIL
- [ ] **Step 3:** Write role definition JSONs for 5 core roles (Orchestrator, PM, Engineer, QA, DevOps)
- [ ] **Step 4:** Implement `AgentRegistryService` with capability matching
- [ ] **Step 5:** Run tests → PASS
- [ ] **Step 6:** Commit: `feat(agent-registry): role/skill/tool registry with agent selection (FR-020–FR-024)`

---

### Task 1.6: Persistent Workflow Engine (FR-011, FR-016, FR-018)

**Files:**
- Create: `platform/workflow-engine/src/`
- Test: `tests/integration/workflow-engine.test.ts`

**Interfaces:**
- Produces: `WorkflowEngine.createRun(definition, context)` → `WorkflowRun`
- Produces: `WorkflowEngine.checkpoint(runId, state)` → void
- Produces: `WorkflowEngine.resume(runId)` → `WorkflowRun`
- Produces: Workflow states: `pending | running | waiting_approval | paused | completed | failed | cancelled`

- [ ] **Step 1:** Write failing test: create workflow run, checkpoint state, simulate restart, resume from checkpoint
- [ ] **Step 2:** Run test → FAIL
- [ ] **Step 3:** Implement durable workflow engine on PostgreSQL with JSON state snapshots
- [ ] **Step 4:** Implement task graph with dependency resolution
- [ ] **Step 5:** Run tests → PASS
- [ ] **Step 6:** Test restart: stop process mid-workflow, restart, verify state recovers correctly
- [ ] **Step 7:** Commit: `feat(workflow-engine): persistent durable workflows with checkpointing (FR-011, FR-016, FR-018)`

---

### Task 1.7: Policy Engine & Approval Gates (FR-015, FR-025, FR-028, FR-093)

**Files:**
- Create: `platform/policy-engine/src/`
- Test: `tests/security/policy-engine.test.ts`

**Interfaces:**
- Produces: `PolicyEngine.authorize(principal, action, resource, context)` → `{ allowed: boolean, reason: string }`
- Produces: `ApprovalService.requestApproval(action, scope, requester)` → `ApprovalRecord`
- Produces: `AuditLog.record(event)` → void

- [ ] **Step 1:** Write failing tests: deny unauthorized action, approve authorized action, deny permission expansion, block expired approval, audit sensitive actions
- [ ] **Step 2:** Run tests → FAIL
- [ ] **Step 3:** Implement `PolicyEngine` with RBAC, least privilege, default deny
- [ ] **Step 4:** Implement `ApprovalService` with record states and scope validation
- [ ] **Step 5:** Implement `AuditLog` with structured events (no sensitive content in labels)
- [ ] **Step 6:** Run tests → PASS
- [ ] **Step 7:** Commit: `feat(policy-engine): authorization, approvals, audit log (FR-015, FR-025, FR-028, FR-093)`

---

### Task 1.8: Artifact Registry (FR-030–FR-036)

**Files:**
- Create: `platform/artifact-registry/src/`
- Test: `tests/unit/artifact-registry.test.ts`

**Interfaces:**
- Produces: `ArtifactRegistry.store(artifact, content)` → `ArtifactVersion`
- Produces: `ArtifactRegistry.retrieve(id, version?)` → `Artifact + ArtifactVersion`
- Produces: Artifact states: `draft | approved | verified | released | superseded | failed`

- [ ] **Step 1:** Write failing tests: store artifact, version artifact, retrieve by version, enforce state transitions, block dependent stages without approval
- [ ] **Step 2:** Run tests → FAIL
- [ ] **Step 3:** Implement artifact storage with MinIO + Prisma metadata
- [ ] **Step 4:** Implement provenance and task-link tracking
- [ ] **Step 5:** Run tests → PASS
- [ ] **Step 6:** Commit: `feat(artifact-registry): artifact storage, versioning, provenance (FR-030–FR-036)`

---

### Task 1.9: Next.js Frontend Scaffold + Basic Project Workspace

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/app/` (App Router)
- Create: `packages/ui/src/` (design system components)
- Test: `tests/e2e/project-workspace.test.ts` (Playwright)

**Interfaces:**
- Produces: Next.js app on port 3000, project list page, project workspace tabs (Overview, Conversation, Plan & Tasks, Artifacts)
- Consumes: `platform/orchestrator` API

- [ ] **Step 1:** Write Playwright test: navigate to `/projects`, see empty state, create project, see it in list
- [ ] **Step 2:** Run test → FAIL
- [ ] **Step 3:** Scaffold Next.js app with App Router, Tailwind, shadcn/ui
- [ ] **Step 4:** Create `packages/ui` with core components (Button, Card, Badge, Tabs, DataTable)
- [ ] **Step 5:** Build projects list page and project workspace shell
- [ ] **Step 6:** Connect to backend API (tRPC or REST)
- [ ] **Step 7:** Run test → PASS
- [ ] **Step 8:** Commit: `feat(web): Next.js scaffold with project workspace UI`

---

### Phase 1 Exit Gate

- [ ] `pnpm test` (all unit + integration tests) → PASS
- [ ] `pnpm e2e` → PASS (project creation and workspace navigation)
- [ ] Simulate restart: stop docker, restart, verify workflow resumes from checkpoint
- [ ] `git status` clean, no secrets committed
- [ ] `git push origin main` → verify pushed
- [ ] Update `REQUIREMENTS_TRACEABILITY.md`: FR-001, FR-002, FR-011, FR-015, FR-016, FR-018, FR-020–FR-022, FR-024–FR-025, FR-028, FR-030–FR-036, FR-093 → `verified`

---

## Phase 2 — End-to-End Engineering

**Exit criteria:** Real software task from intent to verified artifact.

### Task 2.1: Orchestrator — Intent Classification & Planning (FR-003–FR-007, FR-010, FR-012)
### Task 2.2: Model Gateway — Multi-provider Adapter (FR-094)
### Task 2.3: Execution Engine — Local Runner / Sandbox (FR-042–FR-044, FR-047–FR-048)
### Task 2.4: Git Integration (FR-040, FR-041)
### Task 2.5: Quality Engine — Gates & Evidence (FR-060–FR-063)
### Task 2.6: Observability (FR-090–FR-092)

> Detailed task breakdown will be written before Phase 2 begins, following the writing-plans skill.

---

## Phase 3 — Design & Intelligence

> Memory System (MEM-001–MEM-018), Design Studio, Context Manager, Traceability.

---

## Phase 4 — Platform Builder

> Capability Graph, PlatformChangeSet lifecycle, impact analysis, isolated implementation, approvals.

---

## Phase 5 — Reliability & Intelligence

> Self-healing, evaluation, model/cost routing, recovery, concurrency, context compaction.

---

## Phase 6 — Production & Expansion

> Deployment pipeline, monitoring, backup/restore, rollback, multi-runtime adapters.

---

## Commit Convention

```
feat(module): short description (FR-XXX)
fix(module): short description
test(module): add tests for X
docs(module): update traceability / architecture
chore: toolchain / config changes
```

## Push Policy

Push after each Phase exit gate, when:
- All required tests pass
- `git status` is clean
- No secrets in diff
- No conflicts with remote
