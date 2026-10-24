# Requirements Traceability

| ID | Requirement | Component | Minimum verification |
|---|---|---|---|
| MEM-001 | Lifecycle | Memory Service | State transition tests |
| MEM-002 | Event capture | Event consumer | Idempotency/retry tests |
| MEM-003 | Provenance | Source registry | Source-link assertions |
| MEM-004 | Validation/secrets | Validation pipeline | Secret/conflict tests |
| MEM-005 | Scope isolation | Auth/policy | Cross-project denial tests |
| MEM-006 | Retrieval | Retrieval service | Relevance/permission tests |
| MEM-007 | Bounded context | Orchestrator adapter | Context budget tests |
| MEM-008 | Versioning/correction | Repository | Version history tests |
| MEM-009 | Staleness/conflicts | Retrieval/maintenance | Stale/conflict tests |
| MEM-010 | Governed promotion | Policy/review workflow | Approval/denial tests |
| MEM-011 | Memory Center | Frontend | UI/accessibility tests |
| MEM-012 | Feedback/evaluation | Evaluation service | Persistence/outcome tests |
| MEM-013 | Retention/deletion | Retention worker | Index/cache removal tests |
| MEM-014 | Observability | Telemetry | Redaction/metrics tests |
| MEM-015 | Graceful degradation | Orchestrator | Outage/risk policy tests |
| MEM-016 | Injection resistance | Agent context boundary | Adversarial memory tests |

Update status from repository evidence, not assumptions.
