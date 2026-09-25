import { Text } from "~/components/ui/text"

import type { ProductDetail } from "../../types/catalog.types"

export function ProductMediaGrid({ product }: { product: ProductDetail }) {
    const media = product.media ?? []

    if (media.length === 0) {
        return (
            <Text variant="sm" className="text-muted-foreground">
                Belum ada foto.
            </Text>
        )
    }

    return (
        <div className="flex flex-wrap gap-2">
            {media.map((item) => (
                <div key={item.id} className="relative size-16 overflow-hidden rounded-lg border bg-muted">
                    {item.url != null ? (
                        <img src={item.url} alt={item.alt_text ?? ""} className="size-full object-cover" />
                    ) : null}
                    {item.is_primary ? (
                        <span className="absolute top-0.5 left-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                            Utama
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    )
}

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
