import { test, expect } from "@playwright/test";

test.describe("Toolbar focusgroup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/toolbar.html");
  });

  test("ArrowRight moves focus forward", async ({ page }) => {
    await page.click("#btn-bold");
    await expect(page.locator("#btn-bold")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#btn-italic")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#btn-underline")).toBeFocused();
  });

  test("ArrowLeft moves focus backward", async ({ page }) => {
    await page.click("#btn-underline");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#btn-italic")).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#btn-bold")).toBeFocused();
  });

  test("ArrowRight at last item without wrap does NOT move", async ({ page }) => {
    await page.click("#btn-underline");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#btn-underline")).toBeFocused();
  });

  test("ArrowLeft at first item without wrap does NOT move", async ({ page }) => {
    await page.click("#btn-bold");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#btn-bold")).toBeFocused();
  });

  test("Home moves to first item", async ({ page }) => {
    await page.click("#btn-underline");
    await page.keyboard.press("Home");
    await expect(page.locator("#btn-bold")).toBeFocused();
  });

  test("End moves to last item", async ({ page }) => {
    await page.click("#btn-bold");
    await page.keyboard.press("End");
    await expect(page.locator("#btn-underline")).toBeFocused();
  });

  test("roving tabindex: only active item has tabindex=0", async ({ page }) => {
    // After init, first item should have tabindex=0
    await expect(page.locator("#btn-bold")).toHaveAttribute("tabindex", "0");
    await expect(page.locator("#btn-italic")).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("#btn-underline")).toHaveAttribute("tabindex", "-1");

    // Move focus
    await page.click("#btn-bold");
    await page.keyboard.press("ArrowRight");

    await expect(page.locator("#btn-bold")).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("#btn-italic")).toHaveAttribute("tabindex", "0");
    await expect(page.locator("#btn-underline")).toHaveAttribute("tabindex", "-1");
  });

  test("ArrowDown/ArrowUp do not navigate (inline-only toolbar)", async ({ page }) => {
    await page.click("#btn-bold");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#btn-bold")).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#btn-bold")).toBeFocused();
  });

  test("navigates through nested DOM structure", async ({ page }) => {
    await page.click("#nested-a");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#nested-b")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#nested-c")).toBeFocused();
  });
});

test.describe("Toolbar with wrap", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/toolbar.html");
  });

  test("wraps from last to first", async ({ page }) => {
    await page.click("#wrap-c");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#wrap-a")).toBeFocused();
  });

  test("wraps from first to last", async ({ page }) => {
    await page.click("#wrap-a");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#wrap-c")).toBeFocused();
  });
});

test.describe("Tablist focusgroup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/tablist.html");
  });

  test("ArrowRight moves between tabs (inline default)", async ({ page }) => {
    await page.click("#tab-1");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tab-2")).toBeFocused();
  });

  test("wraps by default (tablist default modifier)", async ({ page }) => {
    await page.click("#tab-3");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tab-1")).toBeFocused();
  });

  test("infers role=tablist on container", async ({ page }) => {
    await expect(page.locator("#tablist")).toHaveAttribute("role", "tablist");
  });

  test("infers role=tab on button children", async ({ page }) => {
    await expect(page.locator("#tab-1")).toHaveAttribute("role", "tab");
    await expect(page.locator("#tab-2")).toHaveAttribute("role", "tab");
    await expect(page.locator("#tab-3")).toHaveAttribute("role", "tab");
  });
});

