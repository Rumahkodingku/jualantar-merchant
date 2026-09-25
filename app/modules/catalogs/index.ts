// Kontrak backend (lihat docs/PRD-Catalog-UI.md §32):
// - GET/POST /merchant/catalog/products -> Paginated<Product> / { data: Product }
// Repository saat ini mock in-memory; integrasi API mengganti
// catalog-mock.repository dengan ApiCatalogRepository tanpa mengubah komponen.

export { CATALOGS_BASE, CATALOGS_PATHS } from "./utils/paths"
export { formatCurrency } from "./utils/format-currency"
export { PRODUCT_TYPE_LABEL, STATUS_LABEL } from "./utils/labels"
export { CatalogsPage } from "./pages/catalogs-page"
export { CatalogCategoriesPage } from "./pages/categories-page"
export { CatalogModifiersPage } from "./pages/modifiers-page"
export { ProductDetailPage } from "./pages/product-detail-page"
export { ProductNewPage } from "./pages/product-new-page"
export { ProductEditPage } from "./pages/product-edit-page"
export type {
    CatalogCategory,
    CatalogStatus,
    OutletProductAssignment,
    Product,
    ProductDetail,
    ProductMedia,
    ProductModifier,
    ProductModifierGroup,
    ProductType,
    ProductVariant,
} from "./types/catalog.types"
