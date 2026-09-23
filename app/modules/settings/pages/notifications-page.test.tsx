import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"

import { useNotificationStore } from "~/stores"

import { NotificationsPage } from "./notifications-page"

beforeEach(() => {
    window.localStorage.clear()
    useNotificationStore.setState({ orderUpdates: true, promotions: true })
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
        expect(screen.getByRole("button", { name: "Minta izin notifikasi" })).toBeInTheDocument()
        expect(screen.getByRole("switch", { name: "Pesanan baru" })).toBeInTheDocument()
        expect(screen.getByRole("switch", { name: "Promo & info" })).toBeInTheDocument()
    })

    it("disables preference switches until browser permission is granted", () => {
        renderPage()

        expect(screen.getByRole("switch", { name: "Pesanan baru" })).toHaveAttribute("aria-disabled", "true")
        expect(screen.getByRole("switch", { name: "Promo & info" })).toHaveAttribute("aria-disabled", "true")
    })
})