test.describe("Menu focusgroup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/menu.html");
  });

  test("ArrowDown moves forward (block default)", async ({ page }) => {
    await page.click("#item-cut");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#item-copy")).toBeFocused();
  });

  test("ArrowUp moves backward", async ({ page }) => {
    await page.click("#item-paste");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#item-copy")).toBeFocused();
  });

  test("wraps by default", async ({ page }) => {
    await page.click("#item-paste");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#item-cut")).toBeFocused();
  });

  test("ArrowLeft/ArrowRight do not navigate (block-only)", async ({ page }) => {
    await page.click("#item-cut");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#item-cut")).toBeFocused();
  });

  test("infers role=menu and role=menuitem", async ({ page }) => {
    await expect(page.locator("#menu")).toHaveAttribute("role", "menu");
    await expect(page.locator("#item-cut")).toHaveAttribute("role", "menuitem");
  });
});

test.describe("Memory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/memory.html");
  });

  test("remembers last focused item on re-entry", async ({ page }) => {
    // Focus the toolbar and move to C
    await page.click("#mem-a");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#mem-c")).toBeFocused();

    // Tab away
    await page.keyboard.press("Tab");
    await expect(page.locator("#mem-c")).not.toBeFocused();

    // Tab back — should return to C (memory)
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("#mem-c")).toBeFocused();
  });

  test("focusgroupstart determines initial focus", async ({ page }) => {
    // Tab into the nomemory toolbar — should focus B (focusgroupstart)
    await page.click("#middle");
    await page.keyboard.press("Tab");
    await expect(page.locator("#nomem-b")).toBeFocused();
  });

  test("nomemory always returns to focusgroupstart", async ({ page }) => {
    // Focus B (focusgroupstart), move to C
    await page.click("#middle");
    await page.keyboard.press("Tab");
    await expect(page.locator("#nomem-b")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#nomem-c")).toBeFocused();

    // Tab away and back — should return to B, not C
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("#nomem-b")).toBeFocused();
  });
});

test.describe("Nested focusgroups", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/nested.html");
  });

  test("inner focusgroup navigates independently", async ({ page }) => {
    await page.click("#inner-a");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#inner-b")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#inner-c")).toBeFocused();
  });

  test("outer focusgroup does not include inner items", async ({ page }) => {
    await page.click("#outer-a");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#outer-b")).toBeFocused();

    // Next ArrowRight skips inner focusgroup items and goes to outer-c
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#outer-c")).toBeFocused();

    // Continuing right stops at the end (no wrap)
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#outer-c")).toBeFocused();
  });

  test('focusgroup="none" excludes items from navigation', async ({ page }) => {
    await page.click("#opt-a");
    await page.keyboard.press("ArrowRight");
    // Should skip the excluded button and go to opt-b
    await expect(page.locator("#opt-b")).toBeFocused();
  });
});

test.describe("RTL support", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/rtl.html");
  });

  test("ArrowLeft moves forward in RTL", async ({ page }) => {
    await page.click("#rtl-a");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#rtl-b")).toBeFocused();
  });

  test("ArrowRight moves backward in RTL", async ({ page }) => {
    await page.click("#rtl-b");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#rtl-a")).toBeFocused();
  });
});

test.describe("Role inference", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/e2e/fixtures/roles.html");
  });

  test("infers container role when none set", async ({ page }) => {
    await expect(page.locator("#tablist-no-role")).toHaveAttribute("role", "tablist");
  });

  test("preserves explicit container role", async ({ page }) => {
    await expect(page.locator("#tablist-explicit")).toHaveAttribute("role", "navigation");
  });

  test("infers child role on buttons without explicit role", async ({ page }) => {
    await expect(page.locator("#tab-a")).toHaveAttribute("role", "tab");
    await expect(page.locator("#tab-b")).toHaveAttribute("role", "tab");
  });

  test("preserves explicit child role", async ({ page }) => {
    await expect(page.locator("#tab-c")).toHaveAttribute("role", "link");
  });

  test("infers child role only on buttons (not links)", async ({ page }) => {
    await expect(page.locator("#menu-a")).toHaveAttribute("role", "menuitem");
    // Link should NOT get inferred role
    const menuLink = page.locator("#menu-link");
    const role = await menuLink.getAttribute("role");
    expect(role).toBeNull();
  });
});
