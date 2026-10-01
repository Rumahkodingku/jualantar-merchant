# PLAN Revisi Frontend Catalog — JualAntar Merchant

> Repository: `Rumahkodingku/jualantar-merchant`
> Backend dependency: `Rumahkodingku/jualantar-api`
> Scope: Revisi frontend Catalog agar selaras dengan authorization dan outlet-scoped Catalog API terbaru.
> Fokus utama: pemisahan **Master Catalog** untuk merchant owner dan **Outlet Catalog** untuk `outlet_manager` / `outlet_staff`.
> Dokumen ini adalah implementation guide dan tidak melakukan perubahan code.

---

# 1. Tujuan

Revisi frontend Catalog bertujuan membuat UI mengikuti contract backend terbaru:

```text
MASTER CATALOG
merchant / owner
        │
        ├── Category management
        ├── Product management
        ├── Variant management
        ├── Media management
        ├── Customization management
        └── Product ↔ Outlet assignment
```

sedangkan:

```text
OUTLET CATALOG
merchant / owner
outlet_manager
outlet_staff
        │
        ├── Melihat produk assigned ke outlet
        ├── Melihat detail product dalam scope outlet
        ├── Mengubah availability
        ├── Manager → assignment status
        └── Manager → reorder
```

Frontend tidak boleh lagi memperlakukan `CatalogsPage` master sebagai catalog universal untuk semua role.

---

# 2. Current Frontend Architecture

Repository saat ini sudah mempunyai struktur yang cukup baik:

```text
app/modules/catalogs/
├── components/
├── hooks/
├── pages/
├── routes/
├── schemas/
├── services/
├── types/
└── utils/
```

Service layer juga sudah dipisahkan berdasarkan aggregate:

```text
services/
├── categories/
├── media/
├── modifiers/
├── products/
├── product-bundle/
├── product-draft/
├── product-edit/
├── product-outlets/
├── variants/
├── catalog.keys.ts
├── catalog.invalidation.ts
└── pagination.ts
```

Authorization frontend juga sudah memiliki fondasi terpusat:

```text
app/modules/authorization/
├── components/
├── hooks/
├── utils/
└── index.ts
```

terutama:

```text
can()
canForOutlet()
roleForOutlet()
useAuthorization()
useOutletAuthorization()
```

### Prinsip

Jangan membuat authorization baru di masing-masing component.

Gunakan existing authorization infrastructure.

---

# 3. Backend Contract yang Menjadi Source of Truth

Frontend wajib mengikuti backend terbaru.

## 3.1 Master Product

```http
GET /merchant/catalog/products
GET /merchant/catalog/products/{product}
```

Scope:

```text
merchant / owner only
```

Endpoint ini menjadi source untuk:

```text
Master Product List
Master Product Detail
Create Product
Edit Product
Delete Product
Activate/Deactivate Product
Variant
Media
Customization
Product Assignment
```

---

## 3.2 Outlet Product List

```http
GET /merchant/catalog/outlets/{outlet}/products
```

Scope:

```text
merchant
outlet_manager
outlet_staff
```

dengan syarat outlet berada dalam scope user.

Response hanya berisi:

```text
produk yang assigned ke outlet tersebut
```

---

## 3.3 Outlet Product Detail

Endpoint baru:

```http
GET /merchant/catalog/outlets/{outlet}/products/{product}
```

Scope:

```text
merchant
outlet_manager
outlet_staff
```

Endpoint ini wajib digunakan ketika employee membuka detail product melalui Outlet Catalog.

Frontend tidak boleh mengarahkan employee ke:

```http
GET /merchant/catalog/products/{product}
```

---

# 4. Role Matrix

Frontend harus mengikuti matrix berikut.

