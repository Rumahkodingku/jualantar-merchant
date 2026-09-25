import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("~/lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/lib/api")>()
    return { ...actual, putToStorage: vi.fn() }
})

vi.mock("../../services/merchant-registration.mutations", () => ({
    useCreateRegistrationUpload: () => ({ mutateAsync: vi.fn() }),
}))

import { FileUpload } from "./file-upload"

function fileInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector('input[type="file"]')

    if (input === null) {
        throw new Error("file input not found")
    }

    return input as HTMLInputElement
}

describe("FileUpload", () => {
    it("rejects a disallowed mime type before requesting an upload", async () => {
        const { container } = render(<FileUpload purpose="logo" imagesOnly />)

        fireEvent.change(fileInput(container), {
            target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] },
        })

        expect(await screen.findByText(/Format harus JPG, PNG, atau WEBP/i)).toBeInTheDocument()
    })

    it("shows the selected file and an upload action", async () => {
        const { container } = render(<FileUpload purpose="logo" imagesOnly />)

        fireEvent.change(fileInput(container), {
            target: { files: [new File(["x"], "logo.png", { type: "image/png" })] },
        })

        expect(await screen.findByText("logo.png")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /^unggah$/i })).toBeInTheDocument()
    })
})
