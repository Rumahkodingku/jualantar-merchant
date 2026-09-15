import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../hooks/use-registration-upload", () => ({
    useRegistrationUpload: () => ({
        file: null,
        state: "idle",
        progress: 0,
        error: null,
        select: vi.fn(),
        upload: vi.fn(),
        reset: vi.fn(),
        cancel: vi.fn(),
        isUploading: false,
    }),
}))

import { OutletPhotosField } from "./outlet-photos-field"

describe("OutletPhotosField", () => {
    it("shows the empty upload prompt when there are no photos", () => {
        render(<OutletPhotosField photos={[]} photoUrls={{}} onChange={() => {}} />)

        expect(screen.getByText(/Unggah foto outlet/i)).toBeInTheDocument()
    })

    it("renders existing photos and removes the selected one", () => {
        const onChange = vi.fn()

        render(
            <OutletPhotosField
                photos={["key-1", "key-2"]}
                photoUrls={{ "key-1": "https://storage.test/1.jpg", "key-2": "https://storage.test/2.jpg" }}
                onChange={onChange}
            />
        )

        expect(screen.getAllByRole("button", { name: /hapus foto/i })).toHaveLength(2)
        expect(screen.getByText(/Tambah foto lain/i)).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole("button", { name: /hapus foto/i })[0])

        expect(onChange).toHaveBeenCalledWith(["key-2"])
    })
})
