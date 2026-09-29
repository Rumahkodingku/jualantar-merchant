import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { OperationalOutlet } from "~/modules/merchant-operations"

import type { OutletProductAssignment, ProductOutletRow } from "../../types"

import { ProductOutletList } from "./product-outlet-list"

function outlet(overrides: Partial<OperationalOutlet> = {}): OperationalOutlet {
    return {
        id: "o1",
        merchant_id: "mch-001",
        name: "Outlet Utama",
        phone: null,
        email: null,
        address: "Jl. Merdeka No. 1",
        province_id: 1,
        regency_id: 2,
        district_id: 3,
        village_id: 4,
        postal_code: "60111",
        latitude: "-7.25790500",
        longitude: "112.75212000",
        service_area_type: "radius",
        service_radius_km: "5.00",
        operating_hours: null,
        photos: [],
        photos_url: [],
        status: "active",
        geography: {
            village: "Tunjungan",
            district: "Klojen",
            regency: "Malang",
            province: "Jawa Timur",
        },
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function assignment(overrides: Partial<OutletProductAssignment> = {}): OutletProductAssignment {
    return {
        id: "asg-1",
        product_id: "p1",
        outlet_id: "o1",
        outlet: { id: "o1", name: "Outlet Utama", status: "active" },
        status: "active",
        availability_status: "available",
        unavailable_reason: null,
        display_order: 0,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function row(
    overrides: {
        assignment?: Partial<OutletProductAssignment>
        outlet?: OperationalOutlet | null
    } = {}
): ProductOutletRow {
    return {
        assignment: assignment(overrides.assignment),
        outlet: overrides.outlet === undefined ? outlet() : overrides.outlet,
    }
}

function secondRow(): ProductOutletRow {
    return row({
        assignment: { id: "asg-2", outlet_id: "o2" },
        outlet: outlet({ id: "o2", name: "Outlet Cabang", address: "Jl. Sudirman No. 9" }),
    })
}

describe("ProductOutletList", () => {
    it("shows the empty state when the product has no outlets", () => {
        render(<ProductOutletList rows={[]} />)

        expect(screen.getByText("Belum ada outlet")).toBeInTheDocument()
        expect(screen.queryByRole("list")).not.toBeInTheDocument()
    })

    it("renders the outlet photo with the outlet name as its alt text", () => {
        render(<ProductOutletList rows={[row({ outlet: outlet({ photos_url: ["https://cdn.test/a.jpg"] }) })]} />)

        expect(screen.getByAltText("Foto Outlet Utama")).toHaveAttribute("src", "https://cdn.test/a.jpg")
    })

    it("skips unusable photo slots and uses the first resolvable url", () => {
        render(<ProductOutletList rows={[row({ outlet: outlet({ photos_url: [null, "https://cdn.test/b.jpg"] }) })]} />)

        expect(screen.getByAltText("Foto Outlet Utama")).toHaveAttribute("src", "https://cdn.test/b.jpg")
    })

    it("falls back to a placeholder when the outlet has no photo", () => {
        render(<ProductOutletList rows={[row()]} />)

        expect(screen.queryByAltText("Foto Outlet Utama")).not.toBeInTheDocument()
    })

    it("falls back to a placeholder when the photo fails to load", () => {
        render(<ProductOutletList rows={[row({ outlet: outlet({ photos_url: ["https://cdn.test/broken.jpg"] }) })]} />)

        const image = screen.getByAltText("Foto Outlet Utama")
        fireEvent.error(image)

        expect(screen.queryByAltText("Foto Outlet Utama")).not.toBeInTheDocument()
    })

    it("labels the photo with the assignment name when the outlet is unresolved", () => {
        const unresolved = row({
            outlet: null,
            assignment: { outlet: { id: "o9", name: "Outlet Cadangan", status: "active" } },
        })

        render(<ProductOutletList rows={[unresolved]} />)

        expect(screen.queryByAltText("Foto Outlet Cadangan")).not.toBeInTheDocument()
        expect(screen.getByText("Outlet Cadangan")).toBeInTheDocument()
    })

    it("reports how many outlets provide the product", () => {
        render(<ProductOutletList rows={[row(), secondRow()]} />)

        expect(screen.getByText("Terdapat 2 outlet yang menyediakan produk ini.")).toBeInTheDocument()
    })
})

describe("ProductOutletList disclosure", () => {
    it("expands a lone outlet so the owner does not have to tap to see it", () => {
        render(<ProductOutletList rows={[row()]} />)

        const trigger = screen.getByRole("button", { name: /Outlet Utama/ })

        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Alamat Operasional")).toBeInTheDocument()
    })

    it("collapses every outlet when there is more than one, keeping the list scannable", () => {
        render(<ProductOutletList rows={[row(), secondRow()]} />)

        const triggers = screen.getAllByRole("button", { name: /Outlet/ })

        expect(triggers).toHaveLength(2)
        for (const trigger of triggers) {
            expect(trigger).toHaveAttribute("aria-expanded", "false")
        }
        expect(screen.queryByText("Alamat Operasional")).not.toBeInTheDocument()
    })

    it("reveals the detail panel when the trigger is pressed", () => {
        render(<ProductOutletList rows={[row(), secondRow()]} />)

        fireEvent.click(screen.getByRole("button", { name: /Outlet Utama/ }))

        expect(screen.getByRole("button", { name: /Outlet Utama/ })).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Alamat Operasional")).toBeInTheDocument()
    })

    it("hides the detail panel again on a second press", () => {
        render(
            <ProductOutletList
                rows={[row({ outlet: outlet({ photos_url: ["https://cdn.test/a.jpg"] }) }), secondRow()]}
            />
        )

        const trigger = screen.getByRole("button", { name: /Outlet Utama/ })

        fireEvent.click(trigger)
        expect(screen.getByText("Alamat Operasional")).toBeInTheDocument()

        fireEvent.click(trigger)
        expect(screen.queryByText("Alamat Operasional")).not.toBeInTheDocument()
    })

    it("keeps each outlet's expansion independent", () => {
        render(<ProductOutletList rows={[row(), secondRow()]} />)

        fireEvent.click(screen.getByRole("button", { name: /Outlet Utama/ }))

        expect(screen.getByRole("button", { name: /Outlet Utama/ })).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByRole("button", { name: /Outlet Cabang/ })).toHaveAttribute("aria-expanded", "false")
    })

    it("exposes contact details only for the fields the outlet actually has", () => {
        const contact = row({ outlet: outlet({ phone: "0812-1111-2222", email: "cs@outlet.test" }) })

        render(<ProductOutletList rows={[contact]} />)

        expect(screen.getByText("0812-1111-2222")).toBeInTheDocument()
        expect(screen.getByText("cs@outlet.test")).toBeInTheDocument()
    })

    it("surfaces the unavailable reason inside the panel", () => {
        const unavailable = row({
            assignment: { availability_status: "unavailable", unavailable_reason: "Stok habis di gudang." },
        })

        render(<ProductOutletList rows={[unavailable]} />)

        expect(screen.getByText("Produk tidak tersedia")).toBeInTheDocument()
        expect(screen.getByText("Stok habis di gudang.")).toBeInTheDocument()
    })
})
