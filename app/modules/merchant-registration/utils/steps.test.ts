import { describe, expect, it } from "vitest"

import type {
    LegalEntity,
    MerchantCategory,
    MerchantIdentity,
    MerchantOutlet,
    MerchantRegistration,
} from "../types/merchant-registration.types"
import {
    applicableSteps,
    firstIncompleteStep,
    isStepComplete,
    REGISTRATION_STEPS,
    stepForRejectionStage,
    stepProgress,
} from "./steps"

function registration(overrides: Partial<MerchantRegistration> = {}): MerchantRegistration {
    return {
        id: "merchant-1",
        business_name: null,
        slug: null,
        description: null,
        type: null,
        status: "draft",
        logo: null,
        logo_url: null,
        service: null,
        identity: null,
        legal_entity: null,
        categories: [],
        outlets: [],
        documents: [],
        payout_accounts: [],
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

const identity: MerchantIdentity = {
    id: "identity-1",
    merchant_id: "merchant-1",
    id_type: "ktp",
    id_number: "6101",
    full_name: "Budi",
    birth_date: null,
    created_at: null,
    updated_at: null,
}

const category: MerchantCategory = {
    id: "mc-1",
    category_id: "category-1",
    name: "Makanan",
    slug: "makanan",
    created_at: null,
    updated_at: null,
}

const outlet: MerchantOutlet = {
    id: "outlet-1",
    merchant_id: "merchant-1",
    name: "Outlet Utama",
    phone: null,
    email: null,
    address: "Jl. Merdeka",
    province_id: 61,
    regency_id: 6101,
    district_id: 610101,
    village_id: 6101012001,
    postal_code: "78711",
    latitude: -0.5,
    longitude: 117.1,
    service_area_type: "radius",
    service_radius_km: 5,
    operating_hours: null,
    status: "active",
    geography: null,
    created_at: null,
    updated_at: null,
}

const legalEntity: LegalEntity = {
    id: "le-1",
    entity_type: "pt",
    name: "PT Contoh",
    nib: "123",
    npwp: "456",
    address: null,
    province_id: 61,
    regency_id: 6101,
    district_id: 610101,
    village_id: 6101012001,
    postal_code: null,
    geography: null,
    created_at: null,
    updated_at: null,
}

describe("applicableSteps", () => {
    it("excludes legal entity for individual merchants", () => {
        const ids = applicableSteps("individual").map((step) => step.id)

        expect(ids).not.toContain("legal-entity")
        expect(ids).toContain("business")
        expect(ids).toContain("review")
    })

    it("includes legal entity for company merchants", () => {
        const ids = applicableSteps("company").map((step) => step.id)

        expect(ids).toContain("legal-entity")
    })

    it("keeps the canonical order", () => {
        expect(REGISTRATION_STEPS.map((step) => step.id)).toEqual([
            "business",
            "identity",
            "legal-entity",
            "service",
            "categories",
            "outlets",
            "documents",
            "payout",
            "review",
        ])
    })
})

describe("firstIncompleteStep", () => {
    it("starts at business for a blank draft", () => {
        expect(firstIncompleteStep(registration())).toBe("business")
    })

    it("moves to identity once business is complete", () => {
        const data = registration({ business_name: "Warung", type: "individual" })

        expect(firstIncompleteStep(data)).toBe("identity")
    })

    it("returns review when every trackable step is complete", () => {
        const data = registration({
            business_name: "Warung",
            type: "individual",
            identity,
            service: { id: "service-1", name: "JAfood", slug: "jafood" },
            categories: [category],
            outlets: [outlet],
            payout_accounts: [
                {
                    id: "payout-1",
                    bank_id: 1,
                    bank_name: "Bank",
                    account_number: "1",
                    account_name: "Budi",
                    is_primary: true,
                    status: "active",
                    rejection_reason: null,
                },
            ],
        })

        expect(firstIncompleteStep(data)).toBe("review")
    })

    it("requires legal entity for company merchants", () => {
        const data = registration({
            business_name: "PT Contoh",
            type: "company",
            identity,
            service: { id: "service-1", name: "JAfood", slug: "jafood" },
            categories: [category],
            outlets: [outlet],
        })

        expect(firstIncompleteStep(data)).toBe("legal-entity")
    })
})

describe("isStepComplete", () => {
    const outletsStep = REGISTRATION_STEPS.find((step) => step.id === "outlets")!

    it("treats inactive-only outlets as incomplete", () => {
        const data = registration({
            outlets: [{ ...outlet, status: "inactive" }],
        })

        expect(isStepComplete(outletsStep, data)).toBe(false)
    })

    it("treats documents as optional", () => {
        const documentsStep = REGISTRATION_STEPS.find((step) => step.id === "documents")!

        expect(isStepComplete(documentsStep, registration())).toBe(true)
    })
})

describe("stepProgress", () => {
    it("counts completed trackable steps", () => {
        const data = registration({
            business_name: "Warung",
            type: "individual",
            identity,
        })

        const progress = stepProgress(data)

        expect(progress.completed).toBe(2)
        expect(progress.total).toBe(6)
        expect(progress.percentage).toBe(33)
    })

    it("ignores legal entity for individuals", () => {
        expect(stepProgress(registration({ type: "individual" })).total).toBe(6)
        expect(stepProgress(registration({ type: "company" })).total).toBe(7)
    })
})

describe("legal entity completeness", () => {
    it("marks company without legal entity incomplete", () => {
        const step = REGISTRATION_STEPS.find((item) => item.id === "legal-entity")!

        expect(isStepComplete(step, registration({ type: "company" }))).toBe(false)
        expect(isStepComplete(step, registration({ type: "company", legal_entity: legalEntity }))).toBe(true)
    })
})

describe("stepForRejectionStage", () => {
    it("maps each rejection stage to its wizard step", () => {
        const data = registration()

        expect(stepForRejectionStage("merchant", data)).toBe("business")
        expect(stepForRejectionStage("identity", data)).toBe("identity")
        expect(stepForRejectionStage("legal_entity", data)).toBe("legal-entity")
        expect(stepForRejectionStage("outlet", data)).toBe("outlets")
        expect(stepForRejectionStage("document", data)).toBe("documents")
        expect(stepForRejectionStage("payout", data)).toBe("payout")
    })

    it("falls back to the first incomplete step for an unknown stage", () => {
        const data = registration({ business_name: "Warung", type: "individual" })

        expect(stepForRejectionStage(undefined, data)).toBe("identity")
        expect(stepForRejectionStage("unknown", data)).toBe("identity")
    })
})