| Capability               | merchant | outlet_manager | outlet_staff |
| ------------------------ | -------: | -------------: | -----------: |
| Master Catalog List      |        ✅ |              ❌ |            ❌ |
| Master Product Detail    |        ✅ |              ❌ |            ❌ |
| Create Product           |        ✅ |              ❌ |            ❌ |
| Edit Product             |        ✅ |              ❌ |            ❌ |
| Delete Product           |        ✅ |              ❌ |            ❌ |
| Category Management      |        ✅ |              ❌ |            ❌ |
| Variant Management       |        ✅ |              ❌ |            ❌ |
| Media Management         |        ✅ |              ❌ |            ❌ |
| Customization Management |        ✅ |              ❌ |            ❌ |
| Product Assignment       |        ✅ |              ❌ |            ❌ |
| Outlet Catalog List      |        ✅ |              ✅ |            ✅ |
| Outlet Product Detail    |        ✅ |              ✅ |            ✅ |
| Availability Update      |        ✅ |              ✅ |            ✅ |
| Assignment Status Update |        ✅ |              ✅ |            ❌ |
| Outlet Reorder           |        ✅ |              ✅ |            ❌ |

Authorization UI hanya merupakan UX guard.

Backend tetap menjadi security boundary.

---

# 5. Phase 0 — Freeze Current Frontend Contract

Sebelum perubahan:

- [ ] Catat route Catalog saat ini.
- [ ] Catat route Product Detail.
- [ ] Catat route Product Edit.
- [ ] Catat route Product New.
- [ ] Catat semua Catalog API service.
- [ ] Catat query keys.
- [ ] Catat mutation keys.
- [ ] Catat authorization utility yang sudah tersedia.
- [ ] Catat component yang saat ini mengasumsikan user adalah owner.
- [ ] Catat test Catalog existing.

Jangan menghapus behavior existing sebelum replacement sudah tersedia.

---

# 6. Phase 1 — Authorization Frontend Contract

## Task 1.1 — Extend capability constants

Current:

```text
CAP
├── view
├── outletsView
├── hoursView
├── ...
```

Tambahkan capability Catalog yang mencerminkan backend:

```ts
catalogView
catalogAvailabilityUpdate
catalogAssignmentStatusUpdate
catalogOrderUpdate
```

Mapping:

```text
merchant.operations.catalog.view
merchant.operations.catalog.availability.update
merchant.operations.catalog.assignment.status.update
merchant.operations.catalog.order.update
```

Role mapping harus sama dengan backend.

---

## Task 1.2 — Extend authorization tests

Pastikan:

```text
merchant
→ semua catalog capability
```

```text
outlet_manager
→ catalog.view
→ catalog.availability.update
→ catalog.assignment.status.update
→ catalog.order.update
```

```text
outlet_staff
→ catalog.view
→ catalog.availability.update
```

Staff tidak boleh memperoleh:

```text
catalog.assignment.status.update
catalog.order.update
```

---

# 7. Phase 2 — Separate Catalog Scope

Current:

```text
/catalogs
```

mengarah ke:

```text
CatalogsPage
→ useProducts()
→ /merchant/catalog/products
```

Ini hanya valid untuk owner.

Arsitektur target:

```text
/catalogs
```

harus memilih experience berdasarkan role/context.

Konsep:

```text
merchant
    ↓
Master Catalog

outlet_manager
    ↓
Outlet Catalog

outlet_staff
    ↓
Outlet Catalog
```

Jangan menjadikan component list yang sama sebagai satu-satunya abstraction jika data source dan capabilities berbeda.

---

# 8. Phase 3 — Outlet Selection / Active Outlet Context

Outlet employee membutuhkan outlet context yang eksplisit.

Gunakan existing:

```text
useOutletAuthorization(outletId)
```

dan existing outlet assignment data dari auth/session.

Target:

```text
Outlet Employee
        │
        ▼
Current Outlet
        │
        ▼
Outlet Catalog
```

### Rules

Untuk `outlet_manager` / `outlet_staff`:

- hanya outlet yang memiliki assignment user yang boleh dipilih;
- jangan menampilkan outlet milik merchant lain;
- jangan menampilkan sibling outlet yang tidak ditugaskan;
- perubahan outlet harus mengubah seluruh query key yang outlet-scoped.

Query key harus memiliki outlet id.

Contoh konseptual:

```ts
catalogKeys.outletProductList(outletId, params)
catalogKeys.outletProduct(outletId, productId)
```

Jangan menggunakan key global:

```ts
catalogKeys.productList(params)
```

untuk outlet catalog.

---

# 9. Phase 4 — Outlet Catalog API Layer

Tambahkan API service baru di:

```text
app/modules/catalogs/services/outlet-catalog/
```

Recommended:

