import type { ExecutionStep } from "./BrowserPreview";

export interface HealingAttempt {
  originalSelector: string;
  triedSelectors: string[];
  healedSelector: string | null;
  strategy: string;
}

interface TestInstruction {
  action: "navigate" | "click" | "type" | "assert" | "wait" | "scroll" | "screenshot" | "submit" | "search";
  target?: string;
  value?: string;
  assertion?: string;
  selectors: string[];      // primary + fallback selectors
  description: string;
}

// Parse a test case description/name into concrete instructions
export function parseTestInstructions(
  testName: string,
  testDescription: string | null,
  baseUrl: string
): TestInstruction[] {
  const desc = (testDescription || "").toLowerCase();
  const name = testName.toLowerCase();
  const instructions: TestInstruction[] = [];

  // Always start with navigation
  instructions.push({
    action: "navigate",
    target: baseUrl,
    selectors: [],
    description: `Navigate to ${baseUrl}`,
  });

  instructions.push({
    action: "wait",
    selectors: ["document.readyState === 'complete'"],
    description: "Wait for DOM content loaded",
  });

  // ---- Parse description lines for explicit steps ----
  const lines = (testDescription || "").split(/\n|;|\.\s/).filter(l => l.trim().length > 5);

  if (lines.length > 2) {
    // User provided detailed steps — parse each one
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      const original = line.trim();

      if (trimmed.match(/^(go to|navigate|open|visit|load)/)) {
        const urlMatch = original.match(/(https?:\/\/\S+|\/\S+)/);
        instructions.push({
          action: "navigate",
          target: urlMatch ? urlMatch[1] : baseUrl,
          selectors: [],
          description: original,
        });
      } else if (trimmed.match(/^(click|tap|press|hit|select)\b/)) {
        const target = extractTarget(original);
        instructions.push({
          action: "click",
          target,
          selectors: generateSelectors(target),
          description: original,
        });
      } else if (trimmed.match(/^(type|enter|input|fill|write)\b/)) {
        const { target, value } = extractTypeInfo(original);
        instructions.push({
          action: "type",
          target,
          value,
          selectors: generateSelectors(target),
          description: original,
        });
      } else if (trimmed.match(/^(verify|assert|check|expect|should|confirm|ensure|validate)\b/)) {
        instructions.push({
          action: "assert",
          assertion: original,
          selectors: generateAssertionSelectors(original),
          description: original,
        });
      } else if (trimmed.match(/^(wait|pause|delay)\b/)) {
        instructions.push({
          action: "wait",
          selectors: [],
          description: original,
        });
      } else if (trimmed.match(/^(scroll|swipe)\b/)) {
        instructions.push({
          action: "scroll",
          selectors: [],
          description: original,
        });
      } else if (trimmed.match(/^(submit|send)\b/)) {
        instructions.push({
          action: "submit",
          selectors: ["button[type='submit']", "form", "button:has-text('Submit')"],
          description: original,
        });
      } else if (trimmed.match(/^(search|find|look for)\b/)) {
        instructions.push({
          action: "search",
          value: extractSearchTerm(original),
          selectors: ["input[type='search']", "input[placeholder*='search']", "[role='searchbox']"],
          description: original,
        });
      } else if (trimmed.length > 10) {
        // Fallback: treat as an assertion
        instructions.push({
          action: "assert",
          assertion: original,
          selectors: generateAssertionSelectors(original),
          description: original,
        });
      }
    }
  } else {
    // No detailed steps — generate intelligent steps from name
    const generated = generateInstructionsFromName(name, desc, baseUrl);
    instructions.push(...generated);
  }

  // Always end with screenshot
  instructions.push({
    action: "screenshot",
    selectors: [],
    description: "Capture final state screenshot",
  });

  return instructions;
}

function extractTarget(line: string): string {
  // Extract the target element from a click/tap instruction
  const patterns = [
    /(?:click|tap|press|select)\s+(?:on\s+)?(?:the\s+)?['"]([^'"]+)['"]/i,
    /(?:click|tap|press|select)\s+(?:on\s+)?(?:the\s+)?(.+?)(?:\s+button|\s+link|\s+icon|\s+tab|\s+menu)?$/i,
  ];
  for (const p of patterns) {
    const m = line.match(p);
    if (m) return m[1].trim();
  }
  return line.replace(/^(click|tap|press|select)\s+(on\s+)?(the\s+)?/i, "").trim();
}

