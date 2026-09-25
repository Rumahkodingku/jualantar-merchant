import { Badge } from "~/components/ui/badge"

import type { SectionStatus } from "../../utils/review-section-status"

export function SectionStatusBadge({ status }: { status: SectionStatus }) {
    if (status === "complete") {
        return (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                Lengkap
            </Badge>
        )
    }

    if (status === "incomplete") {
        return (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Perlu dilengkapi
            </Badge>
        )
    }

    return <Badge variant="outline">Opsional</Badge>
}
