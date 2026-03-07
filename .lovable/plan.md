

## Plan: Add Browser Preview Panel to Autonomous Test Execution

### What the user wants
The center panel currently only shows script code and error tabs. The user wants a **live browser preview** that simulates navigating and executing the test cases visually — similar to how TestSprite/Momentic show a browser viewport during test runs.

### Approach
Restructure the center panel to have two sections stacked vertically using resizable panels:

1. **Top: Browser Preview** — An iframe showing the `base_url` of the autonomous project, with a simulated browser chrome (URL bar, navigation buttons, loading indicator). During test execution, show animated step-by-step logs overlaid on the preview to simulate the AI navigating and interacting with the page.

2. **Bottom: Script & Results Tabs** — The existing tabs (Script, Error, Trace, Cause, Fix) move to the bottom half.

### Implementation Details

**File: `src/components/autonomous-testing/TestExecutionView.tsx`**

- Add a `BrowserPreview` section at the top of the center panel:
  - Simulated browser chrome with back/forward/refresh buttons and a URL bar showing the current URL
  - An `<iframe>` loading `autonomousProject.base_url` (sandboxed)
  - When a test is "running", show an animated execution log overlay with step-by-step actions (e.g., "Clicking nav link...", "Waiting for page load...", "Asserting element visible...")
  - Status indicator: green border when passed, red when failed, blue pulsing when running
- Use `ResizablePanelGroup` (already available) to split the center panel vertically into browser preview (top ~55%) and script/results (bottom ~45%)
- Add simulated execution steps per test case that display sequentially during the run with timestamps
- When not running, show the iframe with a "Ready to execute" overlay

**Simulated execution steps** (generated per test name):
- Navigate to URL
- Wait for page load
- Find element / Click element
- Assert visibility / Assert text content
- Screenshot captured

### Files to Edit
| File | Action |
|------|--------|
| `src/components/autonomous-testing/TestExecutionView.tsx` | Add browser preview with iframe, execution step log, resizable split layout |

No database changes needed.

