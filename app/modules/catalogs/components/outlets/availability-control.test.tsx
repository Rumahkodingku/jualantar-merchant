import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AvailabilityControl } from "./availability-control"
import type { OutletProductAssignment } from "../../types"

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))

vi.mock("../../services/product-outlets/product-outlet.mutations", () => ({
    useSetOutletAvailability: () => ({ mutate, isPending: false }),
}))

const ASSIGNMENT: OutletProductAssignment = {
    id: "a1",
    product_id: "p1",
    outlet_id: "o1",
    outlet: { id: "o1", name: "Outlet Kemang", status: "active" },
    status: "active",
    availability_status: "available",
    unavailable_reason: null,
    display_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
}

function renderControl(assignment: OutletProductAssignment = ASSIGNMENT) {
    return render(<AvailabilityControl productId="p1" assignment={assignment} />)
}

const UNAVAILABLE_ASSIGNMENT: OutletProductAssignment = {
    ...ASSIGNMENT,
    availability_status: "unavailable",
    unavailable_reason: "Stok habis",
}

const TOGGLE = { name: "Ketersediaan Outlet Kemang" }
const REASON = "Alasan (opsional)"

beforeEach(() => {
    mutate.mockReset()
})

describe("AvailabilityControl", () => {
    it("marks a withdrawn product available straight away, with no prompt", async () => {
        const user = userEvent.setup()
        // Turning the switch on needs no explanation, so the prompt is only for
        // the direction that loses something.
        renderControl(UNAVAILABLE_ASSIGNMENT)

        await user.click(screen.getByRole("switch", TOGGLE))

        expect(mutate).toHaveBeenCalledWith({ status: "available" }, expect.anything())
        expect(screen.queryByRole("heading", { name: "Tandai tidak tersedia" })).not.toBeInTheDocument()
    })

    it("asks for an optional reason before withdrawing a product", async () => {
        const user = userEvent.setup()
        renderControl()

        await user.click(screen.getByRole("switch", TOGGLE))

        expect(await screen.findByRole("heading", { name: "Tandai tidak tersedia" })).toBeInTheDocument()
        expect(screen.getByLabelText(REASON)).toBeInTheDocument()
        // Nothing is written until the merchant answers the prompt.
        expect(mutate).not.toHaveBeenCalled()
    })

    it("withdraws without a reason when Lewati is pressed", async () => {
        const user = userEvent.setup()
        renderControl()

        await user.click(screen.getByRole("switch", TOGGLE))
        await screen.findByRole("heading", { name: "Tandai tidak tersedia" })

        // A typed reason is deliberately dropped: Lewati is the answer for a
        // merchant who has no reason to give.
        await user.type(screen.getByLabelText(REASON), "Stok habis")
        await user.click(screen.getByRole("button", { name: "Lewati" }))

        expect(mutate).toHaveBeenCalledWith({ status: "unavailable", reason: null }, expect.anything())
    })

    it("sends the trimmed reason when Simpan is pressed", async () => {
        const user = userEvent.setup()
        renderControl()

        await user.click(screen.getByRole("switch", TOGGLE))
        await screen.findByRole("heading", { name: "Tandai tidak tersedia" })

        await user.type(screen.getByLabelText(REASON), "  Stok habis  ")
        await user.click(screen.getByRole("button", { name: "Simpan" }))

        expect(mutate).toHaveBeenCalledWith({ status: "unavailable", reason: "Stok habis" }, expect.anything())
    })

    it("treats a blank reason as no reason at all", async () => {
        const user = userEvent.setup()
        renderControl()

        await user.click(screen.getByRole("switch", TOGGLE))
        await screen.findByRole("heading", { name: "Tandai tidak tersedia" })

        await user.type(screen.getByLabelText(REASON), "    ")
        await user.click(screen.getByRole("button", { name: "Simpan" }))

        expect(mutate).toHaveBeenCalledWith({ status: "unavailable", reason: null }, expect.anything())
    })

    it("prompts inside a bottom sheet rather than a dialog", async () => {
        const user = userEvent.setup()
        renderControl()

        await user.click(screen.getByRole("switch", TOGGLE))
        await screen.findByRole("heading", { name: "Tandai tidak tersedia" })

        expect(document.querySelector('[data-slot="bottom-sheet-content"]')).toBeInTheDocument()
        expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeInTheDocument()
    })

    it("discards the prompt on the desktop close action", async () => {
        const user = userEvent.setup()
        renderControl()

        await user.click(screen.getByRole("switch", TOGGLE))
        await screen.findByRole("heading", { name: "Tandai tidak tersedia" })

        // Phones throw the sheet away with the drag handle, so the X only shows
        // from `md` up, where a pointer cannot swipe.
        const close = screen.getByRole("button", { name: "Tutup alasan" })
        expect(close).toHaveClass("hidden", "md:inline-flex")

        await user.click(close)

        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: "Tandai tidak tersedia" })).not.toBeInTheDocument()
        })
        expect(mutate).not.toHaveBeenCalled()
    })
})
