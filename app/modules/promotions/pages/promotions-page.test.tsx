import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { PromotionNewPage } from "./promotion-new-page"
import { PromotionsPage } from "./promotions-page"

describe("PromotionsPage", () => {
    it("renders the scaffold heading and empty state", () => {
        render(
            <MemoryRouter initialEntries={["/promotions"]}>
                <PromotionsPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Promo" })).toBeInTheDocument()
        expect(screen.getByText("Belum ada promo")).toBeInTheDocument()
    })
})

describe("PromotionNewPage", () => {
    it("renders the scaffold form", () => {
        render(
            <MemoryRouter initialEntries={["/promotions/new"]}>
                <PromotionNewPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Tambah Promo" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Simpan promo" })).toBeInTheDocument()
    })
})
