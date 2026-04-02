import { test, expect } from "@playwright/test";
import type { RoadmapResult, IntakeAnswers } from "@/lib/types";

// Helper to seed a restaurant session directly into localStorage
function seedSession(answers: IntakeAnswers, roadmap: RoadmapResult) {
  return `localStorage.setItem("snip-session", ${JSON.stringify(JSON.stringify({ answers, roadmap }))})`;
}

const minimalRestaurantSession = {
  answers: {
    biz: "restaurant",
    loc: "signed",
    hood: "Mission",
    sqft: "small",
    alc: "no",
    music: "no",
    emp: "solo",
    entity: "none",
    seat: "n",
    chain: "1",
    when: "asap",
    email: "test@example.com",
  } as IntakeAnswers,
};

test.describe("Roadmap step interactions", () => {
  test("walkthrough step renders numbered items and links", async ({ page }) => {
    // Seed and navigate to roadmap
    await page.goto("/");
    await page.evaluate((answers) => {
      // Import buildRoadmap at runtime is tricky, so we'll use the UI flow
      localStorage.clear();
    }, null);

    // Use the full UI flow to generate a real roadmap
    await page.goto("/intake");
    await page.getByText("Restaurant / Café").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator("select").selectOption("Mission");
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Under 3,750 sq ft").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just this one").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("ASAP").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByText("Generate roadmap").click();

    await expect(page).toHaveURL("/roadmap");

    // Open the EIN step (walkthrough type)
    await page.getByText("Get your EIN").click();
    await expect(page.getByText("Go to the IRS online application")).toBeVisible();
    await expect(page.getByText("Open IRS EIN Application →")).toBeVisible();

    // Verify the link is correct
    const link = page.getByText("Open IRS EIN Application →");
    await expect(link).toHaveAttribute("href", /irs\.gov/);
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("checklist step toggles checkboxes", async ({ page }) => {
    // Navigate through intake to get a roadmap with a checklist step
    await page.goto("/intake");
    await page.getByText("Restaurant / Café").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator("select").selectOption("Mission");
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Under 3,750 sq ft").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just this one").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("ASAP").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByText("Generate roadmap").click();

    // Open the zoning step (checklist type)
    await page.getByText("Verify zoning").click();
    await expect(page.getByText("Look up your property on the SF Planning Map")).toBeVisible();

    // Click a checkbox
    const checkbox = page.locator('[role="checkbox"]').first();
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "true");

    // Click again to uncheck
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  test("completion field marks step done", async ({ page }) => {
    await page.goto("/intake");
    await page.getByText("Restaurant / Café").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator("select").selectOption("Mission");
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Under 3,750 sq ft").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just this one").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("ASAP").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByText("Generate roadmap").click();

    // Open the EIN step which has a done_field
    await page.getByText("Get your EIN").click();
    await expect(page.getByPlaceholder("XX-XXXXXXX")).toBeVisible();

    // Enter a value and click Done
    await page.getByPlaceholder("XX-XXXXXXX").fill("12-3456789");
    await page.getByRole("button", { name: "Done" }).click();

    // Progress should update
    await expect(page.getByText(/1 of .* complete/)).toBeVisible();
  });

  test("help request form opens and submits", async ({ page }) => {
    await page.goto("/intake");
    await page.getByText("Restaurant / Café").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator("select").selectOption("Mission");
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Under 3,750 sq ft").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("None", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("Just this one").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.getByText("ASAP").click();
    await page.getByRole("button", { name: "→" }).click();
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByText("Generate roadmap").click();

    // Open a step
    await page.getByText("Get your EIN").click();

    // Click "GET HELP"
    await page.getByText("GET HELP →").click();
    await expect(page.getByText("Get help with: Get your EIN")).toBeVisible();

    // Fill and submit
    await page.getByPlaceholder("Your name").fill("Test User");
    await page.getByText("Send request").click();

    // Should show confirmation
    await expect(page.getByText("Request sent")).toBeVisible();
  });
});
