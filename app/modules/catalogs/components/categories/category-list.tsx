import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { CategoryRow, type CategoryRowAction } from "./category-row"
import type { CatalogCategory } from "../../types/catalog.types"

export function CategoryList({
    categories,
    reorderMode,
    hasSearch,
    onAction,
    onReorder,
}: {
    categories: CatalogCategory[]
    reorderMode: boolean
    hasSearch: boolean
    onAction: (category: CatalogCategory, action: CategoryRowAction) => void
    onReorder: (orderedIds: string[]) => void
}) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over == null || active.id === over.id) {
            return
        }

        const ids = categories.map((category) => category.id)
        const oldIndex = ids.indexOf(String(active.id))
        const newIndex = ids.indexOf(String(over.id))

        if (oldIndex < 0 || newIndex < 0) {
            return
        }

        onReorder(arrayMove(ids, oldIndex, newIndex))
    }

    if (reorderMode && !hasSearch) {
        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={categories.map((category) => category.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {categories.map((category) => (
                            <CategoryRow key={category.id} category={category} reorderMode onAction={() => undefined} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {categories.map((category) => (
                <CategoryRow
                    key={category.id}
                    category={category}
                    reorderMode={false}
                    onAction={(action) => onAction(category, action)}
                />
            ))}
        </div>
    )
}
