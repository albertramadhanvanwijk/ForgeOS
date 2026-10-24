# 04 --- Agent Intelligence & Orchestration

Role = responsibility; agent instance = runtime executor; skill =
reusable capability; tool = concrete operation. Do not equate role with
a permanently running agent.

Initial roles: Orchestrator/Engineering Manager, Product Manager,
Business Analyst, Research Agent, Project Coordinator; UX Researcher,
UX/UI Designer, Design System Specialist, Accessibility Specialist;
Solution Architect, Frontend/Backend Engineer, Database Specialist,
Integration Engineer, Mobile/Desktop Engineer, Data Engineer,
Performance Engineer; QA, Code Reviewer, Security Engineer, DevOps, SRE,
Incident Responder, Release Manager; Technical Writer, FinOps,
Evaluation Engineer, Platform Architect, Agent/Workflow Engineer,
Platform QA. This is a selectable catalog, not a mandatory team per
project.

Project capability profile records product/output types, platforms,
features, integrations, data sensitivity, deployment target, design
complexity, quality criteria, and approvals. Mark facts, assumptions,
and user decisions separately.

Selection: define outcome; decompose tasks; determine skills/tools;
match capability; check permission, availability, model, cost, runtime;
check dependencies/parallelism; record rationale; evaluate output. Agent
contracts include version, role, skills, required capabilities,
input/output schemas, allowed tools, permission profile, time/cost
budgets, retry/escalation and evaluation policies.

Parallelize only with satisfied dependencies and controlled
shared-resource conflicts. Support concurrency limits, cancellation,
timeouts, retries, conflict detection, merge/reconciliation. Escalate on
missing capabilities, conflicting sources, material ambiguity, poor
quality, budget/time overruns, permission gaps, or insufficient
evidence.

Route models by quality, modality/reasoning, latency, cost, privacy,
availability, and tool compatibility. Evaluate by task success, schema
validity, tool success, test pass rate, defects/regressions, cost per
verified outcome, duration, retries, escalation quality, and permission
violations.
