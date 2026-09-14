import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CategoryForm } from "./index"

const { mutate, goNext, categories } = vi.hoisted(() => ({
    mutate: vi.fn(),
    goNext: vi.fn(),
    categories: [
        { id: "c1", service_id: "s1", name: "Makanan", slug: "makanan", description: null, icon: null },
        { id: "c2", service_id: "s1", name: "Minuman", slug: "minuman", description: null, icon: null },
        { id: "c3", service_id: "s1", name: "Snack", slug: "snack", description: null, icon: null },
        { id: "c4", service_id: "s1", name: "Kue", slug: "kue", description: null, icon: null },
    ],
}))

vi.mock("./registration-context", () => ({
    useRegistrationContext: () => ({
        registration: {
            service: { id: "s1", name: "JAfood", slug: "jafood" },
            categories: [],
        },
        navigation: {
            goNext,
            goBack: vi.fn(),
        },
    }),
}))

vi.mock("~/modules/service-catalog", () => ({
    useCategories: () => ({ data: categories, isPending: false }),
}))

vi.mock("../services/merchant-registration.mutations", () => ({
    useSaveCategories: () => ({ mutate, isPending: false }),
}))

describe("CategoryForm", () => {
    it("enforces a maximum of three categories", async () => {
        const user = userEvent.setup()
        render(<CategoryForm />)

        await user.click(screen.getByRole("button", { name: "Makanan" }))
        await user.click(screen.getByRole("button", { name: "Minuman" }))
        await user.click(screen.getByRole("button", { name: "Snack" }))
        await user.click(screen.getByRole("button", { name: "Kue" }))

        expect(await screen.findByText("Maksimal 3 kategori.")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(3)
        expect(mutate).not.toHaveBeenCalled()
    })

    it("saves the selected category ids", async () => {
        const user = userEvent.setup()
        render(<CategoryForm />)

        await user.click(screen.getByRole("button", { name: "Makanan" }))
        await user.click(screen.getByRole("button", { name: /simpan & lanjut/i }))

        expect(mutate).toHaveBeenCalledWith(["c1"], expect.objectContaining({ onSuccess: expect.any(Function) }))
    })
})
