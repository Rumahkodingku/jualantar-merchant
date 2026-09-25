import { expect, test } from "@playwright/test"

test("login page renders the merchant login form", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByRole("heading", { name: "Masuk ke akun merchant" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Kata sandi")).toBeVisible()
    await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeVisible()
})
