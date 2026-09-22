import { OutletCard } from "./outlet-card"
import { outletPath } from "../../utils/routes"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

export function OutletList({ outlets }: { outlets: OperationalOutlet[] }) {
    return (
        <div className="flex flex-col gap-3">
            {outlets.map((outlet) => (
                <OutletCard key={outlet.id} outlet={outlet} to={outletPath(outlet.id)} />
            ))}
        </div>
    )
}
