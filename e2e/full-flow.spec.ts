import { test, expect } from "@playwright/test";

test.describe("Full flow: Landing → Intake → Roadmap", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  });

  test("landing page loads with correct content", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Every permit");
    await expect(page.getByText("Build my roadmap")).toBeVisible();
    await expect(page.getByText("SAN FRANCISCO", { exact: true })).toBeVisible();
    await expect(page.getByText("Free for everyone. Takes 2 minutes.")).toBeVisible();
  });

  test("resume button not visible without saved session", async ({ page }) => {
    await expect(page.getByText("Resume my roadmap")).not.toBeVisible();
  });

  test("full happy path: restaurant", async ({ page }) => {
    // Start intake
    await page.getByText("Build my roadmap").click();
    await expect(page).toHaveURL("/intake");

    // Q1: Business type — select Restaurant
    await expect(page.getByText("What are you opening?")).toBeVisible();
    await page.getByText("Restaurant / Café").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q2: Location
    await expect(page.getByText("Do you have a space?")).toBeVisible();
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q3: Neighborhood
    await expect(page.getByText("Which neighborhood?")).toBeVisible();
    await page.locator("select").selectOption("Mission");
    await page.getByRole("button", { name: "→" }).click();

    // Q4: Size
    await expect(page.getByText("Approximate size?")).toBeVisible();
    await page.getByText("Under 3,750 sq ft").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q5: Alcohol
    await expect(page.getByText("Alcohol?")).toBeVisible();
    await page.getByText("None").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q6: Music
    await expect(page.getByText("Music?")).toBeVisible();
    await page.getByText("None", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();

    // Q7: Employees
    await expect(page.getByText("Employees?")).toBeVisible();
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q8: Entity
    await expect(page.getByText("Business entity?")).toBeVisible();
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q9: Outdoor seating
    await expect(page.getByText("Outdoor seating?")).toBeVisible();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();

    // Q10: Chain
    await expect(page.getByText("Total locations worldwide?")).toBeVisible();
    await page.getByText("Just this one").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q11: Timeline
    await expect(page.getByText("When do you want to open?")).toBeVisible();
    await page.getByText("ASAP").click();
    await page.getByRole("button", { name: "→" }).click();

    // Q12: Email
    await expect(page.getByText("Your email")).toBeVisible();
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByText("Generate roadmap").click();

    // Roadmap page
    await expect(page).toHaveURL("/roadmap");
    await expect(page.getByText("Your launch roadmap")).toBeVisible();
    await expect(page.getByText("Restaurant / Café")).toBeVisible();
    await expect(page.getByText(/Mission ·/)).toBeVisible();

    // Verify steps are visible
    await expect(page.getByText("Form your business entity")).toBeVisible();
    await expect(page.getByText("Get your EIN")).toBeVisible();

    // Expand a step
    await page.getByText("Get your EIN").click();
    await expect(page.getByText("Go to the IRS online application")).toBeVisible();

    // Progress persists across refresh
    await page.reload();
    await expect(page.getByText("Restaurant / Café")).toBeVisible();
  });

  test("start over clears state and returns to landing", async ({ page }) => {
    // First create a session
    await page.evaluate(() => {
      localStorage.setItem(
        "snip-session",
        JSON.stringify({
          answers: { biz: "restaurant", email: "test@test.com" },
          roadmap: { steps: [{ order: 1, name: "Test Step", agency: "Test", why: "Test", cost: "$0", time: "1 day", priority: "high", type: "walk" }], warns: [], sum: { total: 1, cost: "$0", time: "1 week", bizLabel: "Restaurant / Café", autoFull: 0 } },
        })
      );
    });
    await page.goto("/roadmap");
    await expect(page.getByText("Your launch roadmap")).toBeVisible();

    // Click start over
    await page.getByText("Start over with a new business").click();
    await expect(page).toHaveURL("/");

    // Session should be cleared
    const session = await page.evaluate(() => localStorage.getItem("snip-session"));
    expect(session).toBeNull();
  });
});
