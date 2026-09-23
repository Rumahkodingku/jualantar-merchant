import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

const fixtures = vi.hoisted(() => ({
    session: {
        user: {
            id: "u-employee",
            email: "karyawan@usaha.id",
            roles: [],
            permissions: [],
            outletAssignments: [{ outletId: "o1", role: "outlet_manager" }],
        },
    },
    outlets: {
        data: {
            data: [{ id: "o1", name: "Outlet Pusat", status: "active" }],
            meta: { current_page: 1, per_page: 50, total: 1, last_page: 1 },
        },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
}))

vi.mock("~/modules/auth", () => ({
    useSession: () => fixtures.session,
}))

vi.mock("~/modules/merchant-operations", () => ({
    OUTLET_ROLE_LABEL: { outlet_manager: "Manajer Outlet", outlet_staff: "Staf Outlet" },
    OUTLETS_PATHS: { home: "/settings/outlets" },
    outletPath: (id: string) => `/settings/outlets/${id}`,
    outletStatusLabel: (status: string) => (status === "active" ? "Aktif" : "Nonaktif"),
    useOperationalOutlets: () => fixtures.outlets,
}))

vi.mock("~/modules/authorization", () => ({
    ForbiddenState: () => null,
}))

import { EmployeeHome } from "./employee-home"

describe("EmployeeHome", () => {
    it("lists the assigned outlets with role and order shortcut", () => {
        render(
            <MemoryRouter>
                <EmployeeHome />
            </MemoryRouter>
        )

        expect(screen.getByText("Outlet saya")).toBeInTheDocument()
        expect(screen.getByText("Outlet Pusat")).toBeInTheDocument()
        expect(screen.getByText("Manajer Outlet • Aktif")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Lihat pesanan/ })).toHaveAttribute("href", "/orders")
    })
})