```text
outlet-catalog.api.ts
outlet-catalog.queries.ts
outlet-catalog.mutations.ts
outlet-catalog.api.test.ts
```

atau sesuaikan dengan convention service existing.

---

# 10. Outlet Catalog Query Contract

Implement:

```ts
fetchOutletProducts(outletId, params)
```

menggunakan:

```http
GET /merchant/catalog/outlets/{outlet}/products
```

Implement:

```ts
fetchOutletProduct(outletId, productId)
```

menggunakan:

```http
GET /merchant/catalog/outlets/{outlet}/products/{product}
```

Query hooks:

```text
useOutletProducts()
useOutletProductDetail()
```

---

# 11. Outlet Catalog Types

Current `Product` dan `ProductDetail` merepresentasikan master catalog.

Jangan memaksakan outlet response masuk ke `ProductDetail` master.

Buat contract terpisah.

Contoh konseptual:

```ts
interface OutletCatalogProduct {
    product: ProductSummary
    category: CatalogCategorySummary
    variants: ProductVariant[]
    primary_media: ProductPrimaryMedia | null
    modifier_groups: ProductModifierGroup[]
    assignment: OutletProductAssignment
    is_sellable: boolean
}
```

Detail harus merepresentasikan:

```text
master product data
+
target outlet state
```

tetapi tidak membawa assignment outlet lain.

---

# 12. Phase 5 — Outlet Catalog List Page

Buat halaman/component untuk:

```text
Outlet Catalog
```

Target behavior:

```text
Header
├── nama outlet
├── status outlet
└── outlet selector

Toolbar
├── search
├── category
├── status
└── availability

Product List
└── assigned products only
```

Jangan menampilkan:

```text
Tambah Produk
```

untuk employee.

Jangan menampilkan master catalog controls.

---

# 13. Phase 6 — Product Detail Routing

Current route:

```text
/catalogs/products/:productId
```

adalah master product detail.

Pertahankan route tersebut untuk owner.

Tambahkan route outlet-specific.

Recommended:

```text
/catalogs/outlets/:outletId/products/:productId
```

atau convention yang paling sesuai dengan routing existing.

Route loader/page harus memanggil:

```text
useOutletProductDetail(outletId, productId)
```

bukan:

```text
useProductDetail(productId)
```

untuk employee.

---

# 14. Phase 7 — Product Detail UI Separation

Master Product Detail:

```text
Product Detail
├── Summary
├── Variant
├── Customization
├── Media
└── Outlet
```

tetap dipertahankan untuk owner.

Outlet Product Detail:

```text
Outlet Product Detail
├── Product identity
├── Price
├── Category
├── Variant
├── Customization
├── Media
└── Outlet State
    ├── Availability
    └── Assignment status
```

Tidak perlu menampilkan master administration controls kepada employee.

---

# 15. Phase 8 — Product Action Restrictions

Current component:

```text
use-product-actions.ts
```

harus diperiksa karena saat ini mutation product master tersedia secara langsung.

Pastikan UI action menu mengikuti scope.

Untuk owner:

```text
Edit
Delete
Activate
Deactivate
```

Untuk employee:

```text
Tidak ada master actions
```

Jangan hanya menyembunyikan button berdasarkan role.

Component action hook juga sebaiknya tidak expose mutation action yang tidak relevan pada outlet context.

---

# 16. Phase 9 — Outlet Operations

Outlet Catalog membutuhkan mutation berikut.

## 16.1 Availability

Endpoint:

```http
POST /merchant/catalog/products/{product}/outlets/{outlet}/availability
```

Akses:

```text
merchant
outlet_manager
outlet_staff
```

UI:

```text
Availability Switch
```

atau component existing yang paling dekat dengan pola project.

---

## 16.2 Assignment Status

Endpoint:

```http
POST /merchant/catalog/products/{product}/outlets/{outlet}/activate
POST /merchant/catalog/products/{product}/outlets/{outlet}/deactivate
```

Akses:

```text
merchant
outlet_manager
```

Staff:

```text
read-only
```

---

## 16.3 Reorder

Endpoint:

```http
PUT /merchant/catalog/outlets/{outlet}/products/order
```

Akses:

```text
merchant
outlet_manager
```

Staff:

```text
read-only
```

Gunakan `@dnd-kit` yang sudah tersedia.

