import { Checkbox } from "~/components/ui/checkbox"
import { Text } from "~/components/ui/text"

import type { CatalogOutlet } from "../../types/catalog.types"

export function OutletDraftPicker({
    outlets,
    selectedIds,
    onChange,
}: {
    outlets: CatalogOutlet[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <Text variant="sm" weight="medium">
                Produk tersedia di:
            </Text>

            <div className="flex flex-col gap-2">
                {outlets.map((outlet) => {
                    const checked = selectedIds.includes(outlet.id)

                    return (
                        <label
                            key={outlet.id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 hover:bg-muted/50"
                        >
                            <span className="flex min-w-0 flex-col">
                                <Text variant="sm" weight="medium">
                                    {outlet.name}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {checked ? "Ditugaskan" : "Tidak ditugaskan"}
                                </Text>
                            </span>
                            <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                    onChange(
                                        value === true
                                            ? [...selectedIds, outlet.id]
                                            : selectedIds.filter((id) => id !== outlet.id)
                                    )
                                }
                            />
                        </label>
                    )
                })}
            </div>
        </div>
    )
}
