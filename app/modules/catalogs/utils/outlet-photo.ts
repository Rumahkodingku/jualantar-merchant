import type { OperationalOutlet } from "~/modules/merchant-operations"

/**
 * `photos_url` is a sparse array: entries stay index-aligned with `photos` but a
 * photo whose object key failed to resolve comes back as `null`. The first
 * usable URL is treated as the outlet's primary photo, and `null` tells the
 * caller to render a placeholder instead.
 */
export function outletPhotoUrl(outlet: OperationalOutlet | null | undefined): string | null {
    if (outlet === null || outlet === undefined) {
        return null
    }

    return outlet.photos_url.find((photo) => photo !== null && photo !== "") ?? null
}
