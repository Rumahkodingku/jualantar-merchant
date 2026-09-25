import { notifyError } from "~/lib/notify"
import type { ReorderItem } from "../types/catalog.types"

export function useEntityReorder<T extends { id: string }>({
    items,
    reorder,
    errorMessage = "Gagal mengubah urutan",
}: {
    items: T[]
    reorder: (items: ReorderItem[], options: { onError: () => void }) => void
    errorMessage?: string
}) {
    function move(index: number, direction: -1 | 1) {
        const next = [...items]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)

        reorder(
            next.map((entry, order) => ({ id: entry.id, display_order: order })),
            { onError: () => notifyError(errorMessage) }
        )
    }

    return { move }
}
