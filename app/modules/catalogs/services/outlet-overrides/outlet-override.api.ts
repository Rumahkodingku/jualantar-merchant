import { api } from "~/lib/api"

/**
 * The owner's side of the per-outlet status overrides.
 *
 * Only ever called from the master catalog, so it deliberately uses the master
 * URL base instead of the outlet one: clearing an override means "every outlet
 * follows the master again", which is a statement about the master item rather
 * than about one outlet.
 */
const BASE = "/merchant/catalog/products"

export type OutletOverrideTarget =
    | { kind: "variant"; itemId: string }
    | { kind: "modifier_group"; itemId: string }
    | { kind: "modifier"; groupId: string; itemId: string }

function overrideUrl(productId: string, target: OutletOverrideTarget): string {
    const root = `${BASE}/${productId}`
    const path =
        target.kind === "modifier"
            ? `modifier-groups/${target.groupId}/modifiers/${target.itemId}`
            : target.kind === "modifier_group"
              ? `modifier-groups/${target.itemId}`
              : `variants/${target.itemId}`

    return `${root}/${path}/outlet-overrides`
}

/** Drop every outlet's override of one master item. */
export async function clearOutletItemOverrides(productId: string, target: OutletOverrideTarget): Promise<void> {
    await api.delete(overrideUrl(productId, target))
}