Jangan menggunakan reorder master:

```http
PUT /merchant/catalog/products/order
```

untuk Outlet Catalog.

---

# 17. Phase 10 — Master Product Assignment UI

Current Product Detail memiliki:

```text
Product Outlet
```

dan menggunakan:

```text
useProductOutletRows()
useProductAssignments()
```

Bagian ini tetap menjadi master assignment management.

Hanya owner yang boleh:

```text
Assign outlet
Replace assignments
Remove assignment
```

Employee tidak boleh menggunakan flow ini.

---

# 18. Phase 11 — Product Detail Summary Alignment

Current `product.types.ts` sudah memiliki:

```text
ProductDetailSummary
```

dengan:

```text
price
variants_count
customization_groups_count
media_count
outlets_count
```

dan mapper sudah mendukung backend `summary`.

Pertahankan contract tersebut.

Namun:

```text
deriveSummary()
```

harus dianggap fallback compatibility saja.

Target utama:

```text
backend summary
    ↓
ProductDetail
```

Jangan memindahkan business calculation kembali ke component React.

---

# 19. Phase 12 — Query Key Design

Current:

```text
catalogKeys.productList(params)
catalogKeys.product(productId)
catalogKeys.productAssignments(productId)
```

harus dipisahkan dengan jelas.

Recommended concept:

```text
catalogKeys
├── products
│   ├── list(params)
│   └── detail(productId)
│
├── outletCatalog
│   ├── list(outletId, params)
│   └── detail(outletId, productId)
│
└── productAssignments
    └── list(productId)
```

Outlet id wajib menjadi bagian query identity.

Tujuannya mencegah cache outlet A dipakai untuk outlet B.

---

# 20. Phase 13 — Cache Invalidation

Update:

```text
catalog.invalidation.ts
```

agar mutation outlet hanya melakukan invalidation terhadap query outlet yang relevan.

Contoh:

```text
availability update
    ↓
invalidate outlet product detail
invalidate outlet product list
```

Assignment status:

```text
assignment status update
    ↓
invalidate outlet product
invalidate outlet catalog
```

Reorder:

```text
reorder
    ↓
invalidate outlet catalog list
```

Jangan secara berlebihan invalidate seluruh master catalog jika tidak diperlukan.

---

# 21. Phase 14 — Navigation / Routing

Current:

```text
/catalogs
/catalogs/categories
/catalogs/new
/catalogs/products/:productId
/catalogs/products/:productId/edit
```

Target:

```text
Owner
/catalogs
/catalogs/categories
/catalogs/new
/catalogs/products/:productId
/catalogs/products/:productId/edit

Employee
/catalogs
/catalogs/outlets/:outletId/products/:productId
```

Pastikan employee tidak bisa:

```text
/catalogs/new
/catalogs/products/:productId/edit
/catalogs/categories
```

meskipun user mencoba membuka URL secara manual.

Frontend route guard harus diterapkan.

Backend tetap menjadi enforcement terakhir.

---

# 22. Phase 15 — Route Guard Strategy

Gunakan existing:

```text
RequireCapability
OutletCapabilityGuard
ForbiddenState
```

Jangan membuat:

```tsx
if (user.role === "outlet_staff")
```

di banyak route.

Gunakan capability.

Contoh:

```text
Master Catalog
→ require owner/master context

Outlet Catalog
→ CAP.catalogView

Outlet Availability
→ CAP.catalogAvailabilityUpdate

Outlet Assignment Status
→ CAP.catalogAssignmentStatusUpdate

Outlet Reorder
→ CAP.catalogOrderUpdate
```

---

# 23. Phase 16 — UX for Forbidden / Not Found

Backend memiliki semantic:

```text
403 outlet_scope_forbidden
403 outlet_capability_forbidden
404 outlet_not_found
404 not_found
```

Frontend jangan mengubah semuanya menjadi:

```text
"Gagal memuat data"
```

Mapping harus dibedakan.

### 403 capability

Gunakan:

```text
ForbiddenState
```

### 404

Gunakan:

```text
Not Found / Empty resource state
```

### Network/5xx

Gunakan:

```text
ErrorState
```

---

# 24. Phase 17 — Existing Component Reuse

Codebase sudah mempunyai banyak shared components.

