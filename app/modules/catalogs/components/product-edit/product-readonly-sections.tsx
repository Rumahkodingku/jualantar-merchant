import { Text } from "~/components/ui/text"

import { MediaStrip } from "../media/media-strip"
import type { ProductDetail } from "../../types"

export function ProductMediaGrid({ product }: { product: ProductDetail }) {
    return <MediaStrip media={product.media ?? []} />
}

/**
 * The read-only outlet list on the edit screen. The assignable version — with
 * the per-outlet status, availability and removal controls — is
 * `OutletAssignment`; this is the same data without the writes.
 */
export function ProductOutletsList({
    assignments,
}: {
    assignments: Array<{ id: string; outlet_name?: string; outlet_id: string }>
}) {
    if (assignments.length === 0) {
        return (
            <Text variant="sm" className="text-muted-foreground">
                Belum ada outlet yang ditugaskan.
            </Text>
        )
    }

    return (
        <ul className="flex flex-col gap-1.5">
            {assignments.map((assignment) => (
                <li key={assignment.id} className="rounded-lg border px-3 py-2">
                    <Text variant="sm">{assignment.outlet_name ?? assignment.outlet_id}</Text>
                </li>
            ))}
        </ul>
    )
}
