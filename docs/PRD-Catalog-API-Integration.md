# PRD — Integrasi Catalog API ke Frontend JualAntar Merchant

**Project:** JualAntar — Merchant Application  
**Module:** Catalogs  
**Frontend:** `jualantar-merchant`  
**Backend:** `ualantar-api`  
**Status:** Ready for API Integration  
**Scope:** Mengganti data source dummy/in-memory menjadi real Catalog API tanpa redesign UX.

---

# 0. Hasil Audit terhadap Codebase Aktual (Revisi)

Revisi ini dibuat setelah meng-clone dan membaca langsung kedua repository
(`jualantar-api` dan `jualantar-merchant`), bukan hanya berdasarkan asumsi
dokumen sebelumnya. Sebagian besar isi PRD versi awal **sudah terverifikasi
akurat** terhadap kode aktual (route list, resource shape, reorder payload,
media upload flow, `ApiError`/RFC 9457 problem+json, dan endpoint matrix pada
§8 semuanya cocok 1:1 dengan backend saat ini).

Bagian ini merangkum **temuan baru** hasil audit yang **tidak** ada pada versi
PRD sebelumnya, dan menjadi rujukan tambahan (bukan pengganti) bagi
section-section terkait di bawah. Setiap temuan sudah ditandai section mana
yang diperbarui.

## 0.1 Temuan yang mengonfirmasi PRD sudah benar (tidak berubah)

- Endpoint matrix §8 sudah cocok persis dengan
  `app/Modules/Merchant/Routes/api.php` pada `jualantar-api`.
- Resource shape (`ProductResource`, `ProductDetailResource`,
  `CatalogCategoryResource`, `ProductVariantResource`, `ProductMediaResource`,
  `ProductModifierGroupResource`, `ProductModifierResource`,
  `OutletProductAssignmentResource`) cocok persis dengan §6.
- Reorder payload key per resource (`product_id`, `category_id`,
  `variant_id`, `media_id`, `group_id`, `modifier_id`) cocok persis dengan §24
  dan §31 (Reorder Contract).
- Media upload flow tiga langkah (`upload-url` → `putToStorage` → register
  dengan `object_key`) cocok persis dengan §22, termasuk koreksi
  `MediaCreateInput` yang sudah benar diidentifikasi PRD sebelumnya.
- `app/lib/api.ts` di frontend **sudah** mengimplementasikan `ApiError` dan
  `normalizeApiError` yang membaca response error backend
  (`App\Shared\Http\ProblemDetails`, format RFC 9457 `application/problem+json`
  dengan field `type/title/status/detail/instance/code/errors/trace_id`)
  secara benar. Tidak perlu membuat ulang error handling, cukup dipakai.
  `putToStorage()` juga sudah tersedia dan sudah dipakai skenario upload di
  §40.

## 0.2 Temuan baru — wajib ditindaklanjuti

1. **Batas file media belum didokumentasikan** (lihat update §22 & §40.1).
   Backend membatasi mime type hanya `image/jpeg`, `image/png`, `image/webp`
   (`ProductMediaMimeType`), ukuran file default maksimum
   `STORAGE_UPLOAD_MAX_SIZE` = 5 MB, dan jumlah media per produk maksimum
   `STORAGE_PRODUCT_MEDIA_MAX` = 10 (lihat `config/storage.php`). PRD
   sebelumnya tidak menyebutkan angka-angka ini sama sekali.

2. **`MediaManager` saat ini tidak punya file picker sungguhan** (lihat update
   §40.1). `components/media-manager.tsx` dan
   `components/wizard/wizard-drafts.tsx` memanggil
   `pickMediaPlaceholder()` dari `catalog-mock.repository.ts`, yang hanya
   mengambil gambar acak dari `mediaPlaceholderPool` — **tidak ada** elemen
   `<input type="file">`, drag-drop, atau validasi mime/size di UI saat ini.
   Ini bukan sekadar "ganti data source": integrasi media memerlukan
   penambahan UI pemilihan file yang sebelumnya memang belum ada sama sekali.
   Ini adalah pengecualian eksplisit terhadap prinsip "Jangan Redesign" §5.1,
   sejalan dengan pengecualian "upload progress" yang memang sudah diizinkan
   di sana.

