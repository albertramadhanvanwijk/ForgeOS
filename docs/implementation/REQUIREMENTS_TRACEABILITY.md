# ForgeOS — Requirements Traceability

**Date:** 2026-10-24
**Status:** Phase 0 — All requirements `not_started`

> This document tracks every requirement from the source spec to its implementing component and verification test.
> Update status as implementation progresses.

---

## Status Legend

| Status | Meaning |
|--------|---------|
| `not_started` | No implementation exists |
| `in_progress` | Implementation underway |
| `implemented` | Code written, not yet tested |
| `tested` | Tests written and passing |
| `verified` | Reviewed + evidence confirmed |

---

## Core Functional Requirements (FR-001–FR-095)

| ID | Requirement | Priority | Component | Test File | Status |
|----|-------------|----------|-----------|-----------|--------|
| FR-001 | Create/open/archive projects | P0 | `platform/orchestrator` | `tests/unit/project.test.ts` | `not_started` |
| FR-002 | Store goal/status/config/capability/artifacts | P0 | `packages/types`, DB schema | `tests/unit/types-and-schema.test.ts` | `tested` |
| FR-003 | Conversational Orchestrator | P0 | `platform/orchestrator` | `tests/integration/orchestrator.test.ts` | `not_started` |
| FR-004 | Conversations reference projects/tasks/artifacts/runs | P0 | `platform/orchestrator` | `tests/integration/conversation.test.ts` | `not_started` |
| FR-005 | Classify intent | P0 | `platform/orchestrator` | `tests/unit/intent-classifier.test.ts` | `not_started` |
| FR-006 | Clarify material ambiguity | P0 | `platform/orchestrator` | `tests/unit/clarification.test.ts` | `not_started` |
| FR-007 | Preserve relevant context | P0 | `platform/persistent-memory` | `tests/unit/context.test.ts` | `not_started` |
| FR-008 | Store decisions/assumptions with source/time | P1 | `platform/orchestrator` | `tests/unit/decisions.test.ts` | `not_started` |
| FR-010 | Translate intent into goals and criteria | P0 | `platform/orchestrator` | `tests/unit/planning.test.ts` | `not_started` |
| FR-011 | Task graph with dependencies/inputs/outputs/status | P0 | `platform/workflow-engine` | `tests/unit/task-graph.test.ts` | `not_started` |
| FR-012 | Adaptive workflow selection | P0 | `platform/workflow-engine` | `tests/unit/workflow-selection.test.ts` | `not_started` |
| FR-013 | Safe serial/parallel work | P1 | `platform/workflow-engine` | `tests/integration/parallel-work.test.ts` | `not_started` |
| FR-015 | Review consequential plans | P0 | `platform/policy-engine` | `tests/integration/plan-approval.test.ts` | `not_started` |
| FR-016 | Explicit workflow states | P0 | `platform/workflow-engine` | `tests/unit/workflow-states.test.ts` | `not_started` |
| FR-017 | Resume after interruption | P1 | `platform/workflow-engine` | `tests/integration/workflow-resume.test.ts` | `not_started` |
| FR-018 | Persistent checkpoints | P0 | `platform/workflow-engine` | `tests/unit/checkpoints.test.ts` | `not_started` |
| FR-020 | Registry for roles/skills/tools/models/capabilities | P0 | `platform/agent-registry` | `tests/unit/registry.test.ts` | `not_started` |
| FR-021 | Select agents by task | P0 | `platform/agent-registry` | `tests/unit/agent-selection.test.ts` | `not_started` |
| FR-022 | Agent uses compatible skills | P0 | `platform/agent-registry` | `tests/unit/skill-compat.test.ts` | `not_started` |
| FR-024 | Skip irrelevant agents | P0 | `platform/agent-registry` | `tests/unit/agent-skip.test.ts` | `not_started` |
| FR-025 | Scope every run by goal/context/permissions/budget | P0 | `platform/policy-engine` | `tests/unit/run-scope.test.ts` | `not_started` |
| FR-026 | Delegation | P1 | `platform/orchestrator` | `tests/unit/delegation.test.ts` | `not_started` |
| FR-027 | Record selection rationale | P1 | `platform/agent-registry` | `tests/unit/rationale.test.ts` | `not_started` |
| FR-028 | Agents cannot expand permissions | P0 | `platform/policy-engine` | `tests/security/permission-expansion.test.ts` | `not_started` |
| FR-030 | Artifact Registry | P0 | `platform/artifact-registry` | `tests/unit/artifact.test.ts` | `not_started` |
| FR-031 | Type/version/status/provenance/task links | P0 | `platform/artifact-registry` | `tests/unit/artifact-model.test.ts` | `not_started` |
| FR-032 | Store documents/code/tests/designs/reports | P0 | `platform/artifact-registry` | `tests/integration/artifact-store.test.ts` | `not_started` |
| FR-034 | Reference artifacts from conversation/workflow/approval | P0 | `platform/artifact-registry` | `tests/integration/artifact-refs.test.ts` | `not_started` |
| FR-035 | Draft/approved/verified/released/superseded/failed states | P0 | `platform/artifact-registry` | `tests/unit/artifact-states.test.ts` | `not_started` |
| FR-036 | Review before dependent stages | P0 | `platform/policy-engine` | `tests/integration/artifact-review.test.ts` | `not_started` |
| FR-040 | Git integration | P1 | `platform/orchestrator` | `tests/integration/git.test.ts` | `not_started` |
| FR-041 | Isolated branch/worktree | P1 | `infrastructure/local-runner` | `tests/integration/worktree.test.ts` | `not_started` |
| FR-042 | Execute allowed commands/build/lint/tests | P1 | `infrastructure/local-runner` | `tests/integration/execution.test.ts` | `not_started` |
| FR-043 | Execution logs | P0 | `platform/observability` | `tests/unit/exec-logs.test.ts` | `not_started` |
| FR-044 | Cloud sandbox/local runner adapters | P1 | `infrastructure/local-runner` | `tests/integration/sandbox.test.ts` | `not_started` |
| FR-047 | Network/filesystem/env/secrets policy | P0 | `platform/policy-engine` | `tests/security/sandbox-policy.test.ts` | `not_started` |
| FR-048 | Failed commands never reported successful | P0 | `platform/orchestrator` | `tests/unit/false-success.test.ts` | `not_started` |
| FR-050 | Requirements/user flows before complex UI | P1 | `apps/web` | `tests/e2e/design-flow.test.ts` | `not_started` |
| FR-060 | Task-appropriate quality criteria | P0 | `platform/quality-engine` | `tests/unit/quality-criteria.test.ts` | `not_started` |
| FR-061 | Relevant checks before verification | P0 | `platform/quality-engine` | `tests/unit/quality-checks.test.ts` | `not_started` |
| FR-063 | Failed mandatory gates block release | P0 | `platform/quality-engine` | `tests/unit/gate-blocking.test.ts` | `not_started` |
| FR-065 | Policy-controlled production deployment | P0 | `platform/policy-engine` | `tests/integration/deploy-policy.test.ts` | `not_started` |
| FR-070 | Conversational ForgeOS changes | P0 | `platform/platform-builder` | `tests/integration/platform-builder.test.ts` | `not_started` |
| FR-071 | Inspect existing capabilities | P0 | `platform/platform-builder` | `tests/unit/capability-inspect.test.ts` | `not_started` |
| FR-073 | Versioned PlatformChangeSet | P0 | `platform/platform-builder` | `tests/unit/changeset.test.ts` | `not_started` |
| FR-075 | Isolated implementation | P0 | `platform/platform-builder` | `tests/integration/isolated-impl.test.ts` | `not_started` |
| FR-077 | Approve/reject/request revisions | P0 | `platform/policy-engine` | `tests/integration/approval.test.ts` | `not_started` |
| FR-080 | No silent production changes | P0 | `platform/platform-builder` | `tests/security/silent-change.test.ts` | `not_started` |
| FR-090 | Structured workflow/tool logs | P0 | `platform/observability` | `tests/unit/structured-logs.test.ts` | `not_started` |
| FR-091 | Explain failure/recovery | P0 | `platform/orchestrator` | `tests/unit/failure-explain.test.ts` | `not_started` |
| FR-092 | Budget/time/concurrency/retry limits | P0 | `platform/policy-engine` | `tests/unit/limits.test.ts` | `not_started` |
| FR-093 | Audit sensitive actions | P0 | `platform/observability` | `tests/security/audit.test.ts` | `not_started` |
| FR-094 | Model routing | P1 | `platform/model-gateway` | `tests/unit/model-routing.test.ts` | `not_started` |
| FR-095 | Outcome-based agent evaluation | P1 | `platform/quality-engine` | `tests/unit/agent-eval.test.ts` | `not_started` |

