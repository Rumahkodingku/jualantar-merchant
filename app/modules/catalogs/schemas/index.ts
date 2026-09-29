/**
 * The catalog's runtime validation, one file per aggregate.
 *
 * Every form in the module — whether it writes straight to the API or stages
 * into the wizard draft — parses through the same schema here, so a rule that
 * changes in one place cannot silently drift away from the other.
 */

export { categorySchema, type CategoryFormValues } from "./category.schema"

export {
    modifierGroupSchema,
    modifierSchema,
    type ModifierGroupFormValues,
    type ModifierFormValues,
} from "./modifier.schema"

export {
    productInfoSchema,
    simplePriceSchema,
    type ProductInfoFormValues,
    type SimplePriceFormValues,
} from "./product.schema"

export { variantRowSchema, type VariantRowValues } from "./variant.schema"
