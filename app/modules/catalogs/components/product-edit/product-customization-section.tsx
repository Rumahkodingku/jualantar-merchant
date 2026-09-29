import { Text } from "~/components/ui/text"

import { EditableSection } from "./editable-section"
import { StatusBadge } from "../common/status-badge"
import { ModifierEditor } from "../modifiers/modifier-editor"
import type { ProductDetail } from "../../types"

/** The groups and options a customer can add on top of the product. */
export function ProductCustomizationSection({
    product,
    isExpanded,
    isEditing,
    onToggle,
    onStartEdit,
    onStopEdit,
}: {
    product: ProductDetail
    isExpanded: boolean
    isEditing: boolean
    onToggle: () => void
    onStartEdit: () => void
    onStopEdit: () => void
}) {
    const groups = product.modifier_groups ?? []

    return (
        <EditableSection
            title="Customization"
            summary={groups.length > 0 ? `${groups.length} modifier group` : "Tidak ada customization"}
            isExpanded={isExpanded}
            isEditing={isEditing}
            onToggle={onToggle}
            onStartEdit={onStartEdit}
            onStopEdit={onStopEdit}
            view={
                groups.length === 0 ? (
                    <Text variant="sm" className="text-muted-foreground">
                        Belum ada modifier group.
                    </Text>
                ) : (
                    <div className="flex flex-col gap-3">
                        {groups.map((group) => (
                            <div key={group.id} className="rounded-xl border p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <Text variant="sm" weight="semibold">
                                        {group.name}
                                    </Text>
                                    <StatusBadge status={group.status} />
                                </div>
                                <Text variant="xs" className="text-muted-foreground">
                                    {group.modifiers.length} modifier • {group.is_required ? "Wajib" : "Opsional"}
                                </Text>
                            </div>
                        ))}
                    </div>
                )
            }
            editor={<ModifierEditor productId={product.id} groups={groups} />}
        />
    )
}
