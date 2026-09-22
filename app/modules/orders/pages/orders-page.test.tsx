import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { OrdersPage } from "./orders-page"

describe("OrdersPage", () => {
    it("renders the scaffold heading and empty state", () => {
        render(
            <MemoryRouter initialEntries={["/orders"]}>
                <OrdersPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Pesanan" })).toBeInTheDocument()
        expect(screen.getByText("Belum ada pesanan")).toBeInTheDocument()
    })
})
