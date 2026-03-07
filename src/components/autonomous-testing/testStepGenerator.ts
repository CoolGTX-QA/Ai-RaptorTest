import type { ExecutionStep } from "./BrowserPreview";

interface TestStepConfig {
  testName: string;
  testDescription: string | null;
  baseUrl: string;
  testType: string;
}

// Generate contextual execution steps based on the test case name and description
export function generateExecutionSteps(config: TestStepConfig): ExecutionStep[] {
  const { testName, testDescription, baseUrl, testType } = config;
  const lower = testName.toLowerCase();
  const desc = (testDescription || "").toLowerCase();

  const base: Omit<ExecutionStep, "action" | "detail" | "icon">  = {
    timestamp: "",
    status: "pending",
  };

  // Navigation / Routing tests
  if (lower.includes("navigation") || lower.includes("routing") || lower.includes("page route")) {
    return [
      { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Page fully loaded (DOMContentLoaded)", icon: "wait" },
      { ...base, action: "Find Elements", detail: "Locating navigation links (nav a, nav button)", icon: "search" },
      { ...base, action: "Assert", detail: "Navigation bar is visible and contains links", icon: "assert" },
      { ...base, action: "Click", detail: "Clicking first navigation link", icon: "click" },
      { ...base, action: "Wait", detail: "Waiting for route change", icon: "wait" },
      { ...base, action: "Assert", detail: "URL changed and page content updated", icon: "assert" },
      { ...base, action: "Click", detail: "Clicking second navigation link", icon: "click" },
      { ...base, action: "Assert", detail: "No 404 or error page displayed", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing final navigation state", icon: "screenshot" },
    ];
  }

  // Catalog / Listing / Filter / Sort tests
  if (lower.includes("catalog") || lower.includes("listing") || lower.includes("filter") || lower.includes("sort")) {
    return [
      { ...base, action: "Navigate", detail: `Opening catalog page at ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Product listings loaded", icon: "wait" },
      { ...base, action: "Find Elements", detail: "Locating filter controls (.filter-panel, [data-testid='filters'])", icon: "search" },
      { ...base, action: "Assert", detail: "Filter panel is visible with options", icon: "assert" },
      { ...base, action: "Click", detail: "Selecting category filter option", icon: "click" },
      { ...base, action: "Wait", detail: "Waiting for filtered results", icon: "wait" },
      { ...base, action: "Assert", detail: "Product list count changed after filtering", icon: "assert" },
      { ...base, action: "Click", detail: "Clicking sort by price dropdown", icon: "click" },
      { ...base, action: "Assert", detail: "Items reordered by price ascending", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing filtered and sorted results", icon: "screenshot" },
    ];
  }

  // Product detail / Image gallery
  if (lower.includes("product detail") || lower.includes("image gallery") || lower.includes("detail page")) {
    return [
      { ...base, action: "Navigate", detail: `Opening product page at ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Product data loaded", icon: "wait" },
      { ...base, action: "Assert", detail: "Product title, price, and description visible", icon: "assert" },
      { ...base, action: "Find Elements", detail: "Locating image gallery thumbnails", icon: "search" },
      { ...base, action: "Click", detail: "Clicking second thumbnail image", icon: "click" },
      { ...base, action: "Assert", detail: "Main image changed to selected thumbnail", icon: "assert" },
      { ...base, action: "Click", detail: "Opening fullscreen image viewer", icon: "click" },
      { ...base, action: "Assert", detail: "Fullscreen overlay displayed with zoom controls", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing product detail state", icon: "screenshot" },
    ];
  }

  // Cart / Add to cart
  if (lower.includes("cart") || lower.includes("add to cart") || lower.includes("basket")) {
    return [
      { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Page loaded", icon: "wait" },
      { ...base, action: "Click", detail: "Clicking 'Add to Cart' button", icon: "click" },
      { ...base, action: "Wait", detail: "Cart API response received", icon: "wait" },
      { ...base, action: "Assert", detail: "Cart badge count incremented to 1", icon: "assert" },
      { ...base, action: "Click", detail: "Opening cart sidebar/page", icon: "click" },
      { ...base, action: "Assert", detail: "Added product appears in cart with correct price", icon: "assert" },
      { ...base, action: "Navigate", detail: "Refreshing page to verify persistence", icon: "navigate" },
      { ...base, action: "Assert", detail: "Cart items persisted after page reload", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing cart state", icon: "screenshot" },
    ];
  }

  // Checkout / Payment
  if (lower.includes("checkout") || lower.includes("payment")) {
    return [
      { ...base, action: "Navigate", detail: `Opening checkout at ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Checkout form loaded", icon: "wait" },
      { ...base, action: "Type", detail: "Entering shipping address (123 Test St)", icon: "type" },
      { ...base, action: "Type", detail: "Entering payment card (4242 4242 4242 4242)", icon: "type" },
      { ...base, action: "Assert", detail: "Order summary shows correct total", icon: "assert" },
      { ...base, action: "Click", detail: "Clicking 'Place Order' button", icon: "click" },
      { ...base, action: "Wait", detail: "Processing payment request", icon: "wait" },
      { ...base, action: "Assert", detail: "Order confirmation page displayed", icon: "assert" },
      { ...base, action: "Assert", detail: "Order number generated and visible", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing order confirmation", icon: "screenshot" },
    ];
  }

  // Search
  if (lower.includes("search")) {
    return [
      { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Page loaded", icon: "wait" },
      { ...base, action: "Click", detail: "Clicking search input field", icon: "click" },
      { ...base, action: "Type", detail: "Typing search query 'test product'", icon: "type" },
      { ...base, action: "Wait", detail: "Search suggestions appeared", icon: "wait" },
      { ...base, action: "Assert", detail: "Suggestion dropdown visible with results", icon: "assert" },
      { ...base, action: "Submit", detail: "Pressing Enter to search", icon: "submit" },
      { ...base, action: "Wait", detail: "Search results loaded", icon: "wait" },
      { ...base, action: "Assert", detail: "Results page shows matching items", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing search results", icon: "screenshot" },
    ];
  }

  // Signup / Registration / Validation
  if (lower.includes("signup") || lower.includes("registration") || lower.includes("sign up") || lower.includes("validation")) {
    return [
      { ...base, action: "Navigate", detail: `Opening signup page at ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Signup form rendered", icon: "wait" },
      { ...base, action: "Click", detail: "Clicking submit without filling fields", icon: "click" },
      { ...base, action: "Assert", detail: "Validation errors shown for required fields", icon: "assert" },
      { ...base, action: "Type", detail: "Entering invalid email 'notanemail'", icon: "type" },
      { ...base, action: "Assert", detail: "Email validation error displayed", icon: "assert" },
      { ...base, action: "Type", detail: "Entering valid email 'test@example.com'", icon: "type" },
      { ...base, action: "Type", detail: "Entering password 'SecurePass123!'", icon: "type" },
      { ...base, action: "Click", detail: "Clicking 'Create Account' button", icon: "click" },
      { ...base, action: "Assert", detail: "Success message or redirect to dashboard", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing signup result", icon: "screenshot" },
    ];
  }

  // Login
  if (lower.includes("login") || lower.includes("sign in") || lower.includes("authentication")) {
    return [
      { ...base, action: "Navigate", detail: `Opening login page at ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Login form rendered", icon: "wait" },
      { ...base, action: "Type", detail: "Entering email in email field", icon: "type" },
      { ...base, action: "Type", detail: "Entering password in password field", icon: "type" },
      { ...base, action: "Click", detail: "Clicking 'Sign In' button", icon: "click" },
      { ...base, action: "Wait", detail: "Authentication request processing", icon: "wait" },
      { ...base, action: "Assert", detail: "Redirected to dashboard after login", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing post-login state", icon: "screenshot" },
    ];
  }

  // Responsive / Layout
  if (lower.includes("responsive") || lower.includes("layout") || lower.includes("mobile")) {
    return [
      { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Page loaded at desktop viewport (1920x1080)", icon: "wait" },
      { ...base, action: "Assert", detail: "Desktop layout renders correctly", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing desktop layout", icon: "screenshot" },
      { ...base, action: "Wait", detail: "Resizing viewport to tablet (768x1024)", icon: "wait" },
      { ...base, action: "Assert", detail: "Tablet layout adjusts correctly", icon: "assert" },
      { ...base, action: "Wait", detail: "Resizing viewport to mobile (375x667)", icon: "wait" },
      { ...base, action: "Assert", detail: "Mobile hamburger menu appears", icon: "assert" },
      { ...base, action: "Click", detail: "Opening mobile navigation menu", icon: "click" },
      { ...base, action: "Assert", detail: "Mobile menu items are visible and tappable", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing mobile layout", icon: "screenshot" },
    ];
  }

  // Wishlist
  if (lower.includes("wishlist") || lower.includes("favorite")) {
    return [
      { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Page loaded", icon: "wait" },
      { ...base, action: "Click", detail: "Clicking heart/wishlist icon on first item", icon: "click" },
      { ...base, action: "Assert", detail: "Wishlist icon toggled to filled state", icon: "assert" },
      { ...base, action: "Click", detail: "Opening wishlist page", icon: "click" },
      { ...base, action: "Assert", detail: "Added item appears in wishlist", icon: "assert" },
      { ...base, action: "Click", detail: "Removing item from wishlist", icon: "click" },
      { ...base, action: "Assert", detail: "Wishlist is now empty", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing wishlist state", icon: "screenshot" },
    ];
  }

  // Promo code / Coupon / Discount
  if (lower.includes("promo") || lower.includes("coupon") || lower.includes("discount")) {
    return [
      { ...base, action: "Navigate", detail: `Opening checkout at ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "Checkout page loaded", icon: "wait" },
      { ...base, action: "Find Elements", detail: "Locating promo code input field", icon: "search" },
      { ...base, action: "Type", detail: "Entering promo code 'SAVE20'", icon: "type" },
      { ...base, action: "Click", detail: "Clicking 'Apply' button", icon: "click" },
      { ...base, action: "Wait", detail: "Discount calculation in progress", icon: "wait" },
      { ...base, action: "Assert", detail: "Discount applied: total reduced by 20%", icon: "assert" },
      { ...base, action: "Type", detail: "Entering invalid promo code 'EXPIRED'", icon: "type" },
      { ...base, action: "Click", detail: "Clicking 'Apply' button", icon: "click" },
      { ...base, action: "Assert", detail: "Error message: 'Invalid or expired promo code'", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing promo code results", icon: "screenshot" },
    ];
  }

  // Session / Expiration
  if (lower.includes("session") || lower.includes("expir") || lower.includes("timeout")) {
    return [
      { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
      { ...base, action: "Wait", detail: "User session active", icon: "wait" },
      { ...base, action: "Assert", detail: "User is authenticated and dashboard visible", icon: "assert" },
      { ...base, action: "Wait", detail: "Simulating session expiration (clearing token)", icon: "wait" },
      { ...base, action: "Click", detail: "Attempting protected action", icon: "click" },
      { ...base, action: "Assert", detail: "Redirected to login page or session expired modal", icon: "assert" },
      { ...base, action: "Assert", detail: "User data is not accessible after expiration", icon: "assert" },
      { ...base, action: "Screenshot", detail: "Capturing session expiration handling", icon: "screenshot" },
    ];
  }

  // Default: generate generic steps from the test description
  const steps: ExecutionStep[] = [
    { ...base, action: "Navigate", detail: `Opening ${baseUrl}`, icon: "navigate", targetUrl: baseUrl },
    { ...base, action: "Wait", detail: "Page fully loaded", icon: "wait" },
  ];

  if (desc.includes("form") || desc.includes("input")) {
    steps.push({ ...base, action: "Find Elements", detail: "Locating form elements", icon: "search" });
    steps.push({ ...base, action: "Type", detail: "Filling in form fields", icon: "type" });
    steps.push({ ...base, action: "Submit", detail: "Submitting form", icon: "submit" });
  } else {
    steps.push({ ...base, action: "Find Elements", detail: "Locating target elements on page", icon: "search" });
    steps.push({ ...base, action: "Click", detail: "Interacting with primary element", icon: "click" });
    steps.push({ ...base, action: "Wait", detail: "Waiting for response", icon: "wait" });
  }

  steps.push({ ...base, action: "Assert", detail: "Verifying expected outcome", icon: "assert" });
  steps.push({ ...base, action: "Screenshot", detail: "Capturing final state", icon: "screenshot" });

  return steps;
}

// Generate contextual error messages for failed tests
export function generateFailureDetails(testName: string): {
  error_message: string;
  trace: string;
  cause: string;
  fix_suggestion: string;
} {
  const lower = testName.toLowerCase();

  if (lower.includes("filter") || lower.includes("catalog")) {
    return {
      error_message: "Filter controls not found on catalog page. Expected element with selector '.filter-panel' to be visible within 30s timeout.",
      trace: `at Object.<anonymous> (test.spec.ts:15:5)\n  at page.waitForSelector('.filter-panel')\n  at TimeoutError: waiting for selector '.filter-panel'\n  Timeout: 30000ms`,
      cause: "DOM selector mismatch. The filter controls use a different CSS class name than expected. The application uses '[data-testid=\"filters\"]' instead of '.filter-panel'.",
      fix_suggestion: "Update the selector from '.filter-panel' to '[data-testid=\"filters\"]' or use page.getByRole('region', { name: 'Filters' }) for more resilient element selection.",
    };
  }

  if (lower.includes("checkout") || lower.includes("payment")) {
    return {
      error_message: "Payment form submission failed. Expected redirect to confirmation page but remained on checkout.",
      trace: `at Object.<anonymous> (test.spec.ts:28:5)\n  at page.waitForURL('**/confirmation')\n  at TimeoutError: page.waitForURL: Timeout 30000ms exceeded.\n  waiting for URL '**/confirmation'`,
      cause: "Payment API returned 422 due to invalid test card number. The test environment requires specific test card numbers for successful payments.",
      fix_suggestion: "Use Stripe test card 4242424242424242 with any future expiry date. Ensure the test environment is configured for test mode payments.",
    };
  }

  if (lower.includes("login") || lower.includes("auth") || lower.includes("signup")) {
    return {
      error_message: "Login redirect failed. User remained on login page after submitting credentials.",
      trace: `at Object.<anonymous> (test.spec.ts:20:5)\n  at page.waitForURL('**/dashboard')\n  at TimeoutError: Expected navigation to dashboard\n  Current URL: /login?error=invalid_credentials`,
      cause: "Test credentials are invalid or the test user account doesn't exist in the current environment.",
      fix_suggestion: "Ensure test user exists in the database. Create a seeded test account or use the signup flow first before testing login.",
    };
  }

  if (lower.includes("responsive") || lower.includes("mobile") || lower.includes("layout")) {
    return {
      error_message: "Mobile hamburger menu not found. Expected element with selector '[data-testid=\"mobile-menu\"]' to be visible at 375px viewport.",
      trace: `at Object.<anonymous> (test.spec.ts:35:5)\n  at page.locator('[data-testid="mobile-menu"]')\n  at Error: locator.click: Element is not visible\n  Element is hidden by CSS (display: none)`,
      cause: "The mobile menu breakpoint is set at 640px (sm) but the test checks at 768px (md). The hamburger menu only appears below 640px.",
      fix_suggestion: "Update the viewport width assertion from 768px to 639px, or check the application's Tailwind breakpoints to match the correct responsive threshold.",
    };
  }

  if (lower.includes("cart")) {
    return {
      error_message: "Cart badge count did not update after adding item. Expected '1' but found '0'.",
      trace: `at Object.<anonymous> (test.spec.ts:18:5)\n  at expect(cartBadge).toHaveText('1')\n  Expected: "1"\n  Received: "0"`,
      cause: "The 'Add to Cart' API call returned 200 but the cart state is managed client-side with React context. The badge component doesn't re-render after the API response.",
      fix_suggestion: "Add await page.waitForResponse('**/api/cart') before asserting the badge count. Alternatively, wait for the cart badge element to update with page.waitForFunction().",
    };
  }

  // Default
  return {
    error_message: `Test '${testName}' failed. Expected condition was not met within the timeout period.`,
    trace: `at Object.<anonymous> (test.spec.ts:12:5)\n  at page.waitForSelector('[data-testid="target"]')\n  at TimeoutError: Timeout 30000ms exceeded\n  waiting for selector '[data-testid="target"]'`,
    cause: "Element selector mismatch or the target element is rendered asynchronously and requires explicit wait conditions.",
    fix_suggestion: "Use more specific selectors like page.getByRole() or page.getByTestId(). Add explicit wait conditions for dynamically loaded content.",
  };
}
