import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SettingsHero } from "./settings-hero"

describe("SettingsHero", () => {
    it("shows a loading state for outlet count while the query is pending", () => {
        render(
            <SettingsHero businessName="Toko Maju" logoUrl={null} status="active" outletTotal={null} outletPending />
        )

        expect(screen.getByText("Memuat jumlah outlet…")).toBeInTheDocument()
    })

    it("falls back to initials when the business logo fails to load", () => {
        render(
            <SettingsHero
                businessName="Toko Maju"
                logoUrl="https://example.com/logo.png"
                status="active"
                outletTotal={2}
            />
        )

        fireEvent.error(screen.getByRole("img", { name: "Logo Toko Maju" }))

        expect(screen.getByText("T")).toBeInTheDocument()
        expect(screen.queryByRole("img", { name: "Logo Toko Maju" })).not.toBeInTheDocument()
    })
})
