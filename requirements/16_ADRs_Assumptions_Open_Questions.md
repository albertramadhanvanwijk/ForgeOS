# 16 --- ADRs, Assumptions & Open Questions

Decisions: ADR-001 outcome-first; ADR-002 adaptive workforce; ADR-003
modular monolith first; ADR-004 artifact-driven traceability; ADR-005
persistent orchestration; ADR-006 controlled platform evolution via
PlatformChangeSet; ADR-007 adaptive UI not one page per agent; ADR-008
security/permission/approval/audit by design; ADR-009 evidence-based
completion.

Assumptions to verify by audit: initial use primarily one owner;
TypeScript suitable if consistent with repo; PostgreSQL for relational
state; object storage/local storage for artifacts; model providers via
adapters; cloud sandbox/local runner may be needed; capabilities added
incrementally. These are not claims about current repository.

Open questions: actual stack/repository; auth/persistence status; first
model providers; local runner requirement; existing execution
environment; Git/deployment targets; cost/concurrency budgets; secret
management; test framework; first Platform Builder release scope; MVP
mandatory capabilities; RPO/RTO/log-retention/backup targets. Ask only
when unknown decisions materially affect implementation; otherwise use
documented reversible defaults.
