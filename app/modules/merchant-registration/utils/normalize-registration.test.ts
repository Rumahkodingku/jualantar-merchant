import { describe, expect, it } from "vitest"

import { normalizeRegistrationOverview } from "./normalize-registration"
import type {
    MerchantApprovalRevision,
    MerchantApprovalRevisionItem,
    RegistrationOverview,
} from "../types/merchant-registration.types"

function overview(overrides: Partial<RegistrationOverview> = {}): RegistrationOverview {
    return {
        merchant: { id: "m1", business_name: "Warung", status: "inactive" },
        application: { id: "app-1", status: "draft" },
        revisions: [],
        ...overrides,
    } as unknown as RegistrationOverview
}

function revision(overrides: Partial<MerchantApprovalRevision> = {}): MerchantApprovalRevision {
    return {
        id: "rev-1",
        approval_id: "a1",
        requested_by: null,
        note: null,
        status: "pending",
        requested_at: null,
        resolved_at: null,
        items: [],
        created_at: null,
        ...overrides,
    }
}

function revisionItem(overrides: Partial<MerchantApprovalRevisionItem> = {}): MerchantApprovalRevisionItem {
    return {
        id: "item-1",
        revision_id: "rev-1",
        component: "identity",
        subject_type: "merchant_identity",
        subject_id: "i1",
        reason: null,
        resolved_at: null,
        created_at: null,
        ...overrides,
    }
}

describe("normalizeRegistrationOverview", () => {
    it("flattens the merchant and derives the lifecycle status", () => {
        const result = normalizeRegistrationOverview(
            overview({ application: { id: "app-1", status: "pending" } as never })
        )

        expect(result.id).toBe("m1")
        expect(result.business_name).toBe("Warung")
        expect(result.status).toBe("pending")
        expect(result.merchant_status).toBe("inactive")
    })

    it("falls back to draft when there is no application", () => {
        const result = normalizeRegistrationOverview(overview({ application: null }))

        expect(result.status).toBe("draft")
    })

    it("derives the rejection reason and stage from the latest revision", () => {
        const result = normalizeRegistrationOverview(
            overview({
                revisions: [
                    revision({
                        id: "rev-old",
                        requested_at: "2026-01-01T00:00:00Z",
                        note: "Lama",
                        items: [revisionItem({ component: "business" })],
                    }),
                    revision({
                        id: "rev-new",
                        requested_at: "2026-02-01T00:00:00Z",
                        note: "Foto KTP kurang jelas.",
                        items: [
                            revisionItem({
                                id: "resolved",
                                component: "business",
                                resolved_at: "2026-02-02T00:00:00Z",
                            }),
                            revisionItem({ id: "open", component: "identity" }),
                        ],
                    }),
                ],
            })
        )

        expect(result.rejection_reason).toBe("Foto KTP kurang jelas.")
        expect(result.rejection_stage).toBe("identity")
    })

    it("leaves rejection details empty without revisions", () => {
        const result = normalizeRegistrationOverview(overview())

        expect(result.rejection_reason).toBeNull()
        expect(result.rejection_stage).toBeNull()
    })

    it("derives the rejection reason from the note when items are absent", () => {
        const result = normalizeRegistrationOverview(
            overview({
                revisions: [
                    revision({
                        requested_at: "2026-01-01T00:00:00Z",
                        note: "Foto KTP kurang jelas.",
                        items: undefined,
                    }),
                ],
            })
        )

        expect(result.rejection_reason).toBe("Foto KTP kurang jelas.")
        expect(result.rejection_stage).toBeNull()
    })

    it("passes through the decision reason from the overview", () => {
        const result = normalizeRegistrationOverview(overview({ decision_reason: "Dokumen tidak valid." }))

        expect(result.decision_reason).toBe("Dokumen tidak valid.")
    })

    it("defaults the decision reason to null when absent", () => {
        const result = normalizeRegistrationOverview(overview())

        expect(result.decision_reason).toBeNull()
    })
})