3. **Daftar file yang terdampak langsung pada §51 kurang lengkap.** Hasil
   `grep -rl "catalog-mock"` pada `app/modules/catalogs` menunjukkan file
   berikut **juga** meng-import `catalog-mock.repository.ts` secara langsung,
   di luar yang sudah tercatat di §51:
    - `components/product-card.tsx` — import type `ProductViewSummary`.
    - `components/product-list.tsx` — import type `ProductViewSummary`.
    - `components/wizard/wizard-drafts.tsx` — import `pickMediaPlaceholder`.
    - `index.ts` — komentar header yang secara eksplisit menyebut rencana
      penggantian `catalog-mock.repository` dengan `ApiCatalogRepository`
      ("Repository saat ini mock in-memory; integrasi API mengganti
      catalog-mock.repository dengan ApiCatalogRepository tanpa mengubah
      komponen."). Ini adalah bukti langsung dari kode bahwa arsitektur target
      PRD ini memang sudah direncanakan sejak awal oleh tim frontend.

    Lihat update §51 untuk daftar file lengkap yang sudah diverifikasi.

4. **Strategi `variant_count`/`min_price` pada `ProductViewSummary` belum
   dirinci** (koreksi kecil terhadap draf sebelumnya: tipe `ProductViewSummary`
   sendiri **sudah** didokumentasikan di §35, jadi bukan temuan baru dari sisi
   tipe). Yang belum dibahas: §36 "Product List Image Gap" hanya merinci
   strategi untuk `primary_media_url` (fallback ke placeholder). Dua field
   lain pada `ProductViewSummary` — `variant_count` dan `min_price` — sama
   sekali tidak dibahas strateginya, padahal keduanya juga tidak tersedia pada
   `ProductResource` list item (list Product tidak memuat variants sama
   sekali, dan `price` bernilai `null` untuk `product_type: "variable"`).
   Tanpa strategi eksplisit, implementer berisiko menambah N+1 request per
   baris produk hanya untuk menghitung ini. Lihat update §36 untuk keputusan
   yang direkomendasikan.

5. **Tidak semua endpoint Catalog memerlukan `merchant.owner`.** §2.1 dan §41
   menyatakan otorisasi Catalog "sebagian besar" owner-only tanpa merinci
   pengecualian. Hasil pembacaan `routes/api.php` menunjukkan route berikut
   berada di dalam middleware `merchant.context` tapi **di luar** middleware
   `merchant.owner`, sehingga bisa diakses non-owner (mis. `outlet_manager` /
   `outlet_staff`) selama context outlet-nya sesuai:
    - `POST /products/{product}/outlets/{outlet}/activate`
    - `POST /products/{product}/outlets/{outlet}/deactivate`
    - `POST /products/{product}/outlets/{outlet}/availability`
    - `GET /outlets/{outlet}/products` (effective outlet catalog)
    - `PUT /outlets/{outlet}/products/order`

    Seluruh endpoint Category/Product/Variant/Media/Modifier Group/Modifier
    CRUD serta assign/replace/remove outlet product **tetap** owner-only. Lihat
    update §41.

6. **Child list (`variants`, `media`, `outlet assignments`) dipaginasi
   backend, tapi UI existing mengonsumsi array polos.** `ProductVariantController`,
   `ProductMediaController`, dan `ProductOutletController` mengembalikan
   `{data, meta}` (default `per_page=15`, maksimum `100`). Sedangkan
   `catalog-mock.repository.ts` (`listVariants`, `listMedia`,
   `listAssignments`) dan komponen konsumennya (`VariantEditor`,
   `MediaManager`, `OutletAssignment`) semuanya mengharapkan **array polos**,
   bukan `PaginatedResponse`. Modifier Group/Modifier sudah konsisten array
   polos di kedua sisi, jadi tidak bermasalah. Lihat update §7 untuk keputusan
   yang direkomendasikan agar kontrak komponen existing tidak perlu berubah.

Detail teknis dan rekomendasi tindak lanjut dari tiap temuan disisipkan
langsung di section terkait di bawah, ditandai dengan blok **"Update hasil
audit codebase"**.

---

# 1. Tujuan

Dokumen ini menjadi source of truth untuk tahap integrasi Catalog API ke
frontend Merchant.

UI Catalog, component, route, form, dummy data, React Query query/mutation,
dan mock repository **sudah tersedia**. Tahap ini bukan pembuatan ulang UI.

Target utama:

```text
SEBELUM

Catalog UI
   ↓
TanStack Query
   ↓
catalog-mock.repository.ts
   ↓
catalog-mock-db.ts
   ↓
dummy data


SESUDAH

Catalog UI
   ↓
TanStack Query
   ↓
Catalog Repository
   ↓
catalog-api.repository.ts
   ↓
~/lib/api.ts
   ↓
jualantar-api
```

Integrasi harus membuat UI existing dapat menggunakan server data nyata dengan
perubahan seminimal mungkin pada component/page.

---

# 2. Source of Truth

## 2.1 Backend

Repository:

`https://github.com/Rumahkodingku/jualantar-api`

Backend Catalog API berada pada route group:

```text
/api/v1/merchant/catalog
```

dengan middleware:

```text
auth:sanctum
merchant.context
```

Management Catalog sebagian besar berada di bawah owner authorization.

> **Update hasil audit codebase:** Tepatnya, middleware `merchant.owner`
> membungkus seluruh route Category/Product/Variant/Media/Modifier
> Group/Modifier CRUD, reorder, activate/deactivate, dan
> assign/replace/remove outlet product. Lima route berikut **tidak**
> dibungkus `merchant.owner` (hanya `merchant.context`), sehingga non-owner
> dengan context outlet yang sesuai tetap bisa mengaksesnya:
> `products/{product}/outlets/{outlet}/activate`,
> `.../deactivate`, `.../availability`, `outlets/{outlet}/products` (GET), dan
> `outlets/{outlet}/products/order` (PUT). Lihat detail penuh di §41.

## 2.2 Frontend

Repository:

`https://github.com/Rumahkodingku/jualantar-merchant`

Frontend Catalog berada pada:

```text
app/modules/catalogs/
```

Struktur saat ini:

```text
app/modules/catalogs/
├── components/
├── data/
├── pages/
├── routes/
├── schemas/
├── services/
├── types/
├── utils/
└── index.ts
```

Route existing:

```text
/catalogs
/catalogs/categories
/catalogs/modifiers
/catalogs/new
/catalogs/products/:productId
/catalogs/products/:productId/edit
```

---

# 3. Teknologi dan Conventions Frontend

Frontend repository menggunakan:

- React 19;
- React Router 7.15.1 framework mode / SSR;
- TypeScript;
- Tailwind CSS v4;
- shadcn/ui;
- TanStack Query;
- Axios;
- React Hook Form;
- Zod;
- Zustand;
- `@dnd-kit`.

Package manager:

```text
bun
```

Verification:

```bash
bun run typecheck
bun run test:run
```

Formatting:

```bash
bun run format
```

Alias:

```text
~/* → app/*
```

API call wajib melalui:

```text
app/lib/api.ts
```

Jangan membuat Axios instance baru untuk Catalog.

Components tidak boleh melakukan HTTP request langsung.

---

# 4. Kondisi Existing Catalog Frontend

Current Catalog sudah mempunyai:

```text
components/
├── catalog-empty-state.tsx
├── catalog-layout.tsx
├── list-skeleton.tsx
├── media-manager.tsx
├── modifier-editor.tsx
├── outlet-assignment.tsx
├── product-actions-menu.tsx
├── product-card.tsx
├── product-filters.tsx
├── product-list.tsx
├── review-section.tsx
├── status-badge.tsx
├── variant-editor.tsx
└── wizard/
```

Pages:

```text
catalogs-page.tsx
categories-page.tsx
modifiers-page.tsx
product-detail-page.tsx
product-edit-page.tsx
product-new-page.tsx
```

Services:

```text
catalog.keys.ts
catalog.queries.ts
catalog.mutations.ts
catalog-mock-db.ts
catalog-mock.repository.ts
```

Current Query/Mutation layer sudah menggunakan TanStack Query dan perlu
dipindahkan dari concrete mock repository ke API repository.

---

# 5. Prinsip Integrasi

## 5.1 Jangan Redesign

Tidak termasuk:

- perubahan visual besar;
- perubahan user journey;
- perubahan route;
- perubahan domain Catalog;
- penambahan feature Catalog baru.

Perubahan UI hanya dilakukan apabila dibutuhkan untuk:

- loading;
- pending;
- error;
- validation;
- retry;
- upload progress;
- partial failure;
- empty state dari server.

## 5.2 Backend sebagai Authority

Backend menentukan:

- validasi final;
- resource shape;
- status;
- authorization;
- uniqueness;
- resource ownership;
- accepted enum/value.

Frontend melakukan client validation untuk UX, tetapi backend tetap authoritative.

## 5.3 Repository Boundary

Components/pages tidak boleh mengetahui apakah data berasal dari mock atau API.

Target:

```text
CatalogRepository
├── MockCatalogRepository
└── ApiCatalogRepository
```

Query dan mutation hanya berinteraksi dengan interface repository.

---

# 6. Domain Resource Contract

Domain object frontend harus mengikuti JSON resource backend.

## 6.1 Product

```ts
interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  product_type: "simple" | "variable"
  price: number | null
  status: "active" | "inactive"
  display_order: number
  created_at: string | null
  updated_at: string | null
}
```

## 6.2 Product Detail

```ts
interface ProductDetail extends Product {
  category?: CatalogCategory
  variants?: ProductVariant[]
  media?: ProductMedia[]
  modifier_groups?: ProductModifierGroup[]
}
```

## 6.3 Category

```ts
interface CatalogCategory {
  id: string
  name: string
  description: string | null
  status: "active" | "inactive"
  display_order: number
  created_at: string | null
  updated_at: string | null
}
```

## 6.4 Variant

```ts
interface ProductVariant {
  id: string
  name: string
  sku: string | null
  price: number
  status: "active" | "inactive"
  is_default: boolean
  display_order: number
  created_at: string | null
  updated_at: string | null
}
```

## 6.5 Media

```ts
interface ProductMedia {
  id: string
  url: string | null
  alt_text: string | null
  mime_type: string
  file_size: number | null
  is_primary: boolean
  display_order: number
  created_at: string | null
  updated_at: string | null
}
```

## 6.6 Modifier Group

```ts
interface ProductModifierGroup {
  id: string
  name: string
  description: string | null
  selection_type: "single" | "multiple"
  min_selection: number
  max_selection: number | null
  is_required: boolean
  status: "active" | "inactive"
  display_order: number
  created_at: string | null
  updated_at: string | null
  modifiers: ProductModifier[]
}
```

## 6.7 Modifier

```ts
interface ProductModifier {
  id: string
  name: string
  description: string | null
  price: number
  is_default: boolean
  status: "active" | "inactive"
  display_order: number
  created_at: string | null
  updated_at: string | null
}
```

## 6.8 Outlet Product Assignment

```ts
interface OutletProductAssignment {
  id: string
  product_id: string
  outlet_id: string
  outlet?: {
    id: string
    name: string
    status: string
  }
  status: "active" | "inactive"
  availability_status: "available" | "unavailable"
  unavailable_reason: string | null
  display_order: number
  created_at: string | null
  updated_at: string | null
}
```

Jangan menggabungkan:

```text
status
availability_status
```

karena keduanya merepresentasikan state berbeda.

---

# 7. Pagination Contract

Paginated endpoints menggunakan:

```ts
interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
```

Frontend tidak boleh mengasumsikan list response sebagai array mentah.

Product/category/variant/media/outlet assignment adalah endpoint yang dapat
dipaginate.

Modifier Group dan Modifier list endpoint saat ini mengembalikan collection
non-paginated.

> **Update hasil audit codebase:** Product dan Category list dikonsumsi UI
> sebagai `PaginatedResponse` (sudah konsisten dengan mock maupun backend,
> tidak perlu perubahan kontrak). Namun untuk **child list produk** —
> `variants`, `media`, dan `outlet assignments` — backend memaginasi
> (`per_page` default 15, maksimum 100 lewat query `per_page`), sedangkan
> `catalog-mock.repository.ts` (`listVariants`, `listMedia`,
> `listAssignments`) dan komponen konsumennya (`VariantEditor`,
> `MediaManager`, `OutletAssignment`) semuanya mengharapkan **array polos**,
> bukan `PaginatedResponse`. Modifier Group/Modifier sudah konsisten array
> polos di kedua sisi sehingga tidak ada masalah di situ.
>
> Agar kontrak komponen existing tidak perlu diubah (sesuai §5.3 Repository
> Boundary), `ApiCatalogRepository` untuk `variants.list`, `media.list`, dan
> `productOutlets.list` **wajib**:
>
> - meminta `per_page` besar (mis. 100, batas maksimum backend) dalam satu
>   request agar tidak silent-truncate pada produk dengan banyak
>   variant/media/outlet, atau melakukan loop halaman sampai
>   `meta.last_page` tercapai bila jumlahnya bisa melebihi 100; dan
> - mengembalikan hanya `response.data` (array) ke pemanggil, menyembunyikan
>   `meta` dari komponen yang memang belum didesain untuk pagination pada
>   level child resource ini.
>
> Tambahkan acceptance criterion: **produk dengan variant/media/outlet lebih
> dari satu halaman default tidak boleh terpotong diam-diam** (lihat update
> §54).

---

# 8. API Endpoint Matrix

## 8.1 Category

| Operation  | Method | Endpoint                                             | Response         |
| ---------- | ------ | ---------------------------------------------------- | ---------------- |
| List       | GET    | `/merchant/catalog/categories`                       | `data + meta`    |
| Create     | POST   | `/merchant/catalog/categories`                       | `data: Category` |
| Detail     | GET    | `/merchant/catalog/categories/{category}`            | `data: Category` |
| Update     | PATCH  | `/merchant/catalog/categories/{category}`            | `data: Category` |
| Delete     | DELETE | `/merchant/catalog/categories/{category}`            | `204`            |
| Activate   | POST   | `/merchant/catalog/categories/{category}/activate`   | `data: Category` |
| Deactivate | POST   | `/merchant/catalog/categories/{category}/deactivate` | `data: Category` |
| Reorder    | PUT    | `/merchant/catalog/categories/order`                 | `204`            |

## 8.2 Product

| Operation  | Method | Endpoint                                          | Response              |
| ---------- | ------ | ------------------------------------------------- | --------------------- |
| List       | GET    | `/merchant/catalog/products`                      | `data + meta`         |
| Create     | POST   | `/merchant/catalog/products`                      | `data: Product`       |
| Detail     | GET    | `/merchant/catalog/products/{product}`            | `data: ProductDetail` |
| Update     | PATCH  | `/merchant/catalog/products/{product}`            | `data: Product`       |
| Delete     | DELETE | `/merchant/catalog/products/{product}`            | `204`                 |
| Activate   | POST   | `/merchant/catalog/products/{product}/activate`   | `data: Product`       |
| Deactivate | POST   | `/merchant/catalog/products/{product}/deactivate` | `data: Product`       |
| Reorder    | PUT    | `/merchant/catalog/products/order`                | `204`                 |

## 8.3 Variant

| Operation  | Method | Endpoint                                                             |
| ---------- | ------ | -------------------------------------------------------------------- |
| List       | GET    | `/merchant/catalog/products/{product}/variants`                      |
| Create     | POST   | `/merchant/catalog/products/{product}/variants`                      |
| Detail     | GET    | `/merchant/catalog/products/{product}/variants/{variant}`            |
| Update     | PATCH  | `/merchant/catalog/products/{product}/variants/{variant}`            |
| Delete     | DELETE | `/merchant/catalog/products/{product}/variants/{variant}`            |
| Activate   | POST   | `/merchant/catalog/products/{product}/variants/{variant}/activate`   |
| Deactivate | POST   | `/merchant/catalog/products/{product}/variants/{variant}/deactivate` |
| Reorder    | PUT    | `/merchant/catalog/products/{product}/variants/order`                |

## 8.4 Media

| Operation   | Method | Endpoint                                                     |
| ----------- | ------ | ------------------------------------------------------------ |
| List        | GET    | `/merchant/catalog/products/{product}/media`                 |
| Upload URL  | POST   | `/merchant/catalog/products/{product}/media/upload-url`      |
| Register    | POST   | `/merchant/catalog/products/{product}/media`                 |
| Detail      | GET    | `/merchant/catalog/products/{product}/media/{media}`         |
| Delete      | DELETE | `/merchant/catalog/products/{product}/media/{media}`         |
| Set Primary | POST   | `/merchant/catalog/products/{product}/media/{media}/primary` |
| Reorder     | PUT    | `/merchant/catalog/products/{product}/media/order`           |

## 8.5 Modifier Group

| Operation  | Method | Endpoint                                                                  |
| ---------- | ------ | ------------------------------------------------------------------------- |
| List       | GET    | `/merchant/catalog/products/{product}/modifier-groups`                    |
| Create     | POST   | `/merchant/catalog/products/{product}/modifier-groups`                    |
| Detail     | GET    | `/merchant/catalog/products/{product}/modifier-groups/{group}`            |
| Update     | PATCH  | `/merchant/catalog/products/{product}/modifier-groups/{group}`            |
| Delete     | DELETE | `/merchant/catalog/products/{product}/modifier-groups/{group}`            |
| Activate   | POST   | `/merchant/catalog/products/{product}/modifier-groups/{group}/activate`   |
| Deactivate | POST   | `/merchant/catalog/products/{product}/modifier-groups/{group}/deactivate` |
| Reorder    | PUT    | `/merchant/catalog/products/{product}/modifier-groups/order`              |

## 8.6 Modifier

| Operation  | Method | Endpoint                                                                                       |
| ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| List       | GET    | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers`                       |
| Create     | POST   | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers`                       |
| Detail     | GET    | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers/{modifier}`            |
| Update     | PATCH  | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers/{modifier}`            |
| Delete     | DELETE | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers/{modifier}`            |
| Activate   | POST   | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers/{modifier}/activate`   |
| Deactivate | POST   | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers/{modifier}/deactivate` |
| Reorder    | PUT    | `/merchant/catalog/products/{product}/modifier-groups/{group}/modifiers/order`                 |

## 8.7 Product Outlet Assignment

| Operation    | Method | Endpoint                                                             |
| ------------ | ------ | -------------------------------------------------------------------- |
| List         | GET    | `/merchant/catalog/products/{product}/outlets`                       |
| Assign       | POST   | `/merchant/catalog/products/{product}/outlets`                       |
| Replace      | PUT    | `/merchant/catalog/products/{product}/outlets`                       |
| Remove       | DELETE | `/merchant/catalog/products/{product}/outlets/{outlet}`              |
| Activate     | POST   | `/merchant/catalog/products/{product}/outlets/{outlet}/activate`     |
| Deactivate   | POST   | `/merchant/catalog/products/{product}/outlets/{outlet}/deactivate`   |
| Availability | POST   | `/merchant/catalog/products/{product}/outlets/{outlet}/availability` |

---

# 9. Product Query Integration

Current:

```ts
useProducts(params)
```

sudah benar secara arsitektur.

Ganti sumber:

```text
catalog-mock.repository
```

menjadi:

```text
catalog-api.repository
```

Request:

```ts
api.get("/merchant/catalog/products", {
  params,
})
```

Parameter harus langsung mengikuti backend:

```text
search
category_id
status
product_type
sort
order
per_page
page
```

Allowed `sort`:

```text
name
display_order
created_at
```

Allowed `order`:

```text
asc
desc
```

`keepPreviousData` tetap dipertahankan pada paginated product list.

---

# 10. Category Query Integration

Current:

```ts
useCategories(params)
```

diteruskan ke:

```http
GET /merchant/catalog/categories
```

Query:

```text
search
status
sort
order
per_page
page
```

Allowed sort:

```text
name
display_order
created_at
```

---

# 11. Product Detail Integration

Current:

```ts
useProductDetail(productId)
```

menggunakan:

```http
GET /merchant/catalog/products/{product}
```

Backend detail sudah memuat:

```text
category
variants
media
modifier_groups
  └── modifiers
```

Jangan membuat 4 request terpisah hanya untuk initial Product Detail apabila
resource detail sudah menyediakan data tersebut.

Dedicated child request dipakai untuk operation khusus atau kebutuhan list/filter.

---

# 12. Product Create Integration

Backend create:

```http
POST /merchant/catalog/products
```

## 12.1 Simple

Payload:

```json
{
    "name": "Ayam Geprek",
    "category_id": "<uuid>",
    "description": "Ayam goreng crispy.",
    "product_type": "simple",
    "price": 18000
}
```

## 12.2 Variable

Payload:

```json
{
    "name": "Nasi Goreng Spesial",
    "category_id": "<uuid>",
    "description": "Nasi goreng.",
    "product_type": "variable"
}
```

Jangan kirim:

```text
price
```

untuk variable product.

Jangan kirim:

```text
status
```

pada create.

---

# 13. Product Update Integration

Endpoint:

```http
PATCH /merchant/catalog/products/{product}
```

Field yang boleh di-update:

```text
name
category_id
description
display_order
price (untuk simple)
```

`product_type` tidak boleh diubah.

`status` tidak boleh diubah lewat PATCH.

Gunakan:

```text
POST .../activate
POST .../deactivate
```

untuk status.

UI Edit Product tidak boleh menyediakan selector untuk mengubah:

```text
simple ↔ variable
```

---

# 14. Product Status Integration

Current:

```ts
useSetProductStatus(productId)
```

harus tetap memetakan:

```text
active
→ POST /products/{product}/activate

inactive
→ POST /products/{product}/deactivate
```

Jangan menggunakan PATCH status.

---

# 15. Product Delete

Endpoint:

```http
DELETE /merchant/catalog/products/{product}
```

Success:

```text
204 No Content
```

Setelah sukses:

```text
invalidate products
invalidate product detail jika diperlukan
```

---

# 16. Product Reorder

Backend request:

```json
{
    "items": [
        {
            "product_id": "<uuid>",
            "display_order": 0
        }
    ]
}
```

Current generic frontend:

```ts
ReorderItem {
  id,
  display_order
}
```

tidak dapat langsung dipakai sebagai API request.

Gunakan mapper:

```ts
toProductReorderPayload()
```

yang menghasilkan:

```text
product_id
display_order
```

---

# 17. Category Integration

Create:

```json
{
    "name": "Makanan",
    "description": "Menu makanan utama."
}
```

Jangan mengirim `status`.

Update bersifat partial.

Category status menggunakan endpoint:

```text
activate
deactivate
```

Category reorder:

```json
{
    "items": [
        {
            "category_id": "<uuid>",
            "display_order": 0
        }
    ]
}
```

Category name memiliki uniqueness rule dari backend.

---

# 18. Variant Integration

## Create

```json
{
    "name": "Regular",
    "sku": "REG-001",
    "price": 15000,
    "is_default": true
}
```

Jangan kirim `status`.

## Update

Partial:

```text
name?
sku?
price?
is_default?
display_order?
```

## Status

Gunakan activate/deactivate endpoint.

## Reorder

Request:

```json
{
    "items": [
        {
            "variant_id": "<uuid>",
            "display_order": 0
        }
    ]
}
```

SKU uniqueness tetap ditentukan server.

---

# 19. Modifier Group Integration

Modifier Group bersifat **product-scoped**.

Hierarchy:

```text
Product
└── Modifier Group
    └── Modifier
```

Create:

```json
{
    "name": "Pilihan Sambal",
    "description": "Pilih sambal.",
    "selection_type": "single",
    "min_selection": 1,
    "max_selection": 1,
    "is_required": true
}
```

Tidak mengirim `status`.

Group status menggunakan endpoint activate/deactivate.

Group reorder menggunakan:

```json
{
    "items": [
        {
            "group_id": "<uuid>",
            "display_order": 0
        }
    ]
}
```

---

# 20. Modifier Integration

Create:

```json
{
    "name": "Sambal Mata",
    "description": "Sambal matah.",
    "price": 2000,
    "is_default": false
}
```

Tidak mengirim `status`.

Modifier update tidak boleh mengirim:

```text
modifier_group_id
```

Modifier tidak dapat dipindahkan ke group lain melalui API.

Reorder:

```json
{
    "items": [
        {
            "modifier_id": "<uuid>",
            "display_order": 0
        }
    ]
}
```

---

# 21. Important Modifier Page Rule

Frontend memiliki route:

```text
/catalogs/modifiers
```

Namun backend tidak menyediakan global:

```text
GET /merchant/catalog/modifier-groups
```

atau:

```text
GET /merchant/catalog/modifiers
```

yang berdiri sendiri.

API modifier tetap product-scoped.

Maka integration **tidak boleh menciptakan global API assumption**.

`/catalogs/modifiers` harus tetap menjadi UX view yang memilih/menampilkan data
dari product-scoped modifier API.

Tidak boleh mengubah backend untuk kebutuhan ini pada scope integrasi.

---

# 22. Media Integration

Media memiliki flow khusus.

## Step 1 — Request Upload URL

```http
POST /merchant/catalog/products/{product}/media/upload-url
```

Payload:

```json
{
    "file_name": "ayam-geprek.jpg",
    "mime_type": "image/jpeg",
    "file_size": 245760
}
```

Response:

```json
{
    "data": {
        "object_key": "...",
        "upload_url": "...",
        "headers": {},
        "expires_at": "..."
    }
}
```

## Step 2 — Upload Binary

Gunakan existing:

```ts
putToStorage(uploadUrl, file, {
  headers,
  onProgress,
  signal,
})
```

Jangan mengirim binary ke Catalog API.

## Step 3 — Register Media

```http
POST /merchant/catalog/products/{product}/media
```

Payload:

```json
{
    "object_key": "...",
    "is_primary": true,
    "alt_text": "Ayam Geprek",
    "display_order": 0
}
```

### Important frontend correction

Current frontend `MediaCreateInput` masih menggunakan:

```text
url
mime_type
file_size
```

sebagai create payload.

Itu **tidak boleh langsung diteruskan** ke API register media.

Buat request type terpisah:

```ts
interface MediaUploadUrlInput {
  file_name: string
  mime_type: string
  file_size: number
}

interface MediaRegisterInput {
  object_key: string
  is_primary?: boolean
  alt_text?: string | null
  display_order?: number
}
```

---

# 23. Media Response

Backend media resource mengembalikan:

```text
url
alt_text
mime_type
file_size
is_primary
display_order
```

`url` dihasilkan backend melalui storage abstraction dan dapat bersifat
temporary.

Frontend jangan menyimpan hasil upload URL sebagai permanent media URL.

---

# 24. Media Reorder

Request:

```json
{
    "items": [
        {
            "media_id": "<uuid>",
            "display_order": 0
        }
    ]
}
```

Gunakan resource-specific request mapper.

---

# 25. Product Outlet Assignment

## List

```http
GET /merchant/catalog/products/{product}/outlets
```

Query:

```text
status
availability
sort
order
per_page
page
```

## Replace — Recommended for Wizard

Wizard final outlet state:

```http
PUT /merchant/catalog/products/{product}/outlets
```

Payload:

```json
{
    "outlet_ids": ["<uuid-1>", "<uuid-2>"]
}
```

Empty array diperbolehkan:

```json
{
    "outlet_ids": []
}
```

untuk detach semua outlet.

## Assign

```http
POST /merchant/catalog/products/{product}/outlets
```

minimal satu outlet.

---

# 26. Outlet Availability

Endpoint:

```http
POST /merchant/catalog/products/{product}/outlets/{outlet}/availability
```

Available:

```json
{
    "status": "available"
}
```

Unavailable:

```json
{
    "status": "unavailable",
    "reason": "Stok habis"
}
```

Ketika status `available`, jangan mengirim `reason`.

---

# 27. Outlet Master Data

Catalog API tidak menyediakan endpoint khusus untuk list master outlets.

Frontend saat ini mempunyai dummy outlet dan module `merchant-operations`
memiliki outlet management.

Integrasi Catalog harus menggunakan outlet source yang sudah tersedia di
merchant operations/application, bukan menciptakan:

```text /merchant/catalog/outlets

```

secara fiktif.

Catalog hanya mengelola assignment terhadap outlet yang sudah ada.

---

# 28. Add Product Wizard Integration

Existing wizard:

```text
1. Informasi
2. Harga / Variant
3. Customization
4. Media
5. Outlet
6. Review
```

Urutan UX dipertahankan.

Tetapi persistence server harus mengikuti dependency backend.

## Step 1

Create Product:

```text
POST /merchant/catalog/products
```

Simpan:

```text
product.id
```

Sebagai server-side identity.

## Step 2

Jika variable:

```text
POST /products/{product}/variants
```

Bisa dilakukan berkali-kali.

Simple:

```text
tidak membuat variant
```

## Step 3

Untuk setiap modifier group:

```text
POST /products/{product}/modifier-groups
```

Ambil:

```text
group.id
```

Kemudian:

```text
POST /products/{product}/modifier-groups/{group}/modifiers
```

## Step 4

Media upload flow:

```text
upload-url
→ putToStorage
→ register media
```

## Step 5

Simpan outlet state dengan:

```text
PUT /products/{product}/outlets
```

## Step 6

Review server-backed state.

---

# 29. Current `useCreateProductBundle()`

Current mutation sudah memiliki urutan:

```text
product
→ variants
→ modifier groups
→ modifiers
→ media
→ outlets
```

Urutan tersebut dipertahankan.

Namun repository di belakang mutation berubah menjadi API repository.

Tidak ada backend transaction yang membungkus seluruh bundle.

Karena itu partial failure harus ditangani.

---

# 30. Partial Failure Strategy

Contoh:

```text
Product      SUCCESS
Variants     SUCCESS
Modifiers    SUCCESS
Media        FAILED
```

Jangan mengulangi seluruh bundle secara otomatis.

Risiko:

```text
duplicate product
duplicate variants
duplicate modifiers
```

Expected:

1. simpan `productId`;
2. tandai step gagal;
3. tampilkan error;
4. user dapat retry step yang gagal;
5. user dapat membuka Product Detail;
6. operasi yang sudah sukses tidak dibuat ulang.

---

# 31. Draft State

Wizard memiliki dua jenis state:

```text
Draft form state
```

dan:

```text
Persisted server state
```

Contoh:

```text
Step 1
form draft
   ↓
POST product
   ↓
productId persisted
```

Setelah product dibuat, jangan membuat fake ID baru.

---

# 32. Product Edit Integration

Route:

```text
/catalogs/products/:productId/edit
```

Flow:

```text
GET ProductDetail
      ↓
populate form
      ↓
PATCH Product
```

Child resource tetap dikelola melalui endpoint masing-masing.

Jangan mengirim:

```text
variants[]
media[]
modifier_groups[]
outlets[]
```

di dalam Product PATCH karena backend tidak mendefinisikan giant update payload
tersebut.

---

# 33. Query Key Strategy

Pertahankan query keys saat ini:

```text
catalogs
catalogs/products
catalogs/products/list/{params}
catalogs/product/{id}
catalogs/product/{id}/assignments
catalogs/categories
catalogs/categories/list/{params}
catalogs/category/{id}
catalogs/outlets
```

Tambahkan child keys hanya bila dedicated child queries memang digunakan.

Recommended:

```text
catalogs/product/{productId}/variants
catalogs/product/{productId}/media
catalogs/product/{productId}/modifier-groups
catalogs/product/{productId}/modifier-groups/{groupId}/modifiers
```

Jangan membuat global modifier key.

---

# 34. Cache Invalidation

## Product mutation

Invalidate:

```text
catalogKeys.products()
catalogKeys.product(productId)
```

## Category mutation

Invalidate:

```text
catalogKeys.categories()
catalogKeys.category(categoryId)
```

## Variant/media/modifier/outlet mutation

Minimum:

```text
catalogKeys.product(productId)
```

Dedicated child queries juga di-invalidate apabila digunakan oleh UI.

---

# 35. Existing `ProductViewSummary`

Frontend memiliki derived type:

```ts
interface ProductViewSummary {
  primary_media_url: string | null
  variant_count: number
  min_price: number | null
}
```

Ini bukan field Product API.

Tetap sebagai derived presentation data.

Jangan menambahkan:

```text
primary_media_url
variant_count
min_price
```

ke `Product` resource interface.

---

# 36. Product List Image Gap

Backend ProductResource tidak membawa media URL.

Backend media baru tersedia pada ProductDetailResource/media endpoint.

UI existing ProductCard menampilkan gambar.

Integration **tidak boleh membuat N+1 request tanpa kontrol** hanya untuk gambar
product list.

Strategi phase pertama:

```text
Product List
   ↓
ProductResource
   ↓
primary image unavailable
   ↓
placeholder
```

Product Detail:

```text
ProductDetailResource
   ↓
media.url
```

Apabila kemudian diperlukan image hydration khusus untuk list, harus dibuat
sebagai separate performance-reviewed change; jangan mengubah backend contract
ProductResource pada scope ini.

> **Update hasil audit codebase — `variant_count` dan `min_price`:** Field
> ini pada `ProductViewSummary` (§35) punya gap yang sama dengan
> `primary_media_url`, dan tidak dibahas pada draf sebelumnya. `ProductResource`
> list item tidak memuat variants sama sekali, dan `price` bernilai `null`
> untuk produk `variable`. Rekomendasi agar tidak membuat N+1 request per
> baris pada Product List:
>
> - **`variant_count`**: tampilkan hanya jika data sudah tersedia (mis. dari
>   cache Product Detail yang sudah pernah di-fetch di sesi yang sama);
>   selebihnya sembunyikan badge jumlah varian pada list view, atau tampilkan
>   generik ("Varian tersedia") tanpa angka pasti. Jangan fetch detail per
>   produk hanya untuk angka ini.
> - **`min_price`**: untuk `product_type: "simple"`, `price` sudah tersedia
>   langsung dari `ProductResource.price` — tidak ada gap. Untuk
>   `product_type: "variable"`, tampilkan label netral (mis. "Lihat varian")
>   alih-alih "mulai dari Rp…" pada list view, karena harga minimum varian
>   memerlukan detail request per produk.
> - Redefinisikan `ProductViewSummary` agar field derived ini eksplisit
>   `optional`/nullable dan hanya diisi dari data yang sudah ada di tangan
>   (list response atau cache), bukan hasil agregasi sisi client yang memaksa
>   N+1. Jika product owner butuh angka ini akurat pada list view, catat
>   sebagai kebutuhan terpisah di luar scope integrasi ini (konsisten dengan
>   §49 No Backend Changes).

---

# 37. Backend Validation Mapping

`app/lib/api.ts` sudah mempunyai:

```text
ApiError
```

dengan kategori:

```text
validation
unauthenticated
forbidden
not_found
conflict
rate_limited
network
server
unknown
```

Gunakan `ApiError.fieldErrors()` untuk form server validation.

Jangan mengubah seluruh 422 menjadi generic toast.

---

# 38. Error UX

## 422

Field-level:

```text
Nama product sudah digunakan.
SKU sudah digunakan.
```

## 401

Gunakan existing Axios interceptor.

Jangan membuat auth recovery baru.

## 403

Tampilkan:

```text
Anda tidak memiliki akses untuk melakukan tindakan ini.
```

## 404

Detail:

```text
Produk tidak ditemukan.
```

## 409

Tampilkan server detail/conflict.

## Network

Gunakan message:

```text
Periksa koneksi internet Anda lalu coba lagi.
Perubahan belum tersimpan.
```

## 5xx

Generic recoverable error:

```text
Terjadi kesalahan pada server. Coba lagi.
```

---

# 39. Loading UX

Existing:

```text
ListSkeleton
```

dipakai untuk:

- Product list;
- Category list;
- Product detail;
- Variant section;
- Modifier section;
- Outlet section;
- wizard data loading.

Mutation button harus menunjukkan pending state.

Contoh:

```text
Menyimpan…
```

Button disabled selama request berjalan untuk mencegah double submit.

---

# 40. Upload UX

Media upload harus mempunyai:

```text
idle
uploading
registering
success
failed
```

Progress berasal dari:

```ts
putToStorage(... onProgress)
```

Jika storage upload berhasil tetapi register API gagal:

```text
jangan menampilkan media sebagai persisted
```

User harus dapat retry register/cleanup sesuai implementation.

---

## 40.1 Update hasil audit codebase — File Picker Belum Ada

`components/media-manager.tsx` dan `components/wizard/wizard-drafts.tsx` saat
ini **tidak memiliki elemen pemilihan file sama sekali**. Tombol "tambah
foto"/"tambah media" pada kedua file tersebut memanggil
`pickMediaPlaceholder()` dari `catalog-mock.repository.ts`, yang hanya
mengambil satu entri acak dari `mediaPlaceholderPool` (data dummy statis) dan
langsung men-dispatch mutation dengan `url` palsu. Tidak ada:

- elemen `<input type="file">` atau drop-zone;
- validasi mime type di sisi client;
- validasi ukuran file di sisi client;
- pembacaan `File`/`Blob` untuk dikirim ke `putToStorage`.

Ini berarti pekerjaan integrasi media **bukan sekadar mengganti pemanggilan
repository**, melainkan juga menambahkan interaksi UI baru yang sebelumnya
memang belum pernah dibangun. Ini adalah pengecualian eksplisit yang diizinkan
oleh §5.1 (upload progress termasuk kategori yang boleh diubah), diperluas
mencakup penambahan kontrol pemilihan file itu sendiri karena tanpa itu, flow
upload tidak mungkin berjalan dengan file sungguhan.

Validasi client-side wajib mengikuti batas backend (`config/storage.php` dan
`ProductMediaMimeType`), supaya kegagalan tervalidasi lebih awal sebelum
memanggil `upload-url`:

| Batas                   | Nilai                                    | Sumber                 |
| ----------------------- | ---------------------------------------- | ---------------------- |
| Mime type diterima      | `image/jpeg`, `image/png`, `image/webp`  | `ProductMediaMimeType` |
| Ukuran file maksimum    | `STORAGE_UPLOAD_MAX_SIZE` (default 5 MB) | `config/storage.php`   |
| Jumlah media per produk | `STORAGE_PRODUCT_MEDIA_MAX` (default 10) | `config/storage.php`   |

Rekomendasi UI:

- `accept="image/jpeg,image/png,image/webp"` pada `<input type="file">`.
- Tolak file di client sebelum memanggil `upload-url` jika mime/size di luar
  batas di atas, dengan pesan error yang jelas (server tetap menjadi
  authority final sesuai §5.2, tapi validasi client mencegah round-trip yang
  pasti gagal).
- Nonaktifkan tombol "tambah media" ketika jumlah media produk sudah
  mencapai batas maksimum, atau tampilkan pesan saat batas tercapai.
- `wizard-drafts.tsx` (media step pada wizard Add Product) memerlukan
  perubahan yang sama, karena saat ini juga memakai `pickMediaPlaceholder()`
  untuk mengisi draft media sebelum produk dibuat. Karena endpoint media
  selalu ter-nest di bawah `/products/{product}/media`, file yang dipilih
  pada wizard **belum bisa diupload** sebelum Step 1 (create product)
  selesai — draft wizard cukup menyimpan referensi `File` di memori
  (state), lalu jalankan upload-url → putToStorage → register secara
  berurutan setelah `product.id` tersedia, konsisten dengan "Sequential
  child persistence" pada §50 Phase 6.

---

# 41. Authorization

Catalog API memakai merchant context.

Frontend:

- tidak mengirim `merchant_id` ke payload;
- tidak membuat merchant context sendiri;
- tidak bypass backend authorization;
- menggunakan auth token dari existing `~/lib/api.ts`;
- menghormati 403.

Role/capability UI harus menggunakan authorization mechanism aplikasi yang
sudah ada apabila tersedia.

> **Update hasil audit codebase — batas `merchant.owner`:** Hasil pembacaan
> `app/Modules/Merchant/Routes/api.php` menunjukkan tidak seluruh endpoint
> Catalog memerlukan role owner. Middleware `merchant.owner` membungkus
> seluruh route berikut (owner-only, akan 403 untuk non-owner):
>
> - Category: list/create/detail/update/delete/activate/deactivate/reorder.
> - Product: list/create/detail/update/delete/activate/deactivate/reorder.
> - Variant, Media, Modifier Group, Modifier: seluruh operasi (CRUD, reorder,
>   activate/deactivate, upload-url, register).
> - Outlet product assignment: list, assign (`POST`), replace (`PUT`),
>   remove (`DELETE`).
>
> Lima route berikut **hanya** memerlukan `merchant.context` (bukan
> `merchant.owner`), sehingga tetap bisa diakses user non-owner (mis.
> `outlet_manager`/`outlet_staff`) selama context outlet-nya sesuai:
>
> | Method | Endpoint                                            | Aksi                             |
> | ------ | --------------------------------------------------- | -------------------------------- |
> | POST   | `/products/{product}/outlets/{outlet}/activate`     | Aktifkan assignment              |
> | POST   | `/products/{product}/outlets/{outlet}/deactivate`   | Nonaktifkan assignment           |
> | POST   | `/products/{product}/outlets/{outlet}/availability` | Ubah `availability_status`       |
> | GET    | `/outlets/{outlet}/products`                        | Effective outlet catalog (§48)   |
> | PUT    | `/outlets/{outlet}/products/order`                  | Reorder effective outlet catalog |
>
> Implikasi untuk frontend: jika Merchant App juga dipakai oleh user
> non-owner (outlet manager/staff), jangan menyembunyikan/menonaktifkan
> kelima kontrol di atas secara blanket hanya karena user bukan owner — hanya
> kontrol CRUD Category/Product/Variant/Media/Modifier/assign-outlet yang
> memang perlu digating owner-only di level UI (opsional, karena 403 dari
> backend tetap menjadi authority final sesuai §5.2). Sebaliknya, tombol
> toggle status/availability produk per outlet dan effective outlet catalog
> boleh tetap aktif untuk non-owner.

---

# 42. Request Type Architecture

Jangan gunakan satu interface untuk read dan write.

Contoh:

```text
Product
ProductCreateInput
ProductUpdateInput
```

Media:

```text
ProductMedia
MediaUploadUrlInput
MediaRegisterInput
```

Reorder:

```text
ProductReorderRequest
CategoryReorderRequest
VariantReorderRequest
MediaReorderRequest
ModifierGroupReorderRequest
ModifierReorderRequest
```

Ini menghindari request payload yang salah akibat generic type.

---

# 43. Reorder Request Mapping

Backend menggunakan identifier berbeda.

```text
Product         → product_id
Category        → category_id
Variant         → variant_id
Media           → media_id
Modifier Group  → group_id
Modifier        → modifier_id
Outlet Catalog  → product_id
```

Buat mapper eksplisit.

Jangan mengirim generic:

```json
{
    "id": "..."
}
```

ke backend.

---

# 44. Existing Frontend Type Correction

Current `catalog.types.ts` sudah sangat dekat dengan backend.

Perubahan wajib:

### Keep

```text
Product
ProductDetail
CatalogCategory
ProductVariant
ProductMedia
ProductModifierGroup
ProductModifier
OutletProductAssignment
```

### Refine request types

Pisahkan:

```text
MediaCreateInput
```

menjadi upload URL + register request.

Pisahkan generic reorder input dari backend request payload.

Tambahkan dedicated child query types jika digunakan.

Jangan mengubah resource field names dari snake_case menjadi presentation
field names pada domain layer.

---

# 45. API Repository Implementation

Recommended:

```text
app/modules/catalogs/services/
├── catalog.repository.ts
├── catalog.api.repository.ts
├── catalog.keys.ts
├── catalog.queries.ts
└── catalog.mutations.ts
```

`catalog.repository.ts`:

```text
interface CatalogRepository
```

`catalog.api.repository.ts`:

```text
ApiCatalogRepository
```

`catalog-mock.repository.ts` tetap dapat dipertahankan sebagai test fixture/mock.

---

# 46. Low-level API Service

Recommended separation:

```text
catalog.api.ts
```

untuk low-level HTTP calls.

Contoh konsep:

```text
catalog.api.products.list()
catalog.api.products.create()
catalog.api.products.update()

catalog.api.categories.list()
...

catalog.api.media.createUploadUrl()
catalog.api.media.register()
...
```

Repository mengubah HTTP response menjadi repository result.

Komponen tidak mengakses `api` langsung.

---

# 47. Repository Runtime Composition

Production:

```text
catalogRepository
→ ApiCatalogRepository
```

Test:

```text
catalogRepository
→ MockCatalogRepository
```

Tidak perlu menyimpan flag mock di component.

---

# 48. Outlet Effective Catalog

Backend juga mempunyai:

```http
GET /merchant/catalog/outlets/{outlet}/products
PUT /merchant/catalog/outlets/{outlet}/products/order
```

Ini adalah effective outlet catalog.

Endpoint tersebut **tidak perlu dimasukkan ke Product CRUD flow** jika existing
Merchant Catalog UI belum menggunakannya.

Jangan menambah UI baru untuk endpoint ini dalam task integrasi kecuali ada
consumer yang sudah ada.

---

# 49. No Backend Changes

Scope ini mengasumsikan Catalog API sudah siap.

Dilarang pada task ini:

- mengubah route backend;
- mengubah resource backend;
- mengubah request schema backend;
- menambah endpoint global modifier;
- mengubah database;
- membuat bundle transaction endpoint;
- mengubah ProductResource untuk menambahkan image;
- menambahkan field Catalog baru tanpa requirement terpisah.

Mismatch yang dapat diselesaikan pada frontend harus diselesaikan dengan:

```text
type
mapper
adapter
repository
```

---

# 50. Implementation Sequence

## Phase 1 — Contract

1. Freeze backend resource contract.
2. Freeze request payload contract.
3. Review frontend `catalog.types.ts`.
4. Create repository interface.
5. Create resource-specific request types.

## Phase 2 — Read Integration

6. Product list.
7. Category list.
8. Product detail.
9. Outlet data source.
10. Dedicated child queries bila diperlukan.

## Phase 3 — Product/Category Mutation

11. Product create.
12. Product update.
13. Product status.
14. Product delete.
15. Product reorder.
16. Category CRUD.
17. Category status.
18. Category reorder.

## Phase 4 — Children

19. Variant CRUD/status/reorder.
20. Modifier Group CRUD/status/reorder.
21. Modifier CRUD/status/reorder.
22. Outlet assignment/status/availability.

## Phase 5 — Media

23. Upload URL.
24. Storage upload.
25. Media register.
26. Media primary/delete/reorder.
27. Progress/failure handling.

## Phase 6 — Wizard

28. Replace bundle repository with API.
29. Server product ID after Step 1.
30. Sequential child persistence.
31. Partial failure recovery.
32. Review server state.

## Phase 7 — Quality

33. Remove production mock dependency.
34. Error mapping.
35. Loading/pending states.
36. Tests.
37. Typecheck.
38. Format.
39. Final manual integration test.

---

# 51. Files Expected to Change

Primary:

```text
app/modules/catalogs/types/catalog.types.ts

app/modules/catalogs/services/catalog.repository.ts
app/modules/catalogs/services/catalog.api.repository.ts
app/modules/catalogs/services/catalog.api.ts
app/modules/catalogs/services/catalog.keys.ts
app/modules/catalogs/services/catalog.queries.ts
app/modules/catalogs/services/catalog.mutations.ts
```

Potentially:

```text
app/modules/catalogs/schemas/catalog.schema.ts

app/modules/catalogs/components/media-manager.tsx
app/modules/catalogs/components/outlet-assignment.tsx
app/modules/catalogs/components/variant-editor.tsx
app/modules/catalogs/components/modifier-editor.tsx
app/modules/catalogs/components/wizard/wizard-drafts.tsx
app/modules/catalogs/components/product-card.tsx
app/modules/catalogs/components/product-list.tsx
app/modules/catalogs/pages/product-new-page.tsx
app/modules/catalogs/pages/product-edit-page.tsx
app/modules/catalogs/pages/product-detail-page.tsx
app/modules/catalogs/pages/catalogs-page.tsx
app/modules/catalogs/pages/categories-page.tsx
app/modules/catalogs/pages/modifiers-page.tsx
app/modules/catalogs/index.ts
```

> **Update hasil audit codebase:** `grep -rl "catalog-mock"
app/modules/catalogs` mengonfirmasi file berikut meng-import
> `catalog-mock.repository.ts` secara langsung dan **belum** tercatat pada
> draf sebelumnya:
>
> - `components/product-card.tsx` — meng-import type `ProductViewSummary`.
>   Pindahkan tipe ini ke `catalog.types.ts` (atau file interface repository
>   baru) supaya component tidak perlu tahu soal file mock sama sekali,
>   sejalan dengan §5.3 Repository Boundary.
> - `components/product-list.tsx` — sama, import type `ProductViewSummary`.
> - `components/wizard/wizard-drafts.tsx` — meng-import
>   `pickMediaPlaceholder`. Fungsi ini murni mock (tidak ada padanan API) dan
>   **harus dihapus penggunaannya**, diganti alur file picker sungguhan
>   (lihat §40.1).
> - `index.ts` — tidak memanggil repository apa pun secara langsung, tapi
>   sudah memuat komentar header yang secara eksplisit menyatakan rencana
>   penggantian `catalog-mock.repository` dengan `ApiCatalogRepository`.
>   Perbarui komentar ini setelah integrasi selesai agar tidak menyesatkan
>   pembaca berikutnya.
>
> `catalog-mock.repository.ts` dan `catalog-mock-db.ts` sendiri **tidak**
> dihapus pada tahap ini — tetap dipertahankan sebagai fixture untuk test
> sesuai §56 ("Mock repository hanya untuk test/development fixture bila
> diperlukan"), tetapi tidak boleh lagi menjadi import langsung dari kode
> production (component/page); semua akses production harus melalui
> `catalog.repository.ts` (interface) yang diimplementasikan oleh
> `ApiCatalogRepository`.

`app/lib/api.ts` tidak perlu diubah kecuali terdapat requirement nyata dari
integration.

---

# 52. Testing Strategy

## Repository

Test:

- endpoint;
- HTTP method;
- request params;
- payload;
- response parsing;
- 204 handling;
- resource mapping.

## Query

Test:

- query key;
- parameters;
- pagination;
- error propagation;
- detail loading.

## Mutation

Test:

- successful create;
- update;
- delete;
- activate/deactivate;
- reorder;
- cache invalidation.

## Media

Test:

```text
upload-url
→ storage upload
→ register
```

termasuk failure.

## Wizard

Test:

```text
simple product
variable product
modifier
media
outlet
```

dan partial failure.

---

# 53. Integration Test Scenarios

## Scenario A — Simple Product

```text
Add Product
→ Simple
→ category
→ price
→ save
```

Expected:

```text
POST /products
```

Tidak ada:

```text
POST /variants
```

## Scenario B — Variable Product

```text
POST product
POST variant
POST variant
```

Product tidak mengirim master price.

## Scenario C — Customization

```text
POST product
POST modifier-group
POST modifier
```

## Scenario D — Media

```text
POST upload-url
PUT storage
POST media
```

## Scenario E — Outlet

```text
PUT /products/{product}/outlets
```

## Scenario F — Status

```text
POST activate/deactivate
```

Tidak menggunakan PATCH status.

---

# 54. API/UI Contract Acceptance Criteria

- [ ] Product resource field sama dengan backend.
- [ ] Category resource field sama.
- [ ] Variant resource field sama.
- [ ] Media resource field sama.
- [ ] Modifier Group resource field sama.
- [ ] Modifier resource field sama.
- [ ] Outlet assignment resource field sama.
- [ ] Enum raw values sama dengan backend.
- [ ] Pagination sama.
- [ ] Query parameter sama.
- [ ] HTTP method sama.
- [ ] Endpoint sama.
- [ ] Reorder request menggunakan resource-specific IDs.
- [ ] Media register menggunakan `object_key`.
- [ ] Media upload menggunakan upload-url flow.
- [ ] Product type immutable pada edit.
- [ ] Status menggunakan activate/deactivate.
- [ ] Modifier tetap product-scoped.
- [ ] Outlet assignment memisahkan status dan availability.
- [ ] **(Update audit)** Produk dengan variant/media/outlet lebih dari satu
      halaman default (>15, hingga batas 100 per_page) tidak terpotong diam-diam
      pada `variants.list`, `media.list`, `productOutlets.list` (lihat §7).
- [ ] **(Update audit)** Client-side memvalidasi mime type
      (`image/jpeg`/`image/png`/`image/webp`), ukuran file (default maks 5 MB),
      dan jumlah media per produk (default maks 10) sebelum memanggil
      `upload-url` (lihat §40.1).

---

# 55. UX Acceptance Criteria

- [ ] Existing Catalog UI tetap terlihat dan berfungsi seperti sebelum integrasi.
- [ ] Tidak ada redesign besar.
- [ ] Loading state tersedia.
- [ ] Mutation pending tersedia.
- [ ] Error state tersedia.
- [ ] Server validation masuk ke form.
- [ ] Network failure tidak dianggap sukses.
- [ ] Delete mempunyai confirmation.
- [ ] Double submit dicegah.
- [ ] Product list tetap menggunakan filter/search existing.
- [ ] DnD reorder tetap bekerja.
- [ ] Media upload menampilkan progress.
- [ ] Partial failure dapat dilanjutkan.
- [ ] **(Update audit)** `MediaManager` dan wizard media step memiliki file
      picker sungguhan (`<input type="file">`/drop-zone) yang menggantikan
      `pickMediaPlaceholder()`; tidak ada lagi jalur kode yang memanggil
      fungsi tersebut dari component production (lihat §40.1).
- [ ] **(Update audit)** Product List tidak menampilkan `variant_count`/
      `min_price` palsu atau memicu N+1 request; mengikuti strategi §36.
- [ ] **(Update audit)** Kontrol non-owner (activate/deactivate/availability
      outlet assignment, effective outlet catalog) tetap dapat diakses oleh
      user non-owner sesuai §41, tidak digating blanket bersama kontrol
      owner-only lainnya.

---

# 56. Technical Acceptance Criteria

- [ ] Tidak ada `api.get/post/patch/delete` langsung di component.
- [ ] Tidak ada Axios instance kedua.
- [ ] Query tetap memakai TanStack Query.
- [ ] Mutation tetap memakai TanStack Query.
- [ ] Repository interface digunakan.
- [ ] Production menggunakan API repository.
- [ ] Mock repository hanya untuk test/development fixture bila diperlukan.
- [ ] Tidak ada merchant_id manual pada request.
- [ ] Zod tetap digunakan untuk client-side validation.
- [ ] `ApiError` existing digunakan.
- [ ] TypeScript pass.
- [ ] Test pass.
- [ ] Prettier pass.
- [ ] **(Update audit)** Tidak ada lagi import langsung ke
      `catalog-mock.repository.ts` dari component/page production
      (`product-card.tsx`, `product-list.tsx`, `wizard-drafts.tsx`,
      `media-manager.tsx`, `catalog.queries.ts`, `catalog.mutations.ts`
      seluruhnya sudah dialihkan ke `catalog.repository.ts`); import ke file
      mock hanya boleh tersisa dari test atau `MockCatalogRepository` itu
      sendiri.
- [ ] **(Update audit)** Tipe `ProductViewSummary` sudah dipindah keluar dari
      `catalog-mock.repository.ts` ke lokasi yang tidak terikat implementasi
      mock (mis. `catalog.types.ts`).

---

# 57. Definition of Done

Integrasi Catalog dianggap selesai apabila:

```text
UI existing
    ↓
real API
```

telah berjalan end-to-end untuk:

```text
Category
Product
Variant
Customization
Media
Outlet Assignment
```

dengan:

```text
GET
POST
PATCH
DELETE
activate
deactivate
reorder
```

yang memang tersedia pada API.

Add Product flow harus dapat:

```text
Create Product
→ Create children
→ Upload Media
→ Assign Outlets
→ Review
```

tanpa dummy repository sebagai production data source.

---

# 58. Final Architecture

```text
                    Catalog UI
                        │
             ┌──────────┴──────────┐
             │                     │
         Query Hooks          Mutation Hooks
             │                     │
             └──────────┬──────────┘
                        │
                Catalog Repository
                        │
              ApiCatalogRepository
                        │
                 catalog.api.ts
                        │
                   ~/lib/api.ts
                        │
                Axios + Bearer Token
                        │
          /api/v1/merchant/catalog
                        │
                 JualAntar API
```

Domain:

```text
Product
├── Category
├── Variant[]
├── Media[]
├── ModifierGroup[]
│     └── Modifier[]
└── OutletProductAssignment[]
```

---

# 59. Implementation Guardrails

Selama pengerjaan, jangan keluar dari konteks berikut:

> **Task ini adalah API integration terhadap Catalog UI yang sudah selesai.**

Jangan:

- membuat ulang UI;
- mengganti UX;
- membuat domain Catalog baru;
- mengubah backend untuk memudahkan frontend;
- membuat endpoint yang tidak ada;
- membuat global modifier API assumption;
- memasukkan inventory;
- memasukkan promotion;
- memasukkan order;
- memasukkan payment;
- memasukkan customer.

Jika ditemukan masalah:

```text
Backend API
vs
Existing UI
```

selesaikan terlebih dahulu di:

```text
Repository
Adapter
Mapper
Type
Query/Mutation layer
```

dan hanya ubah backend sebagai separate task apabila memang contract API
terbukti tidak memenuhi requirement existing.

---

# 60. Rule of Thumb

Satu-satunya perubahan besar yang diharapkan pada tahap ini adalah:

```text
catalog-mock.repository.ts
          ↓
catalog-api.repository.ts
```

sedangkan:

```text
CatalogLayout
CatalogTabs
ProductList
ProductCard
ProductFilters
ProductDetail
ProductNewPage
ProductEditPage
VariantEditor
MediaManager
ModifierEditor
OutletAssignment
ReviewSection
```

sebisa mungkin tetap menjadi consumer yang sama.

Dengan demikian integrasi besok harus menjadi proses **penggantian data source
dan wiring API**, bukan pembangunan ulang Catalog UI.

Satu pengecualian yang sudah dikonfirmasi lewat audit codebase (§0, §40.1):
`MediaManager` dan wizard media step memerlukan penambahan file picker
sungguhan karena keduanya saat ini murni memakai data placeholder tanpa
elemen pemilihan file apa pun — ini tetap dianggap "wiring", bukan redesign,
karena tidak mengubah struktur/komponen lain, hanya melengkapi satu
interaksi yang memang belum pernah diimplementasikan.
