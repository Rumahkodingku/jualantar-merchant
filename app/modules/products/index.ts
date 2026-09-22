// Kontrak backend (TODO saat endpoint siap):
// - GET /merchant/products?search=&page=&per_page= -> Paginated<Product>
// - POST /merchant/products -> { data: Product }
// Ikuti pola services merchant-operations (keys/api/queries/mutations).

export { PRODUCTS_BASE, PRODUCTS_PATHS } from "./utils/paths"
export { ProductNewPage } from "./pages/product-new-page"
export { ProductsPage } from "./pages/products-page"
