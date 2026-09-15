import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("~/lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/lib/api")>()
    return { ...actual, putToStorage: vi.fn() }
})

vi.mock("../../services/merchant-registration.mutations", () => ({
    useCreateRegistrationUpload: () => ({ mutateAsync: vi.fn() }),
    useAttachDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDeleteDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

import { DOCUMENT_REQUIREMENTS } from "../../schemas/document.schema"
import type { MerchantDocument } from "../../types/merchant-registration.types"
import { DocumentSlot } from "./document-slot"

function fileInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector('input[type="file"]')

    if (input === null) {
        throw new Error("file input not found")
    }

    return input as HTMLInputElement
}

const ktpRequirement = DOCUMENT_REQUIREMENTS.individual[0]

function storedDocument(): MerchantDocument {
    return {
        id: "doc-1",
        merchant_id: "merchant-1",
        document_type: "ktp",
        file_name: "ktp.jpg",
        object_key: "merchants/merchant-1/documents/ktp.jpg",
        mime_type: "image/jpeg",
        file_size: 2048,
        url: "https://storage.test/ktp.jpg",
        created_at: null,
        updated_at: null,
    }
}

describe("DocumentSlot", () => {
    it("offers a direct upload action without a document type select", () => {
        render(<DocumentSlot requirement={ktpRequirement} document={null} />)

        expect(screen.getByText("KTP")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /unggah/i })).toBeInTheDocument()
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
    })

    it("rejects a disallowed mime type before requesting an upload", async () => {
        const { container } = render(<DocumentSlot requirement={ktpRequirement} document={null} />)

        fireEvent.change(fileInput(container), {
            target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] },
        })

        expect(await screen.findByText(/Format harus JPG, PNG, atau WEBP/i)).toBeInTheDocument()
    })

    it("shows the stored document with replace and delete actions", () => {
        render(<DocumentSlot requirement={ktpRequirement} document={storedDocument()} />)

        expect(screen.getByText("ktp.jpg")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Ganti" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /hapus/i })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /unggah/i })).not.toBeInTheDocument()
    })
})
