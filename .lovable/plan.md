
# Project Health Progress Bar for Dashboard

## Overview
Add a visual Project Health progress bar for each project displayed in the "All Projects" section of the Dashboard. The health will be calculated based on test execution pass rates.

## What is Project Health?
Project Health represents the percentage of **passed test executions** compared to all executed tests for that project. A higher percentage indicates better quality.

- **100% Health**: All executed tests passed
- **0% Health**: No tests passed (or no tests executed yet)
- **Color coding**: Green (good), Yellow (moderate), Red (needs attention)

---

## Implementation Steps

### 1. Update Project Interface
Add health-related fields to track each project's test execution statistics:
- `passedCount`: Number of passed test executions
- `totalExecuted`: Total number of executed tests (excluding "not_run")
- `healthPercentage`: Calculated pass rate

### 2. Enhance Data Fetching
Modify `fetchDashboardData` to:
- Query `test_runs` for each project
- Query `test_executions` to count passed vs total executed
- Calculate health percentage per project

### 3. Create Health Progress Bar UI
For each project card, display:
- A compact progress bar showing health percentage
- Color-coded indicator (green/yellow/red based on thresholds)
- Percentage text label
- Fallback display for projects with no test data

---

## Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar]  Project Name                                     │
│            Workspace Name                                   │
│                                                             │
│            Health: ████████░░░░░░░░ 72%       [Active]  →  │
│                    ↑ Green/Yellow/Red bar                   │
└─────────────────────────────────────────────────────────────┘
```

**Color Thresholds:**
- Green (Success): 70% and above
- Yellow (Warning): 40-69%
- Red (Destructive): Below 40%

---

## Technical Details

### Data Query Strategy
```
For each project:
1. Get test_runs where project_id = project.id
2. Get test_executions where test_run_id in [run_ids]
3. Count: status = 'passed' → passedCount
4. Count: status != 'not_run' → totalExecuted
5. Calculate: (passedCount / totalExecuted) × 100
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add health data fetching, update Project interface, render Progress bar with color coding |

### UI Components Used
- `Progress` from `@/components/ui/progress` (already available)
- Custom color classes for health thresholds

### Performance Consideration
The health calculation will be done in a batch query approach to minimize database calls - fetching all test runs and executions for user's projects in one go, then mapping to individual projects client-side.

---

## Edge Cases Handled

1. **No test runs**: Show "No tests" label instead of progress bar
2. **All tests "not_run"**: Show 0% with appropriate messaging
3. **Loading state**: Skeleton placeholder for progress bar
4. **New projects**: Graceful fallback display
