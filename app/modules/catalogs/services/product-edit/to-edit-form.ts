import { draftKey } from "../../utils/draft-key"
import type {
    EditForm,
    GroupDraft,
    MediaDraft,
    ModifierDraft,
    ProductDetail,
    ProductMedia,
    ProductModifierGroup,
    ProductVariant,
    VariantDraft,
} from "../../types"

/**
 * Turn the product the API returned into the rows the wizard edits.
 *
 * A draft key is minted for every row because the wizard's editors identify and
 * reorder rows by that key, and a server id is not one — it can be absent for a
 * row that is new and it is meaningless to a row the merchant has just
 * duplicated. Both are kept: the key for the form, the id for the save.
 *
 * A photo that already belongs to the product has no `object_key` of its own —
 * it is registered already — so it is marked `ready` with an empty key and the
 * save recognises it by its id.
 */
export function toEditForm(product: ProductDetail, outletIds: string[]): EditForm {
    return {
        info: {
            name: product.name,
            category_id: product.category_id,
            description: product.description ?? "",
            product_type: product.product_type,
        },
        priceRaw: product.price != null ? String(product.price) : "",
        variants: (product.variants ?? []).map(toEditVariant),
        groups: (product.modifier_groups ?? []).map(toEditGroup),
        media: (product.media ?? []).map(toEditMedia),
        outletIds: [...outletIds],
    }
}

function toEditVariant(variant: ProductVariant): VariantDraft {
    return {
        id: variant.id,
        key: draftKey("var"),
        name: variant.name,
        sku: variant.sku ?? "",
        price: variant.price,
        status: variant.status,
        is_default: variant.is_default,
    }
}

function toEditModifier(modifier: ProductModifierGroup["modifiers"][number]): ModifierDraft {
    return {
        id: modifier.id,
        key: draftKey("mod"),
        name: modifier.name,
        description: modifier.description ?? "",
        price: modifier.price,
        is_default: modifier.is_default,
        status: modifier.status,
    }
}

function toEditGroup(group: ProductModifierGroup): GroupDraft {
    return {
        id: group.id,
        key: draftKey("grp"),
        name: group.name,
        description: group.description ?? "",
        selection_type: group.selection_type,
        min_selection: group.min_selection,
        max_selection: group.max_selection,
        is_required: group.is_required,
        status: group.status,
        modifiers: group.modifiers.map(toEditModifier),
    }
}

function toEditMedia(media: ProductMedia): MediaDraft {
    return {
        id: media.id,
        key: draftKey("med"),
        object_key: "",
        file_name: "",
        mime_type: media.mime_type,
        file_size: media.file_size ?? 0,
        preview_url: media.url,
        alt_text: media.alt_text ?? "",
        is_primary: media.is_primary,
        status: "ready",
    }
}
