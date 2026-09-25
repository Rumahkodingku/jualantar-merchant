import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useNotificationStore } from "../hooks/use-notification-store"

import { NotificationsPage } from "./notifications-page"

beforeEach(() => {
    window.localStorage.clear()
    useNotificationStore.setState({ orderUpdates: true, promotions: true })
    vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: vi.fn().mockResolvedValue("granted"),
    })
})

afterEach(() => {
    vi.unstubAllGlobals()
})

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/settings/notifications"]}>
            <NotificationsPage />
        </MemoryRouter>
    )
}

describe("NotificationsPage", () => {
    it("renders the permission request and preference switches", () => {
        renderPage()

        expect(screen.getByRole("heading", { name: "Notifikasi" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Izinkan notifikasi" })).toBeInTheDocument()
        expect(screen.getByRole("switch", { name: "Pesanan baru" })).toHaveAttribute(
            "aria-describedby",
            "notif-order-description"
        )
        expect(screen.getByRole("switch", { name: "Promo & info" })).toHaveAttribute(
            "aria-describedby",
            "notif-promo-description"
        )
    })

    it("updates the permission state after a successful request", async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(screen.getByRole("button", { name: "Izinkan notifikasi" }))

        expect(screen.getByText("Notifikasi diizinkan untuk perangkat ini.")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Izinkan notifikasi" })).not.toBeInTheDocument()
        expect(screen.getByRole("switch", { name: "Pesanan baru" })).not.toHaveAttribute("aria-disabled", "true")
    })

    it("does not show a request button when permission is denied", () => {
        vi.stubGlobal("Notification", { permission: "denied", requestPermission: vi.fn() })
        renderPage()

        expect(screen.getByText(/Notifikasi diblokir/)).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Izinkan notifikasi" })).not.toBeInTheDocument()
    })

    it("explains when the browser does not support device notifications", () => {
        vi.unstubAllGlobals()
        renderPage()

        expect(screen.getByText(/Browser ini tidak mendukung notifikasi perangkat/)).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Izinkan notifikasi" })).not.toBeInTheDocument()
    })

    it("disables preference switches until browser permission is granted", () => {
        renderPage()

        expect(screen.getByRole("switch", { name: "Pesanan baru" })).toHaveAttribute("aria-disabled", "true")
        expect(screen.getByRole("switch", { name: "Promo & info" })).toHaveAttribute("aria-disabled", "true")
    })
})
