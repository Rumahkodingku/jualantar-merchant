import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import { describe, expect, it } from "vitest"

import { RegistrationProvider } from "../registration-context"
import { RegistrationReview } from "./registration-review"
import type {
    MerchantDocument,
    MerchantDocumentType,
    MerchantRegistration,
} from "../../types/merchant-registration.types"

function makeRegistration(overrides: Partial<MerchantRegistration> = {}): MerchantRegistration {
    return {
        id: "m1",
        business_name: "Toko Maju",
        slug: "toko-maju",
        description: "Menjual makanan",
        type: "individual",
        status: "draft",
        merchant_status: "inactive",
        logo: null,
        logo_url: null,
        service: { id: "s1", name: "JualAntar Reguler", slug: "reguler" },
        identity: {
            id: "i1",
            merchant_id: "m1",
            id_type: "ktp",
            id_number: "1234567890",
            full_name: "Budi Santoso",
            birth_date: "1990-01-01",
            created_at: null,
            updated_at: null,
        },
        legal_entity: null,
        categories: [
            {
                id: "c1",
                category_id: "cat-1",
                name: "Makanan",
                slug: "makanan",
                created_at: null,
                updated_at: null,
            },
        ],
        outlets: [
            {
                id: "o1",
                merchant_id: "m1",
                name: "Outlet Utama",
                phone: "081200000000",
                email: null,
                address: "Jl. Merdeka No. 1",
                province_id: 1,
                regency_id: 1,
                district_id: 1,
                village_id: 1,
                postal_code: "12345",
                latitude: 0,
                longitude: 0,
                service_area_type: "radius",
                service_radius_km: 5,
                operating_hours: { monday: { is_open: true, open: "08:00", close: "17:00" } },
                photos: [],
                photos_url: [],
                status: "active",
                geography: { village: "Desa A", district: "Kec A", regency: "Kab A", province: "Prov A" },
                created_at: null,
                updated_at: null,
            },
        ],
        documents: [],
        payout_accounts: [
            {
                id: "p1",
                bank_id: 1,
                bank_name: "BCA",
                account_number: "1234567890",
                account_name: "Budi Santoso",
                is_primary: true,
                status: "active",
                rejection_reason: null,
            },
        ],
        rejection_stage: null,
        rejection_reason: null,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function makeDocument(type: MerchantDocumentType, index: number): MerchantDocument {
    return {
        id: `d${index}`,
        merchant_id: "m1",
        document_type: type,
        file_name: `${type}.jpg`,
        object_key: `merchants/m1/documents/${type}.jpg`,
        mime_type: "image/jpeg",
        file_size: 1024,
        url: null,
        created_at: null,
        updated_at: null,
    }
}

function LocationProbe() {
    const location = useLocation()

    return <span data-testid="path">{location.pathname}</span>
}

function renderReview(registration: MerchantRegistration) {
    return render(
        <MemoryRouter initialEntries={["/registration/review"]}>
            <RegistrationProvider registration={registration}>
                <RegistrationReview registration={registration} />
                <LocationProbe />
            </RegistrationProvider>
        </MemoryRouter>
    )
}

function section(name: string) {
    return within(screen.getByRole("region", { name }))
}

describe("RegistrationReview", () => {
    it("renders each section as a collapsible that is open by default", () => {
        renderReview(makeRegistration())

        const trigger = screen.getByRole("button", { name: /data usaha/i })

        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Toko Maju")).toBeInTheDocument()
    })

    it("collapses and expands a section", async () => {
        const user = userEvent.setup()
        renderReview(makeRegistration())

        const trigger = screen.getByRole("button", { name: /data usaha/i })

        await user.click(trigger)
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        await user.click(trigger)
        expect(trigger).toHaveAttribute("aria-expanded", "true")
    })

    it("shows an empty required section with a complete action", () => {
        renderReview(makeRegistration({ identity: null }))

        expect(section("Identitas pemilik").getByText("Belum diisi")).toBeInTheDocument()
        expect(section("Identitas pemilik").getByRole("button", { name: "Lengkapi data" })).toBeInTheDocument()
    })

    it("keeps partial data visible and warns that the section is incomplete", () => {
        const registration = makeRegistration()
        registration.outlets = [{ ...registration.outlets[0], status: "inactive" }]

        renderReview(registration)

        expect(screen.getByText("Bagian ini belum lengkap. Periksa kembali datanya.")).toBeInTheDocument()
        expect(screen.getByText("Outlet Utama")).toBeInTheDocument()
    })

    it("treats an empty documents section as incomplete", () => {
        renderReview(makeRegistration({ logo_url: null, documents: [] }))

        const documents = section("Logo & dokumen")

        expect(documents.getByText("Belum diisi")).toBeInTheDocument()
        expect(documents.getByRole("button", { name: "Lengkapi data" })).toBeInTheDocument()
    })

    it("marks the documents section complete when at least one document is uploaded", () => {
        renderReview(
            makeRegistration({
                logo_url: "https://storage.test/logo.png",
                documents: (["ktp", "swafoto", "npwp", "rekening"] as MerchantDocumentType[]).map(makeDocument),
            })
        )

        const documents = section("Logo & dokumen")

        expect(documents.getByText("Lengkap")).toBeInTheDocument()
        expect(documents.queryByText("Opsional")).not.toBeInTheDocument()
    })

    it("marks the documents section complete even when only one document is uploaded", () => {
        renderReview(
            makeRegistration({
                logo_url: null,
                documents: (["ktp"] as MerchantDocumentType[]).map(makeDocument),
            })
        )

        expect(section("Logo & dokumen").getByText("Lengkap")).toBeInTheDocument()
    })

    it("renders an outlet sub-card with address and operating hours", () => {
        renderReview(makeRegistration())

        expect(screen.getByText("Jl. Merdeka No. 1, Desa A")).toBeInTheDocument()
        expect(screen.getByText("Radius 5 km")).toBeInTheDocument()
        expect(screen.getByText("Sen 08.00–17.00")).toBeInTheDocument()
    })

    it("navigates to the matching step from the section action", async () => {
        const user = userEvent.setup()
        renderReview(makeRegistration())

        await user.click(section("Layanan").getByRole("button", { name: "Ubah data" }))

        expect(screen.getByTestId("path")).toHaveTextContent("/registration/service")
    })
})
