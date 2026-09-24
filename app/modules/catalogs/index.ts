// Kontrak backend (TODO saat endpoint siap):
// - GET /merchant/products?search=&page=&per_page= -> Paginated<Product>
// - POST /merchant/products -> { data: Product }
// Ikuti pola services merchant-operations (keys/api/queries/mutations).

export { CATALOGS_BASE, CATALOGS_PATHS } from "./utils/paths"
export { CatalogNewPage } from "./pages/catalog-new-page"
export { CatalogsPage } from "./pages/catalogs-page"
