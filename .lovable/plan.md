

## Plan: Team Lead / Manager Capabilities Enhancement

### Current State
The codebase already has:
- RBAC with admin/manager/tester/viewer roles (`useRBAC`)
- Reviewer assignment in TestCaseDetailDialog (managers can assign reviewers when status is `submitted_for_review`)
- Test run creation with test case selection
- Basic execution stats (passed/failed/blocked/not_run per run)
- Notifications system

### What's Missing
1. **Assign test cases for execution to specific testers** - Test executions have an `assigned_to` column but it's never populated via UI
2. **Manager progress/metrics dashboard** - No dedicated manager view showing review queue, execution progress per tester, team productivity
3. **Configurable final approval before execution** - The approve → ready flow exists but isn't role-gated to managers only

### Implementation Plan

#### 1. Assign Testers to Executions in Test Runs
**Files:** `src/pages/TestExecution.tsx`, `src/hooks/useTestRuns.tsx`

- In the Create Test Run dialog, add an "Assign To" dropdown per test case (or bulk assign) using workspace members
- Pass `assigned_to` when creating `test_executions` rows
- Show assigned tester name in the execution table
- Add an "Assign" action button in execution rows for post-creation assignment
- Add `assignExecution` mutation to `useTestRuns` hook

#### 2. Manager Progress Dashboard
**File:** Create `src/components/test-execution/ManagerDashboard.tsx`

- Add a collapsible "Manager View" section at the top of Test Execution page (visible only to manager+ roles)
- Cards showing: Review Queue (pending reviews count), Execution Progress (by tester), Overall Pass Rate, Blocked Items
- A table showing tester-level breakdown: tester name, assigned count, completed count, pass rate
- Use existing query data from `useTestRuns` and `useTestCases`

#### 3. Role-Gate Approve & Mark Ready Actions
**Files:** `src/pages/TestRepository.tsx`, `src/components/test-cases/TestCaseDetailDialog.tsx`

- Pass `useRBAC` role info into `TestCaseDetailDialog`
- Only show "Approve" button if user has manager+ role
- Only show "Mark Ready for Execution" if user has manager+ role
- Add configurable setting: if project setting `require_manager_approval` is true, enforce manager-only approval; otherwise allow any tester+ to approve

#### 4. Bulk Assign Reviewer in Test Repository
**File:** `src/pages/TestRepository.tsx`

- Add multi-select checkboxes to test case rows
- Add bulk action bar: "Assign Reviewer" for selected test cases in `submitted_for_review` status
- Manager can select a reviewer from workspace members dropdown and apply to all selected

#### 5. Track Progress & Metrics in Test Repository
**File:** `src/pages/TestRepository.tsx`

- Enhance existing stats cards with: "Pending My Review" count (for managers), "Awaiting Approval" count
- Add a mini progress bar showing lifecycle funnel: Draft → In Review → Approved → Ready

### Technical Details

- `test_executions.assigned_to` column already exists in DB — just needs UI wiring
- RBAC checks use `useRBAC(workspaceId)` with `hasMinRole('manager')` 
- Notifications already fire on reviewer assignment and submission — extend to fire on execution assignment
- No DB migrations needed — all required columns exist

### Files to Create/Edit
| File | Action |
|------|--------|
| `src/pages/TestExecution.tsx` | Add assign-to-tester UI in create dialog and execution table |
| `src/hooks/useTestRuns.tsx` | Add `assignExecution` mutation |
| `src/pages/TestRepository.tsx` | Add bulk actions, role-gated buttons, enhanced stats |
| `src/components/test-cases/TestCaseDetailDialog.tsx` | Role-gate approve/ready buttons via new prop |
| `src/components/test-execution/ManagerDashboard.tsx` | New — manager metrics panel |

