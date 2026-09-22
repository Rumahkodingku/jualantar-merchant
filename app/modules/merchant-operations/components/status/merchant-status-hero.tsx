import { StatusHeroCard } from "../common/status-hero-card"
import { merchantStatusPresentation } from "../../utils/merchant-status"
import type { MerchantStatus } from "../../types/merchant-operations.types"

export function MerchantStatusHero({ status }: { status: MerchantStatus }) {
    const presentation = merchantStatusPresentation(status)

    return (
        <StatusHeroCard
            indicator={presentation.indicator}
            title={`Merchant ${presentation.label}`}
            description={presentation.description}
            tone={presentation.tone}
            badgeLabel={`Status merchant: ${presentation.label}`}
        />
    )
}
