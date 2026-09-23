import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { describe, expect, it } from "vitest"

import { SubpageHeader } from "./subpage-header"

function renderHeader(backTo: string) {
    return render(
        <MemoryRouter initialEntries={["/settings/profile"]}>
            <Routes>
                <Route
                    path="/settings/profile"
                    element={
                        <SubpageHeader
                            title="Profil merchant"
                            description="Identitas usaha yang dilihat customer."
                            backTo={backTo}
                        />
                    }
                />
                <Route path="/settings" element={<p>Settings home</p>} />
            </Routes>
        </MemoryRouter>
    )
}

describe("SubpageHeader", () => {
    it("renders the title and navigates to backTo on back press", async () => {
        const user = userEvent.setup()
        renderHeader("/settings")

        expect(screen.getByRole("heading", { name: "Profil merchant" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Kembali" }))

        expect(screen.getByText("Settings home")).toBeInTheDocument()
    })
})
