import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { AboutPage } from "./about-page"

describe("AboutPage", () => {
    it("renders app identity and explicit unavailable legal content", () => {
        render(
            <MemoryRouter initialEntries={["/settings/about"]}>
                <AboutPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Tentang aplikasi" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "JualAntar Merchant" })).toBeInTheDocument()
        expect(screen.getByText("Kebijakan privasi")).toBeInTheDocument()
        expect(screen.getByText("Syarat & ketentuan")).toBeInTheDocument()
        expect(screen.getByText("Dokumen kebijakan privasi lengkap belum tersedia.")).toBeInTheDocument()
        expect(screen.getByText("Dokumen syarat dan ketentuan lengkap belum tersedia.")).toBeInTheDocument()
    })
})
