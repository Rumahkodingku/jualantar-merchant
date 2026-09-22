import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { FinancesPage } from "./finances-page"

describe("FinancesPage", () => {
    it("renders the scaffold heading and summary cards", () => {
        render(
            <MemoryRouter initialEntries={["/finances"]}>
                <FinancesPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Keuangan" })).toBeInTheDocument()
        expect(screen.getByText("Belum ada transaksi")).toBeInTheDocument()
    })
})
