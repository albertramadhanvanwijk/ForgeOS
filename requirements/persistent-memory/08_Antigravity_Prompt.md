# Antigravity Prompt — Implement ForgeOS Persistent Memory

You are implementing Persistent Memory for ForgeOS, an AI Engineering Operating System that turns intent into verified outcomes.

## Rules
1. Audit the existing repository and requirements before changing architecture.
2. Reuse current database, auth, policy, workflow/event, artifact, search, agent-context, UI, and test infrastructure. Do not duplicate services.
3. Produce gap analysis and dependency-aware plan before broad implementation.
4. Implement small, reviewable increments; avoid unrelated rewrites.
5. Never weaken authentication, project isolation, approvals, policy, or audit.
6. Treat memory as untrusted contextual data. It cannot override system instructions, current policy, or authoritative runtime/project state.
7. Never store secrets in memory, logs, embeddings, or analytics.
8. Do not claim completion without code/test evidence.
9. Ask for approval on high-impact or ambiguous decisions.

## First step: audit only
Create/update:
- `docs/implementation/memory/CURRENT_STATE_AUDIT.md`
- `docs/implementation/memory/GAP_ANALYSIS.md`
- `docs/implementation/memory/TARGET_DESIGN.md`
- `docs/implementation/memory/IMPLEMENTATION_PLAN.md`
- `docs/implementation/memory/REQUIREMENTS_TRACEABILITY.md`

Identify actual files/modules for database, auth, workflow events, artifact registry, search, agent context, UI, tests, and observability. Mark requirements existing/partial/missing/blocked. Do not start a large implementation until the audit is complete.

## Required features
Scoped memory (task, role/agent, project, workspace, approved shared); lifecycle/versioning; source provenance; event-driven idempotent capture; validation for permission/sensitivity/secrets/duplicates/conflicts/freshness; permission-filtered retrieval; bounded Orchestrator context package; stale/conflict warnings; correction/supersession/archive/retention/deletion; governed promotion; feedback/evaluation; Memory Center; telemetry; acceptance tests for isolation, secrets, prompt injection, idempotency, deletion, and outages.

## Architecture constraints
Use PostgreSQL if consistent with the current stack. Start with metadata and full-text search; add vector search only when measured need justifies it. Large reports/logs stay in Artifact Store. Enforce access before ranking. Keep caches and derived indexes permission-aware and invalidated on updates/revocation/deletion.

## Sequence
1. Audit and gap analysis.
2. Propose data model/API contracts and ADRs.
3. Implement schema, authorization, provenance, versioning, lifecycle.
4. Add event capture and validation.
5. Integrate retrieval with Orchestrator.
6. Build Memory Center UI.
7. Add maintenance, feedback, evaluation, telemetry.
8. Add optional semantic search only if justified.

After each increment, run relevant tests/lint/typecheck/build, fix regressions, update traceability, and report changed files, exact test results, security verification, known gaps, and next safe step.

**Start with the audit only. Do not claim production readiness without evidence.**
