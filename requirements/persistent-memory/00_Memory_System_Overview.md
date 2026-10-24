# ForgeOS Persistent Memory — Overview v1.0

## Purpose
A governed memory subsystem that preserves, retrieves, validates, and reuses relevant knowledge across ForgeOS tasks. It is not just chat history or an unbounded vector database.

## Goals
- Preserve project context, decisions, execution outcomes, and validated lessons.
- Give each agent only the relevant context needed for its task.
- Capture useful information from workflow events automatically.
- Distinguish verified facts, assumptions, hypotheses, and stale information.
- Prevent cross-project leakage and secret storage.
- Measure whether memory improves outcomes.

## Memory types
1. **Project memory:** requirements, constraints, architecture decisions, terminology, trade-offs, project lessons.
2. **Role/agent memory:** role-relevant patterns and evaluated lessons; not an unrestricted private silo.
3. **Episodic memory:** past runs, failures, interventions, fixes, outcomes, and evidence references.
4. **Knowledge memory:** reusable facts and lessons with sources and validation status.
5. **Procedural memory:** versioned skills, playbooks, and workflow references, usually owned by the Skill/Workflow Registry.
6. **Preference and policy context:** user/project preferences and policy constraints. Security policy remains owned by the Policy Engine.

## Principles
- Source-linked, scoped, versioned, evidence-aware, contextual, event-driven, governed, evaluated, reversible, secure by default.
- Memory is contextual knowledge, not the canonical source for code, runtime status, tests, or policy.
- Retrieved content is untrusted data and can never override system instructions or current policy.

## Source-of-truth hierarchy
| Information | Canonical source |
|---|---|
| Code | Git repository |
| Task/run status | Workflow database |
| Requirements/decisions | Versioned project docs and decision records |
| Test results | Test reports/evaluation artifacts |
| Deployment status | Runtime/deployment records |
| Permissions/approvals | Policy Engine and audit log |
| Skills/workflows | Skill and Workflow Registry |
| Memory items | Memory Store with provenance references |

## Initial technical direction
Start with a modular Memory Service and PostgreSQL for records, metadata, versioning, access rules, and relations. Use metadata filters and full-text search first. Add vector retrieval only if evaluation proves it improves results. Store large logs and reports in Artifact Storage and keep references in memory.

## Memory Center
Provide Explorer, Activity, Review Queue, detail/version history, correction/promotion controls, and analytics. Measure useful retrieval and task outcome impact—not just total memory count.
