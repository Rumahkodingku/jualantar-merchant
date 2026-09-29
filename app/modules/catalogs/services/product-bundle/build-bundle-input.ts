import type { ProductBundleInput, ProductBundleMediaInput } from "../product-bundle/product-bundle.mutation"
import type { ProductInfoFormValues } from "../../schemas"
import type { GroupDraft, MediaDraft, VariantDraft } from "../../types/product-draft.types"

/**
 * Turn the wizard's form into the sequence of calls a product create needs.
 *
 * A price typed into a text input is a string and becomes a number — or `null`
 * for a variable product, which gets its price from its variants instead.
 *
 * Note the one asymmetry below: a modifier group's blank description is
 * normalised to `null`, but the product's own description is passed through as
 * the empty string it already is. That is how it has always been sent, and
 * changing it here would alter what the API records for products saved without
 * a description.
 *
 * Pure on purpose: the wizard calls it on every save and on every retry, and
 * it is the one place where a mistake would create a malformed product.
 */
export function buildBundleInput({
    info,
    priceRaw,
    variants,
    groups,
    media,
    outletIds,
}: {
    info: ProductInfoFormValues
    priceRaw: string
    variants: VariantDraft[]
    groups: GroupDraft[]
    media: MediaDraft[]
    outletIds: string[]
}): ProductBundleInput {
    const isSimple = info.product_type === "simple"

    return {
        product: {
            category_id: info.category_id ?? "",
            name: info.name,
            description: info.description ?? null,
            product_type: info.product_type,
            price: isSimple ? Number(priceRaw) : null,
        },
        variants: isSimple
            ? []
            : variants.map((variant) => ({
                  name: variant.name,
                  sku: variant.sku === "" ? null : variant.sku,
                  price: variant.price,
                  is_default: variant.is_default,
              })),
        modifierGroups: groups.map((group) => ({
            group: {
                name: group.name,
                description: group.description === "" ? null : group.description,
                selection_type: group.selection_type,
                min_selection: group.min_selection,
                max_selection: group.max_selection,
                is_required: group.is_required,
            },
            modifiers: group.modifiers.map((modifier) => ({
                name: modifier.name,
                description: modifier.description === "" ? null : modifier.description,
                price: modifier.price,
                is_default: modifier.is_default,
            })),
        })),
        // A photo still uploading is left out; it has no stored object yet.
        media: media
            .filter((item) => item.status === "ready")
            .map<ProductBundleMediaInput>((item) => ({
                object_key: item.object_key,
                alt_text: item.alt_text === "" ? null : item.alt_text,
                is_primary: item.is_primary,
            })),
        outletIds,
    }
}
