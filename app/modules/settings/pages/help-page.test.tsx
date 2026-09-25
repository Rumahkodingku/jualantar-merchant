import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { HelpPage } from "./help-page"

describe("HelpPage", () => {
    it("renders an explicit unavailable contact state and accessible FAQs", async () => {
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={["/settings/help"]}>
                <HelpPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Bantuan & dukungan" })).toBeInTheDocument()
        expect(
            screen.getByText(
                "Kontak resmi belum tersedia. Silakan kembali lagi setelah informasi layanan dipublikasikan."
            )
        ).toBeInTheDocument()
        expect(screen.getByText("Bagaimana cara menambah outlet baru?")).toBeInTheDocument()
        expect(screen.getByText(/Buka Pengaturan → Outlet/)).toBeVisible()

        await user.click(screen.getByRole("button", { name: "Bagaimana cara menambah karyawan outlet?" }))

        expect(screen.getByRole("button", { name: "Bagaimana cara menambah karyawan outlet?" })).toHaveAttribute(
            "aria-expanded",
            "true"
        )
        expect(screen.getByText(/tambahkan akun karyawan/)).toBeVisible()
    })
})