Prioritaskan reuse:

```text
components/common/
components/products/
components/product-detail/
components/product-edit/
components/outlets/
```

Contoh yang sudah tersedia:

```text
ProductList
ProductFilters
ProductDetailHeader
ProductSummary
ProductVariantList
ProductCustomizationView
ProductMediaGallery
ProductOutletList
OutletSelectRow
MediaTile
SectionToolbar
CatalogEmptyState
ForbiddenState
```

Jangan membuat duplicate component hanya karena Outlet Catalog mempunyai page berbeda.

Buat abstraction baru hanya jika behavior benar-benar berbeda.

---

# 25. Phase 18 — Master vs Outlet Component Boundary

Target architecture:

```text
components/
├── common/
│
├── products/
│   └── master catalog list
│
├── product-detail/
│   └── reusable product presentation
│
├── product-edit/
│   └── owner-only editing
│
├── outlet-catalog/
│   ├── outlet-product-list
│   ├── outlet-product-card
│   ├── outlet-product-detail
│   └── outlet-product-actions
│
└── outlets/
    └── shared outlet UI
```

Outlet-specific behavior jangan ditambahkan dengan terlalu banyak conditional ke component master.

---

# 26. Phase 19 — Product Detail Data Ownership

Master detail:

```text
useProductDetail(productId)
```

data:

```text
ProductDetail
```

Outlet detail:

```text
useOutletProductDetail(outletId, productId)
```

data:

```text
OutletCatalogProduct
```

Do not:

```text
fetch master detail
+
fetch outlet assignment
+
gabungkan semuanya di page
```

untuk employee.

Outlet detail API sudah dibuat khusus untuk kebutuhan tersebut.

---

# 27. Phase 20 — Product Assignment Tab

Untuk owner:

```text
Product Detail
└── Outlet tab
    └── useProductOutletRows(productId)
```

flow ini dipertahankan.

Outlet employee tidak membutuhkan tab:

```text
Outlet
```

yang berisi daftar outlet.

Mereka sudah berada di:

```text
Outlet Context
```

sehingga UI harus menampilkan:

```text
Current Outlet State
```

bukan:

```text
All Outlet Assignments
```

---

# 28. Phase 21 — Forms

Product create/edit forms tetap owner-only.

Current structure:

```text
product-wizard
product-edit
product-draft
```

tidak perlu diubah untuk kebutuhan employee.

Jangan memasukkan outlet staff/manager ke product wizard.

---

# 29. Phase 22 — API Mapper

Current:

```text
catalog.mappers.ts
```

sudah menangani:

```text
ProductWire
ProductDetailWire
ProductDetailSummaryWire
```

Tambahkan outlet mapper terpisah, misalnya:

```text
outlet-catalog.mappers.ts
```

jika response outlet mempunyai wire shape berbeda.

Jangan menjejalkan semua mapping outlet ke:

```text
toProduct()
```

karena master dan outlet semantics berbeda.

---

# 30. Phase 23 — Tests

## Authorization tests

Wajib:

```text
merchant
manager
staff
```

---

## Outlet scope tests

### Manager

```text
own outlet → 200
sibling outlet → 403
foreign outlet → 404
```

### Staff

```text
own outlet → 200
sibling outlet → 403
foreign outlet → 404
```

---

## Capability tests

Staff:

```text
availability → visible/editable
assignment status → readonly
reorder → readonly
```

Manager:

```text
availability → editable
assignment status → editable
reorder → editable
```

---

# 31. Phase 24 — Product Detail Tests

Master:

```text
owner → 200
employee → forbidden
```

Outlet:

```text
owner → 200
manager → 200
staff → 200
```

Data source harus benar.

Test harus memastikan outlet detail tidak accidentally menggunakan endpoint master.

---

# 32. Phase 25 — Cache / Query Tests

Test:

```text
outlet A
outlet B
```

secara bergantian.

Pastikan:

```text
useOutletProducts(outletA)
```

tidak menghasilkan data:

```text
outletB
```

Test query key identity.

---

# 33. Phase 26 — Regression Tests

Semua test Catalog existing harus tetap lulus.

Baseline repository terakhir yang tercatat memiliki:

```text
77 files / 399 tests
```

