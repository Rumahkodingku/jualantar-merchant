import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { cn } from "~/lib/utils"

import { OutletProductCard } from "./outlet-product-card"
import type { OutletCatalogItem } from "../../types"

function SortableOutletProductCard({ item, outletId }: { item: OutletCatalogItem; outletId: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.product.id,
    })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn("relative rounded-xl", isDragging && "z-10 opacity-80 shadow-lg ring-2 ring-primary/40")}
            {...attributes}
        >
            <OutletProductCard
                item={item}
                outletId={outletId}
                reorderMode
                dragHandle={
                    <button
                        type="button"
                        aria-label={`Seret ${item.product.name} untuk mengurutkan`}
                        className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
                        {...listeners}
                    >
                        <GripVerticalIcon aria-hidden="true" className="size-5" />
                    </button>
                }
            />
        </div>
    )
}

export function OutletProductList({
    items,
    outletId,
    reorderMode = false,
    onReorder,
}: {
    items: OutletCatalogItem[]
    outletId: string
    reorderMode?: boolean
    onReorder?: (orderedProductIds: string[]) => void
}) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    function handleDragEnd(event: DragEndEvent) {
        if (!reorderMode || onReorder === undefined) {
            return
        }

        const { active, over } = event

        if (over == null || active.id === over.id) {
            return
        }

        const ids = items.map((item) => item.product.id)
        const oldIndex = ids.indexOf(String(active.id))
        const newIndex = ids.indexOf(String(over.id))

        if (oldIndex < 0 || newIndex < 0) {
            return
        }

        onReorder(arrayMove(ids, oldIndex, newIndex))
    }

    if (reorderMode) {
        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((item) => item.product.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                        {items.map((item) => (
                            <SortableOutletProductCard key={item.product.id} item={item} outletId={outletId} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {items.map((item) => (
                <OutletProductCard key={item.product.id} item={item} outletId={outletId} />
            ))}
        </div>
    )
}
