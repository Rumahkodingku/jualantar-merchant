import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { cn } from "~/lib/utils"

import { ProductActionsMenu } from "./product-actions-menu"
import { ProductCard } from "./product-card"
import type { Product } from "../types/catalog.types"

function SortableProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn("rounded-2xl", isDragging && "relative z-10 opacity-80 shadow-lg ring-2 ring-primary/40")}
            {...attributes}
        >
            <ProductCard
                product={product}
                categoryName={categoryName}
                reorderMode
                dragHandle={
                    <button
                        type="button"
                        aria-label={`Seret ${product.name} untuk mengurutkan`}
                        className="flex w-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                        {...listeners}
                    >
                        <GripVerticalIcon aria-hidden="true" className="size-4" />
                    </button>
                }
            />
        </div>
    )
}

export function ProductList({
    products,
    categoryNameById,
    reorderMode = false,
    onReorder,
}: {
    products: Product[]
    categoryNameById: Record<string, string | undefined>
    reorderMode?: boolean
    onReorder?: (orderedIds: string[]) => void
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

        const ids = products.map((product) => product.id)
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
                <SortableContext items={products.map((product) => product.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-4">
                        {products.map((product) => (
                            <SortableProductCard
                                key={product.id}
                                product={product}
                                categoryName={categoryNameById[product.category_id]}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryNameById[product.category_id]}
                    actionMenu={<ProductActionsMenu product={product} />}
                />
            ))}
        </div>
    )
}