---

## Memory Requirements (MEM-001–MEM-018)

| ID | Requirement | Component | Test File | Status |
|----|-------------|-----------|-----------|--------|
| MEM-001 | Lifecycle states (candidate→active→archived) | `platform/persistent-memory` | `tests/unit/memory-lifecycle.test.ts` | `not_started` |
| MEM-002 | Event-driven candidate capture | `platform/persistent-memory` | `tests/integration/memory-capture.test.ts` | `not_started` |
| MEM-003 | Candidate extraction with provenance | `platform/persistent-memory` | `tests/unit/memory-extraction.test.ts` | `not_started` |
| MEM-004 | Validation (permissions/secrets/duplicates/conflicts) | `platform/persistent-memory` | `tests/unit/memory-validation.test.ts` | `not_started` |
| MEM-005 | Retrieval with metadata/full-text/optional semantic | `platform/persistent-memory` | `tests/unit/memory-retrieval.test.ts` | `not_started` |
| MEM-006 | Bounded context package for Orchestrator | `platform/persistent-memory` | `tests/integration/memory-context.test.ts` | `not_started` |
| MEM-007 | Scope-based access control | `platform/persistent-memory` | `tests/security/memory-isolation.test.ts` | `not_started` |
| MEM-008 | Versioning (no silent last-write-wins) | `platform/persistent-memory` | `tests/unit/memory-versioning.test.ts` | `not_started` |
| MEM-009 | Staleness/conflict detection | `platform/persistent-memory` | `tests/unit/memory-staleness.test.ts` | `not_started` |
| MEM-010 | Governed promotion with approval | `platform/persistent-memory` | `tests/integration/memory-promotion.test.ts` | `not_started` |
| MEM-011 | User/agent feedback | `platform/persistent-memory` | `tests/unit/memory-feedback.test.ts` | `not_started` |
| MEM-012 | Maintenance (dedupe/consolidate/archive) | `platform/persistent-memory` | `tests/unit/memory-maintenance.test.ts` | `not_started` |
| MEM-013 | Correction/deletion with cache invalidation | `platform/persistent-memory` | `tests/unit/memory-correction.test.ts` | `not_started` |
| MEM-014 | Retrieval explainability | `platform/persistent-memory` | `tests/unit/memory-explain.test.ts` | `not_started` |
| MEM-015 | Observability (telemetry, no sensitive content in metrics) | `platform/persistent-memory` | `tests/unit/memory-telemetry.test.ts` | `not_started` |
| MEM-016 | Graceful degradation on outage | `platform/persistent-memory` | `tests/integration/memory-outage.test.ts` | `not_started` |
| MEM-017 | Memory Center UI | `apps/web` | `tests/e2e/memory-center.test.ts` | `not_started` |
| MEM-018 | No false authority over policy/instructions | `platform/persistent-memory` | `tests/security/memory-injection.test.ts` | `not_started` |

---

## Acceptance Test Scenarios (A–K)

| ID | Scenario | Status |
|----|----------|--------|
| A | Static website delivery end-to-end | `not_started` |
| B | Dynamic SaaS task | `not_started` |
| C | Bug fix workflow | `not_started` |
| D | Marketing capability | `not_started` |
| E | Mobile support | `not_started` |
| F | Self-healing workflow | `not_started` |
| G | Production deployment under policy | `not_started` |
| H | Provider outage recovery | `not_started` |
| I | Prompt injection defense | `not_started` |
| J | Restart recovery | `not_started` |
| K | Failed platform change rollback | `not_started` |

---

*Last updated: 2026-10-24 — Update this file as requirements move from `not_started` toward `verified`.*
