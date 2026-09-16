import type {
    MerchantApprovalRevision,
    MerchantRegistration,
    RegistrationOverview,
} from "../types/merchant-registration.types"

function latestRevision(revisions: MerchantApprovalRevision[]): MerchantApprovalRevision | null {
    if (revisions.length === 0) {
        return null
    }

    return [...revisions].sort((a, b) => {
        const aTime = a.requested_at ?? a.created_at ?? ""
        const bTime = b.requested_at ?? b.created_at ?? ""

        return bTime.localeCompare(aTime)
    })[0]
}

function firstUnresolvedStage(revision: MerchantApprovalRevision | null): string | null {
    if (revision === null) {
        return null
    }

    const item = revision.items.find((candidate) => candidate.resolved_at === null) ?? revision.items[0]

    return item?.component ?? null
}

/**
 * Flatten the registration overview into the wizard's domain shape: the
 * merchant payload plus the application lifecycle status and rejection details
 * derived from the latest approval revision.
 */
export function normalizeRegistrationOverview(overview: RegistrationOverview): MerchantRegistration {
    const { merchant, application, revisions } = overview
    const revision = latestRevision(revisions)

    return {
        ...merchant,
        status: application?.status ?? "draft",
        merchant_status: merchant.status,
        rejection_stage: firstUnresolvedStage(revision),
        rejection_reason: revision?.note ?? null,
    }
}