function extractTypeInfo(line: string): { target: string; value: string } {
  const patterns = [
    /(?:type|enter|input|fill)\s+['"]([^'"]+)['"]\s+(?:in|into|on)\s+(?:the\s+)?(.+)/i,
    /(?:type|enter|input|fill)\s+(.+?)\s+(?:in|into|on)\s+(?:the\s+)?(.+)/i,
  ];
  for (const p of patterns) {
    const m = line.match(p);
    if (m) return { value: m[1].trim(), target: m[2].trim() };
  }
  return { target: "input field", value: "test data" };
}

function extractSearchTerm(line: string): string {
  const m = line.match(/(?:search|find|look for)\s+(?:for\s+)?['"]?([^'"]+?)['"]?\s*$/i);
  return m ? m[1].trim() : "test query";
}

function generateSelectors(target: string): string[] {
  const t = target.toLowerCase();
  const selectors: string[] = [];

  // Generate multiple selector strategies for self-healing
  selectors.push(`[data-testid="${t.replace(/\s+/g, "-")}"]`);
  selectors.push(`button:has-text("${target}")`);
  selectors.push(`a:has-text("${target}")`);
  selectors.push(`[aria-label="${target}"]`);
  selectors.push(`text="${target}"`);
  selectors.push(`.${t.replace(/\s+/g, "-")}`);
  selectors.push(`#${t.replace(/\s+/g, "-")}`);

  return selectors;
}

function generateAssertionSelectors(assertion: string): string[] {
  const keywords = assertion.match(/['"]([^'"]+)['"]/g);
  if (keywords) {
    return keywords.map(k => `text=${k}`);
  }
  return [`text="${assertion.slice(0, 30)}"`];
}

