# 02 --- Functional Requirements

Priority: P0 foundation; P1 important; P2 later.

## Projects and conversation

FR-001 P0 create/open/archive projects. FR-002 P0 store
goal/status/configuration/capability profile/artifacts. FR-003 P0
conversational Orchestrator. FR-004 P0 conversations reference
projects/tasks/artifacts/runs. FR-005 P0 classify
create/modify/investigate/troubleshoot. FR-006 P0 clarify material
ambiguity. FR-007 P0 preserve relevant context. FR-008 P1 store
decisions and assumptions with source/time.

## Planning/workflows

FR-010 P0 translate intent into goals and criteria. FR-011 P0 task graph
with dependencies/input/output/status. FR-012 P0 adaptive workflow
selection. FR-013 P1 safe serial/parallel work. FR-014 P1 estimate
cost/duration/risk where possible. FR-015 P0 review consequential plans.
FR-016 P0 explicit workflow states. FR-017 P1 resume after interruption.
FR-018 P0 persistent checkpoints.

## Agent/tool registry

FR-020 P0 registry for roles/skills/tools/models/capabilities. FR-021 P0
select agents by task. FR-022 P0 agent may use compatible skills. FR-023
P1 multiple instances per role. FR-024 P0 skip irrelevant agents. FR-025
P0 scope every run by goal/context/permissions/budget/output. FR-026 P1
delegation. FR-027 P1 record selection rationale. FR-028 P0 agents
cannot expand permissions.

## Artifacts and execution

FR-030 P0 Artifact Registry. FR-031 P0
type/version/status/provenance/task links. FR-032 P0 store
documents/code/tests/designs/reports. FR-033 P1 compare versions. FR-034
P0 reference artifacts from conversation/workflow/approval. FR-035 P0
applicable draft/approved/verified/released/superseded/failed states.
FR-036 P0 review before dependent stages. FR-040 P1 Git integration.
FR-041 P1 isolated branch/worktree. FR-042 P1 execute allowed
commands/build/lint/tests. FR-043 P0 execution logs. FR-044 P1 cloud
sandbox/local runner adapters. FR-045 P1 preview. FR-046 P1 diff/change
summary. FR-047 P0 network/filesystem/env/secrets policy. FR-048 P0
failed commands never reported successful.

## Design/quality/release

FR-050 P1 requirements/user flows before complex UI where useful. FR-051
P1 sitemap/wireframe/mockup/tokens/components. FR-052 P1 approve/revise
design. FR-053 P1 use approved design system. FR-054 P1 impact analysis
on design change. FR-055 P2 visual validation. FR-060 P0
task-appropriate criteria. FR-061 P0 relevant checks before
verification. FR-062 P1 conditional QA/code/security/visual review.
FR-063 P0 failed mandatory gates block release. FR-064 P1 bounded
auto-repair. FR-065 P0 policy-controlled production deployment. FR-066
P1 release records. FR-067 P1 rollback/compensation where feasible.

## Platform Builder

FR-070 P0 conversational ForgeOS changes. FR-071 P0 inspect existing
capabilities. FR-072 P0 find reuse/gaps. FR-073 P0 versioned
PlatformChangeSet. FR-074 P0 impact across
roles/skills/workflows/data/API/UI/policy/tests. FR-075 P0 isolated
implementation. FR-076 P0 test/review/preview before release. FR-077 P0
approve/reject/request revisions. FR-078 P1 update capability graph
after verified release. FR-079 P1 version history/recovery. FR-080 P0 no
silent production changes.

## Governance/observability

FR-090 P0 structured workflow/tool logs. FR-091 P0 explain
failure/recovery. FR-092 P0 budget/time/concurrency/retry limits. FR-093
P0 audit sensitive actions. FR-094 P1 model routing. FR-095 P1
outcome-based agent evaluation.
