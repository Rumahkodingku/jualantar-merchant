import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "~/lib/api"
import type { AuthUser } from "~/modules/auth"

vi.mock("../services/merchant-registration.queries", () => ({
    useRegistration: vi.fn(),
}))

vi.mock("~/modules/authorization", () => ({
    useAuthorization: vi.fn(),
}))

import { useAuthorization } from "~/modules/authorization"
import { MerchantApprovedGuard } from "./merchant-approved-guard"
import { useRegistration } from "../services/merchant-registration.queries"
import type { MerchantRegistration, MerchantStatus } from "../types/merchant-registration.types"

const mockedUseRegistration = vi.mocked(useRegistration)
const mockedUseAuthorization = vi.mocked(useAuthorization)

function ownerUser(): AuthUser {
    return {
        id: "u-owner",
        email: "owner@usaha.id",
        roles: ["merchant"],
        permissions: [],
        outletAssignments: [],
        created_at: null,
        updated_at: null,
    }
}

function employeeUser(): AuthUser {
    return {
        id: "u-employee",
        email: "karyawan@usaha.id",
        roles: [],
        permissions: [],
        outletAssignments: [{ outletId: "o1", role: "outlet_manager" }],
        created_at: null,
        updated_at: null,
    }
}

function noAccessUser(): AuthUser {
    return {
        id: "u-guest",
        email: "tamu@usaha.id",
        roles: [],
        permissions: [],
        outletAssignments: [],
        created_at: null,
        updated_at: null,
    }
}

function mockAuth(user: AuthUser | null, isOwner: boolean, isLoading = false) {
    mockedUseAuthorization.mockReturnValue({ user, isOwner, isLoading } as never)
}

function mockOwner() {
    mockAuth(ownerUser(), true)
}

function registration(overrides: Partial<MerchantRegistration> = {}): MerchantRegistration {
    return {
        id: "m1",
        business_name: "Warung",
        slug: "warung",
        description: null,
        type: "individual",
        status: "draft",
        merchant_status: "inactive",
        logo: null,
        logo_url: null,
        service: null,
        identity: null,
        legal_entity: null,
        categories: [],
        outlets: [],
        documents: [],
        payout_accounts: [],
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function mockPending() {
    mockedUseRegistration.mockReturnValue({
        data: undefined,
        error: null,
        isError: false,
        isPending: true,
        refetch: vi.fn(),
    } as never)
}

function mockData(status: MerchantStatus) {
    mockedUseRegistration.mockReturnValue({
        data: registration({ status }),
        error: null,
        isError: false,
        isPending: false,
        refetch: vi.fn(),
    } as never)
}

function mockError(error: unknown) {
    const refetch = vi.fn()

    mockedUseRegistration.mockReturnValue({
        data: undefined,
        error,
        isError: true,
        isPending: false,
        refetch,
    } as never)

    return { refetch }
}

function apiError(code: string): ApiError {
    return new ApiError({ status: 404, code, title: "Not found", detail: "Tidak ditemukan." })
}

function renderAtOrders() {
    return render(
        <MemoryRouter initialEntries={["/orders"]}>
            <Routes>
                <Route
                    path="/orders"
                    element={
                        <MerchantApprovedGuard>
                            <p>Halaman orders</p>
                        </MerchantApprovedGuard>
                    }
                />
                <Route path="/registration" element={<p>Halaman pendaftaran</p>} />
                <Route path="/403" element={<p>Halaman ditolak</p>} />
            </Routes>
        </MemoryRouter>
    )
}

beforeEach(() => {
    vi.clearAllMocks()
    mockOwner()
    mockPending()
})

describe("MerchantApprovedGuard", () => {
    it("shows a splash screen while checking access", () => {
        mockAuth(null, false, true)

        render(
            <MemoryRouter>
                <MerchantApprovedGuard>
                    <p>Halaman orders</p>
                </MerchantApprovedGuard>
            </MemoryRouter>
        )

        expect(screen.getByText("Memeriksa akses…")).toBeInTheDocument()
    })

    it("shows a splash screen while checking the status", () => {
        mockPending()

        render(
            <MemoryRouter>
                <MerchantApprovedGuard>
                    <p>Halaman orders</p>
                </MerchantApprovedGuard>
            </MemoryRouter>
        )

        expect(screen.getByText("Memeriksa status merchant…")).toBeInTheDocument()
    })

    it("renders protected content when approved", () => {
        mockData("approved")

        renderAtOrders()

        expect(screen.getByText("Halaman orders")).toBeInTheDocument()
        expect(screen.queryByText("Halaman pendaftaran")).not.toBeInTheDocument()
    })

    it.each([["draft"], ["pending"], ["in_review"], ["revision_required"], ["rejected"]] as Array<[MerchantStatus]>)(
        "redirects to /registration when status is %s",
        (status) => {
            mockData(status)

            renderAtOrders()

            expect(screen.getByText("Halaman pendaftaran")).toBeInTheDocument()
            expect(screen.queryByText("Halaman orders")).not.toBeInTheDocument()
        }
    )

    it("redirects to /registration when the registration does not exist yet", () => {
        mockError(apiError("merchant_registration_not_found"))

        renderAtOrders()

        expect(screen.getByText("Halaman pendaftaran")).toBeInTheDocument()
    })

    it("renders protected content for outlet employees without checking registration", () => {
        mockAuth(employeeUser(), false)
        mockError(apiError("merchant_registration_not_found"))

        renderAtOrders()

        expect(screen.getByText("Halaman orders")).toBeInTheDocument()
        expect(screen.queryByText("Halaman pendaftaran")).not.toBeInTheDocument()
    })

    it("redirects users without outlet access to /403 instead of /registration", () => {
        mockAuth(noAccessUser(), false)
        mockError(apiError("merchant_registration_not_found"))

        renderAtOrders()

        expect(screen.getByText("Halaman ditolak")).toBeInTheDocument()
        expect(screen.queryByText("Halaman orders")).not.toBeInTheDocument()
        expect(screen.queryByText("Halaman pendaftaran")).not.toBeInTheDocument()
    })

    it("shows an error state with retry for other failures", async () => {
        const user = userEvent.setup()
        const { refetch } = mockError(
            new ApiError({ status: 500, code: "server_error", title: "Error", detail: "Server sibuk." })
        )

        render(
            <MemoryRouter>
                <MerchantApprovedGuard>
                    <p>Halaman orders</p>
                </MerchantApprovedGuard>
            </MemoryRouter>
        )

        expect(screen.getByText("Gagal memeriksa status merchant")).toBeInTheDocument()
        expect(screen.getByText("Server sibuk.")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Coba lagi" }))

        expect(refetch).toHaveBeenCalledOnce()
    })
})
