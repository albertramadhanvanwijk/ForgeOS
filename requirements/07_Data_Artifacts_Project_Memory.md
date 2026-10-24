# 07 --- Data, Artifacts & Project Memory

Separate operational state (workflow/task/approval/execution), project
knowledge (requirements/decisions/constraints), and concrete artifacts;
connect them with stable IDs.

Entities: User, Project, Conversation, Requirement, Decision,
WorkflowDefinition/Run, Task, AgentDefinition/Run, SkillDefinition,
ToolDefinition, Artifact/Version, Approval, QualityGate, ValidationRun,
PlatformChangeSet, CapabilityNode/Edge, AuditEvent, Release.

Artifact metadata: ID, project, type/title/version/status/storage ref,
creator/timestamps, source task/run, parent refs, content hash if
useful, metadata, sensitivity, retention. Large files belong in object
storage/filesystem, not indiscriminately in DB. Types include PRD,
requirement, flow, wireframe, mockup, tokens, code, API contract,
migration, test/security report, build output, deployment record,
research report, data analysis, final deliverable, platform change.

Trace producer, requirements, task/run, parent version, tests/reviews,
approvals, and release. Preserve important history.

Project memory categories: facts, requirements, decisions, architecture,
execution history, validated fixes, user-approved project preferences,
open issues. Store source/time/confidence/validity. Mark assumptions;
detect stale/conflicting decisions; avoid secrets; support correction;
retrieve relevant context only.

Context Manager selects
task/criteria/dependencies/artifacts/decisions/relevant
code/results/permissions/tools/output schema; controls size and
preserves key facts during compaction. Knowledge graph may use
relational tables in MVP. Define retention and backup for DB, artifacts,
logs, workflow history, memory, tests, releases; test restore.

Acceptance: artifacts trace to source; approved versions identifiable;
context retrieved selectively; conflicts visible; workflows resume;
backups restore to defined objectives.
