import { test, expect } from "@playwright/test";

test.describe("Intake conditional question logic", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/intake");
  });

  test("home-based skips alcohol, music, outdoor, sqft questions", async ({ page }) => {
    // Select home-based
    await page.getByText("Home-based").click();
    await page.getByRole("button", { name: "→" }).click();

    // Location
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();

    // Neighborhood (shows because loc != "no")
    await page.locator("select").selectOption("Sunset");
    await page.getByRole("button", { name: "→" }).click();

    // Should go directly to Employees (skipping sqft, food, alcohol, music)
    await expect(page.getByText("Employees?")).toBeVisible();
  });

  test("office skips food, alcohol, music, sqft questions", async ({ page }) => {
    // Select office
    await page.getByText("Office / Consulting").click();
    await page.getByRole("button", { name: "→" }).click();

    // Location
    await page.getByText("Signed a lease").click();
    await page.getByRole("button", { name: "→" }).click();

    // Neighborhood
    await page.locator("select").selectOption("Financial District");
    await page.getByRole("button", { name: "→" }).click();

    // Should skip sqft, alcohol, music — but food question shows for office
    await expect(page.getByText("Will you serve food?")).toBeVisible();
    await page.getByText("No food").click();
    await page.getByRole("button", { name: "→" }).click();

    // Now should be at Employees
    await expect(page.getByText("Employees?")).toBeVisible();
  });

  test("restaurant shows outdoor seating question", async ({ page }) => {
    // Select restaurant
    await page.getByText("Restaurant / Café").click();
    await page.getByRole("button", { name: "→" }).click();

    // Location
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();

    // No location = skips hood and sqft, goes to alcohol
    await expect(page.getByText("Alcohol?")).toBeVisible();
    await page.getByText("None").click();
    await page.getByRole("button", { name: "→" }).click();

    // Music
    await page.getByText("None", { exact: true }).click();
    await page.getByRole("button", { name: "→" }).click();

    // Employees
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: "→" }).click();

    // Entity
    await page.getByText("LLC").click();
    await page.getByRole("button", { name: "→" }).click();

    // Outdoor seating should appear for restaurant
    await expect(page.getByText("Outdoor seating?")).toBeVisible();
  });

  test("food truck skips alcohol question", async ({ page }) => {
    // Select food truck
    await page.getByText("Food truck").click();
    await page.getByRole("button", { name: "→" }).click();

    // Location: no
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();

    // Should skip to music (food_truck skips food and alcohol)
    await expect(page.getByText("Music?")).toBeVisible();
  });

  test("selecting no location skips neighborhood and size", async ({ page }) => {
    // Select retail
    await page.getByText("Retail store").click();
    await page.getByRole("button", { name: "→" }).click();

    // No location
    await page.getByText("Not yet").click();
    await page.getByRole("button", { name: "→" }).click();

    // Should skip hood and sqft, go to food
    await expect(page.getByText("Will you serve food?")).toBeVisible();
  });
});
