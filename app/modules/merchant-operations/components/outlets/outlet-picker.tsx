import { OutletCard } from "./outlet-card"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

export function OutletPicker({
    outlets,
    onSelect,
}: {
    outlets: OperationalOutlet[]
    onSelect: (outlet: OperationalOutlet) => void
}) {
    return (
        <div className="flex flex-col gap-3">
            {outlets.map((outlet) => (
                <OutletCard key={outlet.id} outlet={outlet} onClick={() => onSelect(outlet)} />
            ))}
        </div>
    )
}
