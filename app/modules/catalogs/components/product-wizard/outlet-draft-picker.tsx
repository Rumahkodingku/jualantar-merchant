import { Checkbox } from "~/components/ui/checkbox"
import { Text } from "~/components/ui/text"

import { OutletSelectRow } from "../outlets/outlet-select-row"
import type { CatalogOutlet } from "../../types"

/**
 * The wizard's outlet step. Nothing is saved yet — the picks live in the draft
 * until the product is created — so this is a plain multi-select over the
 * merchant's outlets.
 */
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
                        <OutletSelectRow
                            key={outlet.id}
                            outlet={outlet}
                            isAssigned={checked}
                            className="py-3"
                            control={
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
                            }
                        />
                    )
                })}
            </div>
        </div>
    )
}
