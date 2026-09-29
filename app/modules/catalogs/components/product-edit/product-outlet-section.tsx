import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"

import { EditableSection } from "./editable-section"
import { OutletAssignment } from "../outlets/outlet-assignment"
import { ProductOutletsList } from "./product-readonly-sections"
import type { OutletProductAssignment, ProductDetail } from "../../types"

/**
 * The outlets this product is sold at.
 *
 * The assignment list is its own request, so this section can be loading or
 * broken on its own while the rest of the screen is fine — hence the local
 * pending and error branches rather than one page-wide gate.
 */
export function ProductOutletSection({
    product,
    assignments,
    isLoading,
    isError,
    isExpanded,
    isEditing,
    onToggle,
    onStartEdit,
    onStopEdit,
    onRetry,
}: {
    product: ProductDetail
    assignments: OutletProductAssignment[]
    isLoading: boolean
    isError: boolean
    isExpanded: boolean
    isEditing: boolean
    onToggle: () => void
    onStartEdit: () => void
    onStopEdit: () => void
    onRetry: () => void
}) {
    return (
        <EditableSection
            title="Outlet"
            summary={`${assignments.length} outlet`}
            isExpanded={isExpanded}
            isEditing={isEditing}
            onToggle={onToggle}
            onStartEdit={onStartEdit}
            onStopEdit={onStopEdit}
            view={
                isLoading ? (
                    <ListSkeleton rows={2} className="h-20" />
                ) : isError ? (
                    <ErrorState title="Gagal memuat outlet" onRetry={onRetry} />
                ) : (
                    <ProductOutletsList
                        assignments={assignments.map((assignment) => ({
                            id: assignment.id,
                            outlet_id: assignment.outlet_id,
                            outlet_name: assignment.outlet?.name,
                        }))}
                    />
                )
            }
            editor={
                isError ? (
                    <ErrorState title="Gagal memuat outlet" onRetry={onRetry} />
                ) : (
                    <OutletAssignment productId={product.id} assignments={assignments} />
                )
            }
        />
    )
}
