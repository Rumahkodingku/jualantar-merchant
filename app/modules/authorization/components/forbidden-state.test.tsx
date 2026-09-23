import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ForbiddenState } from "./forbidden-state"

describe("ForbiddenState", () => {
    it("renders the default denial copy", () => {
        render(<ForbiddenState />)

        expect(screen.getByRole("heading", { name: "Akses ditolak" })).toBeInTheDocument()
        expect(screen.getByText(/tidak memiliki izin/)).toBeInTheDocument()
    })

    it("renders a custom action when provided", () => {
        render(<ForbiddenState action={<button type="button">Kembali</button>} />)

        expect(screen.getByRole("button", { name: "Kembali" })).toBeInTheDocument()
    })
})