sehingga perubahan wajib mempertahankan coverage existing dan menambah test baru tanpa menghapus assertion hanya untuk membuat suite hijau.

---

# 34. Phase 27 — Responsive / PWA

Karena project merupakan React Router + PWA:

validasi:

```text
desktop
tablet
mobile
```

terutama:

```text
outlet selector
product list
product detail
availability controls
reorder mode
forbidden state
```

Tidak boleh membuat outlet workflow yang hanya usable pada desktop.

---

# 35. Phase 28 — Loading / Error / Empty State

Setiap outlet query harus mempunyai state terpisah:

```text
pending
error
empty
success
```

Contoh:

```text
Outlet List loading
Product Detail loading
Outlet State mutation loading
Reorder loading
```

Manfaatkan existing:

```text
ListSkeleton
Skeleton
ErrorState
CatalogEmptyState
ForbiddenState
```

---

# 36. Phase 29 — Accessibility

Pastikan action outlet:

```text
availability
activate/deactivate
reorder
outlet selector
```

memiliki:

```text
aria-label
keyboard interaction
visible focus
clear status text
```

Drag-and-drop reorder harus tetap mempunyai fallback interaction bila pattern existing project membutuhkan accessible ordering.

---

# 37. Phase 30 — Implementation Sequence

Implementasi dilakukan bertahap.

## Step 1 — Authorization Contract

- extend catalog capabilities;
- update role capability mapping;
- add tests.

## Step 2 — Query Key

- tambah master/outlet separation;
- tambah outlet-aware keys.

## Step 3 — Outlet API Services

- list;
- detail;
- availability;
- assignment status;
- reorder.

## Step 4 — Outlet Types + Mappers

- outlet product;
- outlet detail;
- assignment state.

## Step 5 — Outlet Catalog Page

- outlet context;
- list;
- filters;
- loading/error/empty.

## Step 6 — Outlet Product Detail

- route;
- query;
- UI;
- outlet state.

## Step 7 — Role-based Actions

- availability;
- assignment status;
- reorder.

## Step 8 — Master Catalog Guards

Pastikan existing master UI hanya muncul untuk owner.

## Step 9 — Cache Invalidation

Sinkronkan mutation terhadap query outlet.

## Step 10 — Tests

- authorization;
- routing;
- query;
- detail;
- mutation;
- cache;
- regression.

## Step 11 — UI Verification

Desktop + mobile + PWA.

---

# 38. Files Likely To Change

## Authorization

```text
app/modules/authorization/utils/capabilities.ts
app/modules/authorization/utils/resolver.ts
app/modules/authorization/hooks/use-outlet-authorization.ts
```

jika memang dibutuhkan.

---

## Catalog Types

```text
app/modules/catalogs/types/product.types.ts
app/modules/catalogs/types/outlet.types.ts
app/modules/catalogs/types/index.ts
```

atau file outlet-specific baru.

---

## Catalog Services

Current:

```text
app/modules/catalogs/services/
```

Tambahan yang mungkin:

```text
services/outlet-catalog/
services/outlet-catalog/outlet-catalog.api.ts
services/outlet-catalog/outlet-catalog.queries.ts
services/outlet-catalog/outlet-catalog.mutations.ts
```

serta:

```text
catalog.keys.ts
catalog.invalidation.ts
```

---

## Catalog Components

Kemungkinan:

```text
components/outlet-catalog/
```

dengan:

```text
outlet-catalog-list.tsx
outlet-catalog-card.tsx
outlet-catalog-filters.tsx
outlet-product-detail.tsx
outlet-product-actions.tsx
```

Nama final harus mengikuti convention setelah audit file existing secara lebih granular.

---

## Pages

Kemungkinan:

```text
pages/outlet-catalog-page.tsx
pages/outlet-product-detail-page.tsx
```

---

## Routes

```text
routes/catalogs-layout.tsx
routes/index.tsx
routes/product-detail.tsx
```

dan route baru outlet sesuai hasil implementasi.

---

# 39. Files That Should Not Be Reworked Unnecessarily

Jangan melakukan refactor ulang terhadap area yang sudah baru saja dirapikan:

```text
product-new wizard
product-edit sections
product draft hooks
catalog aggregate services
shared media components
shared outlet select row
common detail rows
common catalog toolbar
```