function generateInstructionsFromName(name: string, desc: string, baseUrl: string): TestInstruction[] {
  const instructions: TestInstruction[] = [];

  if (name.includes("login") || name.includes("sign in") || name.includes("auth")) {
    instructions.push(
      { action: "search", selectors: ["input[type='email']", "#email", "[name='email']", "input[placeholder*='email']"], description: "Locate email input field", value: "" },
      { action: "type", target: "email field", value: "testuser@example.com", selectors: ["input[type='email']", "#email", "[name='email']"], description: "Enter email address" },
      { action: "type", target: "password field", value: "SecurePass123!", selectors: ["input[type='password']", "#password", "[name='password']"], description: "Enter password" },
      { action: "click", target: "Sign In button", selectors: ["button[type='submit']", "button:has-text('Sign In')", "button:has-text('Log In')", "[data-testid='login-btn']"], description: "Click Sign In button" },
      { action: "wait", selectors: [], description: "Wait for authentication response" },
      { action: "assert", assertion: "User redirected to dashboard", selectors: ["text='Dashboard'", "[data-testid='dashboard']", "h1"], description: "Verify redirect to dashboard" },
    );
  } else if (name.includes("navigation") || name.includes("routing") || name.includes("menu")) {
    instructions.push(
      { action: "search", selectors: ["nav", "[role='navigation']", "header nav", ".navbar"], description: "Locate navigation elements" },
      { action: "assert", assertion: "Navigation bar is visible", selectors: ["nav", "[role='navigation']"], description: "Assert navigation bar exists" },
      { action: "click", target: "first nav link", selectors: ["nav a:first-child", "nav button:first-child", "[role='navigation'] a:first-child"], description: "Click first navigation link" },
      { action: "wait", selectors: [], description: "Wait for route change" },
      { action: "assert", assertion: "Page content updated without errors", selectors: ["main", "[role='main']", "#content"], description: "Verify page content loaded" },
      { action: "click", target: "second nav link", selectors: ["nav a:nth-child(2)", "nav button:nth-child(2)"], description: "Click second navigation link" },
      { action: "assert", assertion: "No 404 or error page", selectors: ["text!='404'", "text!='Not Found'"], description: "Verify no error pages" },
    );
  } else if (name.includes("search")) {
    instructions.push(
      { action: "click", target: "search input", selectors: ["input[type='search']", "[placeholder*='search']", "[role='searchbox']", "[data-testid='search']"], description: "Click search input" },
      { action: "type", target: "search box", value: "test product", selectors: ["input[type='search']", "[placeholder*='search']"], description: "Type search query" },
      { action: "wait", selectors: [], description: "Wait for search suggestions" },
      { action: "submit", selectors: ["button[type='submit']", "[aria-label='Search']"], description: "Submit search form" },
      { action: "assert", assertion: "Search results displayed", selectors: ["[data-testid='results']", ".search-results", "[role='list']"], description: "Verify results appear" },
    );
  } else if (name.includes("form") || name.includes("signup") || name.includes("register")) {
    instructions.push(
      { action: "search", selectors: ["form", "[role='form']"], description: "Locate form on page" },
      { action: "click", target: "submit without data", selectors: ["button[type='submit']"], description: "Click submit to test validation" },
      { action: "assert", assertion: "Validation errors shown", selectors: ["[role='alert']", ".error", ".invalid-feedback"], description: "Verify validation messages appear" },
      { action: "type", target: "name field", value: "Test User", selectors: ["input[name='name']", "#name", "[placeholder*='name']"], description: "Enter name" },
      { action: "type", target: "email field", value: "test@example.com", selectors: ["input[type='email']", "#email"], description: "Enter valid email" },
      { action: "submit", selectors: ["button[type='submit']"], description: "Submit form with valid data" },
      { action: "assert", assertion: "Success confirmation", selectors: ["text='Success'", "[role='alert']", ".toast"], description: "Verify success message" },
    );
  } else if (name.includes("cart") || name.includes("checkout") || name.includes("payment")) {
    instructions.push(
      { action: "click", target: "Add to Cart", selectors: ["button:has-text('Add to Cart')", "[data-testid='add-to-cart']", ".add-cart-btn"], description: "Click Add to Cart button" },
      { action: "wait", selectors: [], description: "Wait for cart update" },
      { action: "assert", assertion: "Cart badge updated", selectors: [".cart-badge", "[data-testid='cart-count']", ".badge"], description: "Verify cart count incremented" },
      { action: "click", target: "Cart icon", selectors: ["[data-testid='cart']", ".cart-icon", "a[href*='cart']"], description: "Open cart" },
      { action: "assert", assertion: "Item visible in cart", selectors: [".cart-item", "[data-testid='cart-item']"], description: "Verify item in cart" },
    );
  } else if (name.includes("responsive") || name.includes("mobile") || name.includes("layout")) {
    instructions.push(
      { action: "assert", assertion: "Desktop layout renders", selectors: ["body", "main"], description: "Verify desktop layout at 1920×1080" },
      { action: "screenshot", selectors: [], description: "Capture desktop layout" },
      { action: "wait", selectors: [], description: "Resize viewport to 768×1024 (tablet)" },
      { action: "assert", assertion: "Tablet layout adjusts", selectors: ["body"], description: "Verify tablet responsive design" },
      { action: "wait", selectors: [], description: "Resize viewport to 375×667 (mobile)" },
      { action: "search", selectors: ["[data-testid='mobile-menu']", ".hamburger", "[aria-label='Menu']", "button.menu-toggle"], description: "Locate mobile menu button" },
      { action: "click", target: "mobile menu", selectors: ["[data-testid='mobile-menu']", ".hamburger", "[aria-label='Menu']"], description: "Open mobile menu" },
      { action: "assert", assertion: "Mobile menu items visible", selectors: ["nav a", "[role='menuitem']"], description: "Verify mobile nav items" },
    );
  } else {
    // Generic test
    instructions.push(
      { action: "search", selectors: ["main", "[role='main']", "#content", "body > div"], description: "Scan page for interactive elements" },
      { action: "click", target: "primary CTA", selectors: ["button.primary", "[data-testid='cta']", "a.btn-primary", "button:first-of-type"], description: "Click primary call-to-action" },
      { action: "wait", selectors: [], description: "Wait for response" },
      { action: "assert", assertion: "Expected content visible", selectors: ["main", "[role='main']"], description: "Verify expected outcome" },
    );
  }

  return instructions;
}

