import { ShieldXIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Text } from "~/components/ui/text"

/**
 * Inline "no access" panel for outlet sections the user may not view. This is a
 * UX affordance only — the API remains the authorization boundary.
 */
export function ForbiddenState({
    title = "Akses ditolak",
    description = "Anda tidak memiliki izin untuk membuka bagian ini.",
    action,
}: {
    title?: string
    description?: string
    action?: ReactNode
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <ShieldXIcon className="size-6" />
            </div>

            <div className="flex flex-col gap-1.5">
                <Text as="h2" variant="base" weight="semibold">
                    {title}
                </Text>
                <Text variant="sm" className="leading-relaxed text-muted-foreground">
                    {description}
                </Text>
            </div>

            {action}
        </div>
    )
}
