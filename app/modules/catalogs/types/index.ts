/**
 * The catalog's domain types, one file per aggregate.
 *
 * Everything inside the module imports from here so a reader looking for
 * "everything about variants" has a single entry point, and the individual
 * files stay small enough to read at a glance. The underlying files stay
 * separate because each aggregate is owned by its own service folder.
 */

export type {
    AvailabilityStatus,
    CatalogStatus,
    CategorySortField,
    PaginatedResponse,
    PaginationMeta,
    ProductSortField,
    ProductType,
    ReorderItem,
    SelectionType,
    SortOrder,
} from "./common.types"

export type { ProductOutletRow } from "./outlet.types"

export type { OutletItemOverride, OutletScopedStatus } from "./outlet-override.types"

export type { CategoryCreateInput, CategoryIndexParams, CategoryUpdateInput, CatalogCategory } from "./category.types"

export type {
    MediaIndexParams,
    MediaRegisterInput,
    MediaUploadTarget,
    MediaUploadUrlInput,
    ProductMedia,
} from "./media.types"

export type {
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    ProductModifier,
    ProductModifierGroup,
} from "./modifier.types"

export type { CatalogOutlet, OutletAvailabilityInput, OutletIndexParams, OutletProductAssignment } from "./outlet.types"

export type {
    Product,
    ProductCategorySummary,
    ProductCreateInput,
    ProductDetail,
    ProductDetailPriceSummary,
    ProductDetailPriceType,
    ProductDetailSummary,
    ProductIndexParams,
    ProductPrimaryMedia,
    ProductUpdateInput,
} from "./product.types"

export type { VariantCreateInput, VariantIndexParams, VariantUpdateInput, ProductVariant } from "./variant.types"

export type { EditForm, EditSnapshot } from "./product-edit.types"

export type { GroupDraft, MediaDraft, ModifierDraft, VariantDraft } from "./product-draft.types"

export type {
    OutletCatalogAssignment,
    OutletCatalogCategory,
    OutletCatalogIndexParams,
    OutletCatalogItem,
    OutletCatalogProduct,
    OutletCatalogReorderItem,
    OutletCatalogSortField,
    OutletCatalogVariant,
    OutletModifier,
    OutletModifierGroup,
} from "./outlet-catalog.types"
