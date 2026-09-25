import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { ModifierGroupCard } from "./modifier-group-card"
import { ModifierGroupFormDialog } from "./modifier-group-form-dialog"
import type { ProductModifierGroup } from "../../types/catalog.types"

export function ModifierEditor({ productId, groups }: { productId: string; groups: ProductModifierGroup[] }) {
    const [groupDialog, setGroupDialog] = useState<{ open: boolean; group?: ProductModifierGroup }>({ open: false })

    return (
        <div className="flex flex-col gap-3">
            {groups.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5">
                    <Text variant="sm" className="text-muted-foreground">
                        Belum ada customization. Tambahkan modifier group agar pelanggan dapat memilih opsi tambahan.
                    </Text>
                    <Button type="button" size="sm" onClick={() => setGroupDialog({ open: true })}>
                        <PlusIcon /> Tambah Modifier Group
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {groups.map((group) => (
                        <ModifierGroupCard
                            key={group.id}
                            productId={productId}
                            group={group}
                            onEditGroup={(target) => setGroupDialog({ open: true, group: target })}
                        />
                    ))}
                </div>
            )}

            {groups.length > 0 ? (
                <div>
                    <Button type="button" size="sm" variant="outline" onClick={() => setGroupDialog({ open: true })}>
                        <PlusIcon /> Tambah Modifier Group
                    </Button>
                </div>
            ) : null}

            {groupDialog.open ? (
                <ModifierGroupFormDialog
                    productId={productId}
                    group={groupDialog.group}
                    onClose={() => setGroupDialog({ open: false })}
                />
            ) : null}
        </div>
    )
}
