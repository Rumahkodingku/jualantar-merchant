import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { HelpPage } from "./help-page"

describe("HelpPage", () => {
    it("renders contact info and FAQs", () => {
        render(
            <MemoryRouter initialEntries={["/settings/help"]}>
                <HelpPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Bantuan & dukungan" })).toBeInTheDocument()
        expect(screen.getByText("Hubungi kami")).toBeInTheDocument()
        expect(screen.getByText("Bagaimana cara menambah outlet baru?")).toBeInTheDocument()
    })
})