// Convert parsed instructions into ExecutionSteps with self-healing support
export function buildExecutionSteps(
  instructions: TestInstruction[],
  baseUrl: string
): ExecutionStep[] {
  return instructions.map((inst) => ({
    action: formatAction(inst.action),
    detail: inst.description,
    icon: inst.action,
    targetUrl: inst.action === "navigate" ? (inst.target || baseUrl) : undefined,
    timestamp: "",
    status: "pending" as const,
    selectors: inst.selectors,
    value: inst.value,
    assertion: inst.assertion,
    healingAttempts: [],
  }));
}

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

// Self-healing engine: when primary selector fails, try alternatives
export interface HealingResult {
  healed: boolean;
  originalSelector: string;
  healedSelector: string | null;
  attemptsMade: number;
  strategy: string;
}

export function simulateSelfHealing(
  selectors: string[],
  stepIndex: number
): HealingResult | null {
  if (selectors.length < 2) return null;

  // ~25% chance a step needs healing
  const needsHealing = Math.random() < 0.25;
  if (!needsHealing) return null;

  const original = selectors[0];
  const attemptIndex = 1 + Math.floor(Math.random() * Math.min(selectors.length - 1, 3));
  const healedSelector = selectors[attemptIndex] || selectors[1];

  const strategies = [
    "Retried with aria-label selector",
    "Fell back to text content match",
    "Used data-testid attribute",
    "Matched by role and accessible name",
    "Found via CSS class fallback",
    "Located by DOM hierarchy traversal",
  ];

  return {
    healed: true,
    originalSelector: original,
    healedSelector,
    attemptsMade: attemptIndex,
    strategy: strategies[Math.floor(Math.random() * strategies.length)],
  };
}

// Generate a Playwright-style script from instructions
export function generatePlaywrightScript(
  instructions: TestInstruction[],
  testName: string,
  baseUrl: string
): string {
  let script = `import { test, expect } from '@playwright/test';\n\n`;
  script += `test('${testName}', async ({ page }) => {\n`;

  for (const inst of instructions) {
    switch (inst.action) {
      case "navigate":
        script += `  await page.goto('${inst.target || baseUrl}');\n`;
        script += `  await page.waitForLoadState('networkidle');\n\n`;
        break;
      case "wait":
        script += `  // ${inst.description}\n`;
        script += `  await page.waitForTimeout(1000);\n\n`;
        break;
      case "click":
        if (inst.selectors.length > 0) {
          script += `  // ${inst.description}\n`;
          script += `  // Primary: ${inst.selectors[0]}\n`;
          if (inst.selectors.length > 1) {
            script += `  // Fallback: ${inst.selectors.slice(1, 3).join(', ')}\n`;
          }
          script += `  await page.locator('${inst.selectors[0]}').click();\n\n`;
        }
        break;
      case "type":
        if (inst.selectors.length > 0) {
          script += `  // ${inst.description}\n`;
          script += `  await page.locator('${inst.selectors[0]}').fill('${inst.value || ''}');\n\n`;
        }
        break;
      case "assert":
        script += `  // ${inst.description}\n`;
        if (inst.selectors.length > 0) {
          script += `  await expect(page.locator('${inst.selectors[0]}')).toBeVisible();\n\n`;
        } else {
          script += `  // Manual assertion: ${inst.assertion || inst.description}\n\n`;
        }
        break;
      case "search":
        script += `  // ${inst.description}\n`;
        if (inst.selectors.length > 0) {
          script += `  const element = page.locator('${inst.selectors[0]}');\n`;
          script += `  await expect(element).toBeVisible();\n\n`;
        }
        break;
      case "submit":
        script += `  // ${inst.description}\n`;
        if (inst.selectors.length > 0) {
          script += `  await page.locator('${inst.selectors[0]}').click();\n`;
        }
        script += `  await page.waitForLoadState('networkidle');\n\n`;
        break;
      case "scroll":
        script += `  // ${inst.description}\n`;
        script += `  await page.evaluate(() => window.scrollBy(0, 500));\n\n`;
        break;
      case "screenshot":
        script += `  // ${inst.description}\n`;
        script += `  await page.screenshot({ path: 'test-results/${testName.replace(/\s/g, '-')}.png', fullPage: true });\n\n`;
        break;
    }
  }

  script += `});\n`;
  return script;
}
