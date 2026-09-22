// Kontrak backend (TODO saat endpoint siap):
// - GET /merchant/promotions?status=&page=&per_page= -> Paginated<Promotion>
// - POST /merchant/promotions -> { data: Promotion }
// Ikuti pola services merchant-operations (keys/api/queries/mutations).

export { PROMOTIONS_BASE, PROMOTIONS_PATHS } from "./utils/paths"
export { PromotionNewPage } from "./pages/promotion-new-page"
export { PromotionsPage } from "./pages/promotions-page"
