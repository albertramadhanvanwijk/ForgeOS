# 13 --- Implementation Roadmap

Phase 0 Repository discovery: audit architecture, stack, persistence,
runtime, integrations, mock data, placeholders, tests; produce
current-state report, gap analysis, target architecture,
dependency-aware plan. Exit: actual state documented.

Phase 1 Core foundation: projects/conversations/tasks, role/skill/tool
registry, artifacts, permissions/approvals, persistent workflows, audit,
API contracts, basic project workspace. Exit: simple workflow persists,
traces artifacts, recovers after restart.

Phase 2 End-to-end engineering: Orchestrator, adaptive planning,
provider adapters, execution, Git, isolated workspace, build/test,
preview, diff, quality gates. Exit: real software task verified.

Phase 3 Design/intelligence: Design Studio, traceability, memory,
context manager, visual validation if supported, capability profiles,
adaptive selection, change impact. Exit:
requirements/design/implementation/tests linked.

Phase 4 Platform Builder: capability graph, introspection, impact
analysis, PlatformChangeSet, isolated changes, adaptive UI, validation,
approvals/release, reconciliation, history/recovery. Exit:
conversational changes safely tested/released.

Phase 5 Reliability/intelligence: self-healing, evaluation, model/cost
routing, recovery, concurrency, context compaction, environment manager,
observability. Exit: bounded recovery and measurable quality/cost.

Phase 6 Production/expansion: deployment, monitoring, backup/restore,
rollback, extra runtime adapters, mobile/desktop, integrations,
capability packs, multi-user if needed. Exit: added capabilities have
tests, policy, docs, recovery.

Recommended sequence: audit → persistence/workflow →
permissions/approvals → adaptive orchestration →
execution/Git/build/test → verified delivery → design/memory → Platform
Builder → reliability and expansion. Do not build all phases
simultaneously.