Perubahan hanya dilakukan bila memang diperlukan oleh outlet architecture.

---

# 40. Important Anti-Patterns

Jangan:

```tsx
if (user.role === "outlet_staff") ...
```

di banyak component.

Jangan:

```text
Master Product API
+
Product Assignment API
+
React merge
```

untuk outlet detail.

Jangan membuat:

```text
MasterCatalogPage dengan puluhan conditional role
```

sehingga sulit dipelihara.

Jangan menggunakan:

```text
master product reorder
```

untuk outlet reorder.

Jangan menggunakan query key tanpa `outletId`.

Jangan menyembunyikan action hanya berdasarkan UI tanpa capability guard.

Jangan memperluas scope menjadi:

```text
orders
finances
promotions
notifications
merchant registration
```

---

# 41. Acceptance Criteria

Implementasi dianggap selesai jika:

### Master Catalog

- [ ] Owner tetap dapat menggunakan seluruh Catalog workflow.
- [ ] Product create/edit/delete tetap berjalan.
- [ ] Category management tetap berjalan.
- [ ] Variant/media/customization tetap berjalan.
- [ ] Product assignment tetap berjalan.

### Outlet Catalog

- [ ] Manager dapat melihat product assigned ke outlet.
- [ ] Staff dapat melihat product assigned ke outlet.
- [ ] Detail menggunakan outlet-specific endpoint.
- [ ] Product dari outlet lain tidak muncul.
- [ ] Sibling outlet menghasilkan forbidden state.
- [ ] Foreign outlet menghasilkan not-found state.
- [ ] Staff tidak melihat master edit/delete/create controls.
- [ ] Staff dapat mengubah availability.
- [ ] Manager dapat mengubah availability.
- [ ] Manager dapat mengubah assignment status.
- [ ] Manager dapat reorder.
- [ ] Staff tidak dapat reorder.
- [ ] Staff tidak dapat mengubah assignment status.

### Data Isolation

- [ ] Outlet id selalu menjadi bagian query identity.
- [ ] Cache outlet A tidak bocor ke outlet B.
- [ ] Outlet detail tidak menampilkan assignment outlet lain.
- [ ] Master detail tidak digunakan sebagai substitute outlet detail.

### Regression

- [ ] Existing Product Detail tetap berfungsi.
- [ ] Existing Product Edit tetap berfungsi.
- [ ] Existing Product New tetap berfungsi.
- [ ] Existing Product Assignment tetap berfungsi.
- [ ] Existing Catalog tests tetap hijau.
- [ ] New outlet tests tersedia.

---

# 42. Definition of Done

Frontend Catalog dianggap selesai setelah:

```text
Backend Catalog API
        │
        ▼
Authorization Contract
        │
        ▼
Master Catalog ───────── Owner
        │
        └── Product / Category / Variant / Media / Customization

Outlet Catalog ───────── Owner / Manager / Staff
        │
        ├── Outlet List
        ├── Outlet Product Detail
        ├── Availability
        ├── Assignment Status
        └── Reorder
```

dan seluruh flow tersebut:

```text
role-aware
outlet-scoped
cache-safe
type-safe
tested
responsive
```

tanpa mengubah behavior Catalog owner secara tidak perlu.

---

# 43. Final Architecture

```text
                         CATALOG MODULE
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
          MASTER CATALOG                OUTLET CATALOG
                 │                           │
              owner                   owner / manager / staff
                 │                           │
       ┌─────────┼─────────┐         ┌──────┼──────────┐
       │         │         │         │      │          │
    products categories assignments list  detail   operations
       │                           │      │       │
       │                           │      │       ├─ availability
       │                           │      │       ├─ status
       │                           │      │       └─ reorder
       ▼                           ▼
 master API                    outlet API
       │                           │
       ▼                           ▼
 React Query                  React Query
       │                           │
       └──────────────┬────────────┘
                      ▼
               Shared UI Components
```

Prinsip final:

> **Master Catalog adalah sumber data dan administrasi catalog. Outlet Catalog adalah operational view dari product yang sudah di-assign ke outlet tertentu.**

Frontend harus merepresentasikan dua konsep tersebut secara eksplisit, bukan menyamarkan keduanya sebagai satu catalog dengan conditional role logic.
