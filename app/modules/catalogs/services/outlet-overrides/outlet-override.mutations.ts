import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as outletOverrideApi from "./outlet-override.api"

/**
 * Let every outlet follow the master catalog again for one item.
 *
 * The item's own master status is untouched — an item the owner deactivated
 * stays inactive — so the only cache worth invalidating is the master product
 * detail, which is where the override list is rendered.
 */
export function useClearOutletItemOverrides(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (target: outletOverrideApi.OutletOverrideTarget) =>
            outletOverrideApi.clearOutletItemOverrides(productId, target),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
