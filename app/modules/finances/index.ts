// Kontrak backend (TODO saat endpoint siap):
// - GET /merchant/finance/summary -> { data: FinanceSummary }
// - GET /merchant/finance/transactions?status=&page=&per_page= -> Paginated<Transaction>
// Ikuti pola services merchant-operations (keys/api/queries/mutations).

export { FinancesPage } from "./pages/finances-page"
