# PLAN.md — Revisi UI Product Detail Read-Only & Integrasi Product Detail API

## 1. Tujuan

Merevisi halaman **Product Detail** pada repository `Rumahkodingku/jualantar-merchant` agar menjadi halaman **read-only** yang berfokus pada pemahaman produk secara keseluruhan, sesuai desain final terlampir.

Prinsip utama:

- **Product Detail = melihat / memahami kondisi produk.**
- **Product Edit = mengubah produk**, melalui halaman terpisah.
- Tidak ada form edit, inline editing, upload/delete/reorder, outlet assignment, atau mutation management pada Product Detail.
- Action untuk menuju halaman Edit tetap boleh tersedia sebagai entry point, tetapi implementasi edit berada di route/page terpisah.
- Integrasi frontend harus mengikuti kontrak terbaru `ProductDetailResource` pada `jualantar-api`.

---

## 2. Repository dan Endpoint

### Frontend

`https://github.com/Rumahkodingku/jualantar-merchant`

Branch dianalisis: `main`.

### Backend

`https://github.com/Rumahkodingku/jualantar-api`

Endpoint detail:

```text
GET /merchant/catalog/products/{productId}
```

Frontend saat ini menggunakan:

```text
app/modules/catalogs/pages/product-detail-page.tsx
app/modules/catalogs/components/product/product-info-panel.tsx
app/modules/catalogs/services/products/product.queries.ts
app/modules/catalogs/services/catalog.api.ts
app/modules/catalogs/services/catalog.mappers.ts
app/modules/catalogs/types/catalog.types.ts
```

---

## 3. Hasil Analisis Backend Terbaru

`ProductDetailResource` saat ini sudah menambahkan object `summary` dan `ProductController@show` sudah melakukan `loadCount` untuk outlet.

Kontrak aktual yang perlu dikonsumsi frontend:

```json
{
    "data": {
        "id": "...",
        "category_id": "...",
        "category": {},
        "name": "Nasi Goreng",
        "description": "...",
        "product_type": "variable",
        "price": null,
        "status": "inactive",
        "display_order": 0,
        "primary_media": {},
        "summary": {
            "price": {
                "type": "from",
                "value": 13000
            },
            "variants_count": 3,
            "customization_groups_count": 1,
            "media_count": 5,
            "outlets_count": 1
        },
        "variants": [],
        "media": [],
        "modifier_groups": [],
        "created_at": "...",
        "updated_at": "..."
    }
}
```

Semantik `summary.price`:

- `fixed` untuk product type `simple`, nilai berasal dari `product.price`.
- `from` untuk product type `variable`, nilai adalah harga minimum dari active variants.
- Untuk variable product tanpa active variant, `value` dapat `null`.

Count pada endpoint detail:

- `variants_count` mengikuti child collection `variants` yang dimuat endpoint.
- `customization_groups_count` berasal dari `modifierGroups`.
- `media_count` berasal dari `media`.
- `outlets_count` adalah jumlah product-to-outlet assignments.

Backend tidak mengembalikan `outlets[]` pada detail. Outlet assignment tetap menjadi endpoint terpisah.

`ProductDetailResource` juga masih mewarisi `ProductResource`, sehingga response saat ini tetap memiliki root listing fields (`variants_count`, `min_price`, `media_count`, `modifier_groups_count`) selain nested `summary`. Frontend **tidak boleh menggunakan root aggregates tersebut untuk presentation baru**; `summary` menjadi source of truth untuk Product Detail.

---

## 4. Kondisi Frontend Saat Ini

### 4.1 Product Detail page

`product-detail-page.tsx` saat ini:

- memakai `useProductDetail(productId)`;
- memiliki tab `informasi`, `variant`, `customization`, `media`, `outlet`;
- langsung merender editor untuk Variant, Customization, Media, dan Outlet;
- memanggil `useProductAssignments()` hanya ketika tab Outlet aktif;
- memiliki tombol `Edit Produk` langsung pada header.

Problem utama: halaman detail saat ini masih mencampur **read-only detail** dan **management/mutation UI**.

### 4.2 Product Info Panel

`product-info-panel.tsx` saat ini menghitung harga variable di frontend:

```ts
Math.min(...product.variants.map((variant) => variant.price))
```

Perhitungan ini harus dihapus. Harga detail harus mengambil:

```ts
product.summary.price
```

### 4.3 Existing management components

Komponen berikut memang sudah menjadi bagian dari domain Catalog dan tetap dibutuhkan oleh halaman edit:

- `VariantEditor`
- `ModifierEditor`
- `MediaManager`
- `OutletAssignment`
- `ProductInfoSection`
- `ProductPriceSection`

Komponen-komponen tersebut **jangan dihapus** hanya karena tidak lagi digunakan pada Product Detail. Mereka tetap menjadi dependency halaman Product Edit.

---

## 5. Target UX

### 5.1 Prinsip desain

Product Detail harus terasa seperti **inspection screen**, bukan form management.

User datang ke halaman ini untuk:

- melihat produk secara keseluruhan;
- melihat status;
- melihat harga;
- memahami konfigurasi;
- melihat variant;
- melihat customization;
- melihat foto;
- melihat outlet yang terhubung;
- melihat metadata produk.

User tidak datang ke halaman ini untuk mengedit.

---

## 6. Target Information Architecture

Struktur utama:

```text
Product Detail
├── Header
│   ├── Back
│   ├── Product name
│   ├── Status badge
│   └── Overflow actions
│
├── Tab navigation
│   ├── Ringkasan
│   ├── Variant {count}
│   ├── Customization {count}
│   ├── Media {count}
│   └── Outlet {count}
│
└── Tab content
    ├── Ringkasan
    ├── Variant
    ├── Customization
    ├── Media
    └── Outlet
```

`informasi` diganti menjadi `ringkasan` karena tab pertama bukan sekadar menampilkan beberapa field informasi; tab ini menjadi overview lengkap dari product.

---

## 7. Header Design

Header target mengikuti desain terlampir:

```text
‹                 Nasi Goreng                 ⋮
                   ● Nonaktif
```

### Requirement

- Back action kembali ke Catalog Product List.
- Product name tampil sebagai page title.
- Status badge selalu terlihat.
- Tidak ada tombol besar `Edit Produk` di header.
- Overflow menu menjadi tempat action operasional tingkat product.

Overflow menu minimal:

```text
Edit produk
Duplikat produk
Aktifkan / Nonaktifkan produk
Hapus produk
```

Catatan penting:

- `Edit produk` hanya melakukan navigation ke Product Edit.
- Mutation seperti activate/deactivate/delete tetap boleh dilakukan melalui action menu karena itu bukan editing field/detail. Namun implementasinya harus mengikuti mutation hooks yang sudah ada dan tidak membuat Product Detail berubah menjadi edit form.
- `Duplikat produk` hanya ditampilkan jika flow/API duplicate product memang sudah tersedia. Jangan membuat endpoint baru dalam pekerjaan ini.

---

## 8. Tab Navigation

Target:

```text
Ringkasan | Variant 3 | Customization 1 | Media 5 | Outlet 1
```

### Aturan count

Gunakan nested summary:

```ts
summary.variants_count
summary.customization_groups_count
summary.media_count
summary.outlets_count
```

Jangan lagi menggunakan:

```ts
product.variants_count
product.media_count
product.modifier_groups_count
```

untuk UI Product Detail.

Root field tersebut hanya compatibility dengan `ProductResource` dan bukan source of truth presentation detail.

### URL state

Pertahankan query parameter:

```text
/products/{id}?tab=variant
```

Tetapi ubah default tab dari:

```text
informasi
```

menjadi:

```text
ringkasan
```

Backward compatibility opsional:

- `?tab=informasi` dapat dipetakan ke `ringkasan` selama masa transisi agar bookmark lama tidak rusak.
- Semua URL baru harus memakai `ringkasan`.

---

## 9. Ringkasan / Overview

Tab `Ringkasan` harus menjadi halaman paling informatif.

Target structure mengikuti visual final:

### 9.1 Hero product

```text
[ Primary product image ]

Makanan  •  Variable
Nasi Goreng
Mulai dari Rp13.000

Nasi goreng dengan bumbu khas dan pilihan
 topping yang dapat disesuaikan sesuai selera pelanggan.
```

Requirement:

- gunakan primary media dari `product.media` yang `is_primary`, fallback media pertama;
- fallback placeholder jika tidak ada image;
- price menggunakan `summary.price`;
- untuk `from`, label `Mulai dari`;
- untuk `fixed`, label harga fixed biasa;
- `null` harus memiliki fallback copy seperti `Harga belum tersedia`;
- category berasal dari `product.category?.name`;
- product type berasal dari `product.product_type`.

### 9.2 Summary cards

Gunakan grid 2x2 pada mobile:

```text
┌──────────────┬───────────────┐
│ 3 Variant    │ 1 Custom.     │
├──────────────┼───────────────┤
│ 5 Media      │ 1 Outlet      │
└──────────────┴───────────────┘
```

Setiap card:

- icon;
- angka besar;
- label;
- tidak clickable secara default, kecuali desain navigasi akhirnya memang menghendaki quick navigation.

Jika dibuat clickable, action harus hanya pindah tab, bukan membuka editor.

### 9.3 Informasi Produk

Section read-only:

```text
Informasi Produk

Kategori               Makanan
Tipe produk            Variable
Status                 Nonaktif
Harga                  Mulai dari Rp13.000
Jumlah variant         3 variant
Jumlah customization   1 group
Jumlah media           5 foto
Jumlah outlet          1 outlet
Dibuat                 28 Sep 2026, 01:32
Diperbarui             28 Sep 2026, 01:32
```

Deskripsi dapat diletakkan sebelum metadata teknis atau sebagai row tersendiri jika cukup panjang.

Gunakan component reusable seperti `DetailRows`, tetapi perbaiki agar mendukung:

- long text;
- responsive wrapping;
- optional icon/header;
- consistent spacing.

---

## 10. Variant Tab — Read Only

Target:

```text
Variant
Terdapat 3 variant produk dengan harga yang berbeda.

[ Variant card ]
[ Variant card ]
[ Variant card ]
```

Variant card menampilkan:

- primary/representative image jika tersedia secara domain contract; jika variant belum memiliki media, gunakan product image atau placeholder sesuai data yang tersedia;
- nama variant;
- harga;
- SKU jika tersedia;
- default badge;
- status aktif/nonaktif;
- display order hanya sebagai informasi jika memang berguna.

Tidak ada:

- tambah variant;
- edit variant;
- hapus variant;
- activate/deactivate control;
- reorder control;
- context menu mutation.

`VariantEditor` tidak dipakai pada Product Detail.

Untuk simple product:

```text
Produk ini menggunakan satu harga dan tidak memiliki variant.
```

Gunakan empty/informational state, bukan editor.

---

## 11. Customization Tab — Read Only

Target:

```text
Customization
Terdapat 1 group dengan 3 pilihan.

Tambahan  •  Nonaktif
Opsional · Multiple · 0+ pilihan

Ayam Goreng        + Rp10.000      Aktif
Telur               + Rp5.000      Aktif
Sambal              + Rp2.000      Aktif
```

Informasi group:

- name;
- status;
- selection type;
- min selection;
- max selection;
- required/optional.

Informasi modifier:

- name;
- price;
- status;
- default indicator bila relevan.

Tidak ada mutation UI.

`ModifierEditor` tidak dipakai pada Product Detail.

---

## 12. Media Tab — Read Only

Target gallery:

```text
Foto Produk
Terdapat 5 foto untuk produk ini.

┌─────────┬─────────┐
│  UTAMA  │         │
│         │         │
├─────────┼─────────┤
│         │         │
└─────────┴─────────┘
```

Requirement:

- grid responsive;
- primary image memiliki visual marker `Utama`;
- tap image membuka photo viewer;
- viewer mendukung next/previous;
- viewer menampilkan counter seperti `3 / 5`;
- thumbnail strip tersedia pada photo viewer bila layout memungkinkan.

Tidak ada:

- upload;
- delete;
- set primary;
- reorder.

`MediaManager` tidak dipakai pada Product Detail.

Untuk empty media:

```text
Tidak ada foto produk
Belum ada foto yang ditambahkan untuk produk ini.
Tambahkan foto pada halaman edit produk.
```

Message ini harus tetap read-only dan mengarahkan user ke Product Edit.

---

## 13. Outlet Tab — Read Only

Target:

```text
Outlet
Terdapat 1 outlet yang terhubung dengan produk ini.

┌────────────────────────────┐
│ Outlet Utama               │
│ ● Aktif   ● Tersedia       │
└────────────────────────────┘
```

Endpoint tetap:

```text
GET /merchant/catalog/products/{productId}/outlets
```

Gunakan `useProductAssignments(productId)` hanya ketika tab Outlet aktif.

### Kenapa tetap lazy load?

Product Detail API sudah menyediakan `summary.outlets_count`, sehingga Ringkasan dan tab label tidak membutuhkan collection outlet.

Collection outlet hanya diperlukan ketika user membuka tab Outlet.

Dengan demikian:

```text
Initial page load
├── Product Detail API
│   ├── product
│   ├── summary
│   ├── variants
│   ├── customization
│   └── media
│
└── NO outlet collection

User opens Outlet tab
└── Product Outlet Assignment API
```

`OutletAssignment` tidak dipakai pada Product Detail. Buat/read-only component, misalnya:

```text
ProductOutletList
```

Mutation outlet tetap menjadi responsibility Product Edit atau management flow yang sudah tersedia.

---

## 14. Photo Viewer

Implement viewer read-only sesuai desain terlampir.

Structure:

```text
┌─────────────────────────┐
│ ‹    3 / 5          ×   │
│                         │
│       [ LARGE PHOTO ]   │
│                         │
│                         │
│  ‹                 ›    │
│                         │
│ [thumb] [thumb] [thumb] │
└─────────────────────────┘
```

Requirement:

- modal/full-screen overlay;
- keyboard accessibility untuk desktop bila route juga dipakai desktop;
- close button;
- previous/next;
- selected thumbnail;
- image alt text;
- fallback ketika image gagal.

Tidak ada edit action pada viewer.

---

## 15. Product Detail Type Contract Frontend

Revisi `catalog.types.ts` menjadi eksplisit.

Target:

```ts
export interface ProductDetailSummary {
    price: {
        type: "fixed" | "from"
        value: number | null
    }
    variants_count: number
    customization_groups_count: number
    media_count: number
    outlets_count: number
}

export interface ProductDetail extends Product {
    category?: CatalogCategory
    summary: ProductDetailSummary
    variants?: ProductVariant[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroup[]
}
```

Catatan:

- `summary` untuk detail sebaiknya required karena endpoint detail target memang menyediakannya.
- `variants`, `media`, `modifier_groups` boleh tetap optional jika API/mapper architecture saat ini mempertahankan optionality.
- Jangan menambahkan `outlets?: ...[]` ke `ProductDetail`.

---

## 16. Wire Types & Mapper

Revisi `catalog.mappers.ts`.

Target:

```ts
export interface ProductDetailSummaryWire {
    price: {
        type: "fixed" | "from"
        value: number | string | null
    }
    variants_count: number
    customization_groups_count: number
    media_count: number
    outlets_count: number
}
```

`ProductDetailWire`:

```ts
export type ProductDetailWire = ProductWire & {
    category?: CatalogCategory
    summary: ProductDetailSummaryWire
    variants?: ProductVariantWire[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroupWire[]
}
```

Mapper:

```ts
export function toProductDetail(wire: ProductDetailWire): ProductDetail {
    return {
        ...toProduct(wire),
        category: wire.category,
        summary: {
            price: {
                type: wire.summary.price.type,
                value: normalizePrice(wire.summary.price.value),
            },
            variants_count: wire.summary.variants_count,
            customization_groups_count: wire.summary.customization_groups_count,
            media_count: wire.summary.media_count,
            outlets_count: wire.summary.outlets_count,
        },
        variants: wire.variants?.map(toProductVariant),
        media: wire.media?.map(toProductMedia),
        modifier_groups: wire.modifier_groups?.map(toModifierGroup),
    }
}
```

Jangan menghitung ulang:

- minimum variant price;
- jumlah variants;
- jumlah modifier groups;
- jumlah media;
- jumlah outlets.

Mapper hanya normalisasi tipe wire menjadi domain frontend.

---

## 17. `ProductInfoPanel` Rework

`ProductInfoPanel` perlu berubah dari panel informasi sederhana menjadi `ProductOverview` / `ProductSummaryPanel`.

Nama komponen yang disarankan:

```text
ProductOverview
```

Responsibility:

- hero image;
- product identity;
- category/type;
- summary price;
- description;
- summary metrics;
- readonly detail rows.

Jangan mencampurkan logic edit.

Jangan menggunakan:

```ts
Math.min(...product.variants.map(...))
```

Gunakan:

```ts
product.summary.price
```

---

## 18. Product Detail Page Refactor

`product-detail-page.tsx` harus disederhanakan.

Target conceptual flow:

```text
ProductDetailPage
├── useProductDetail(productId)
├── useProductAssignments(tab === "outlet" ? productId : undefined)
├── ProductDetailHeader
├── ProductDetailTabs
└── tab renderer
    ├── ProductOverview
    ├── ProductVariantList
    ├── ProductCustomizationView
    ├── ProductMediaGallery
    └── ProductOutletList
```

Hilangkan imports dari Product Detail:

```ts
VariantEditor
ModifierEditor
MediaManager
OutletAssignment
```

Tidak perlu membawa mutation hooks ke page detail.

---

## 19. Edit Navigation

Product Detail tetap harus menyediakan navigation ke edit.

Route yang dipertahankan:

```text
CATALOGS_PATHS.edit(product.id)
```

Action:

```text
Overflow menu → Edit produk
```

Tidak membuat edit page baru dalam pekerjaan ini kecuali perubahan minor diperlukan agar navigation tetap konsisten.

Existing `product-edit-page.tsx` tetap menjadi tempat:

- informasi product;
- price;
- variant management;
- customization management;
- media management;
- outlet management.

---

## 20. Mutation dan Cache Invalidation

Product Detail read-only tidak memiliki mutation langsung, tetapi cache detail tetap harus ter-update ketika mutation dilakukan dari:

- Product Edit;
- Product List action;
- Variant mutation;
- Modifier mutation;
- Media mutation;
- Outlet mutation.

`invalidateProducts(queryClient, productId)` saat ini sudah meng-invalidasi:

```ts
catalogKeys.products()
catalogKeys.product(productId)
```

Pertahankan mekanisme ini.

Pastikan semua mutation yang mengubah data yang tercermin pada Product Detail tetap meng-invalidasi product detail query sehingga `summary` dan child collection kembali fresh.

Khusus outlet mutation:

- invalidasi `product(productId)` untuk memperbarui `summary.outlets_count`;
- invalidasi `productAssignments(productId)` untuk refresh tab Outlet.

Bila invalidation helper saat ini belum melakukan kedua hal tersebut secara lengkap, revisi helper secara terpusat daripada menambahkan invalidation ad-hoc di component.

---

## 21. Query Behavior

`useProductDetail(productId)` tetap menjadi query utama.

Jangan menambahkan polling untuk detail secara default hanya karena media URL signed.

Polling `PRODUCT_MEDIA_REFRESH_INTERVAL` pada codebase saat ini ditujukan untuk Product List. Product Detail sebaiknya mengikuti lifecycle normal React Query dan refetch saat stale / navigation sesuai konfigurasi global.

Outlet query:

```ts
useProductAssignments(tab === "outlet" ? productId : undefined)
```

Tetap lazy.

---

## 22. Loading State

Buat skeleton yang mencerminkan layout target, bukan sekadar:

```text
Skeleton title
Skeleton tab
ListSkeleton
```

Overview skeleton minimal:

- hero image skeleton;
- title/meta skeleton;
- price skeleton;
- 4 summary cards;
- information rows.

Tab child skeleton:

- Variant cards;
- customization group card;
- media grid;
- outlet card.

---

## 23. Empty States

Semua tab harus memiliki empty state read-only yang jelas.

### Variant

```text
Belum ada variant
Produk ini belum memiliki variant.
```

### Customization

```text
Belum ada customization
Produk ini belum memiliki customization.
```

### Media

```text
Tidak ada foto produk
Belum ada foto yang ditambahkan.
Tambahkan foto pada halaman edit produk.
```

### Outlet

```text
Belum ada outlet
Produk ini belum terhubung ke outlet mana pun.
```

Tidak ada tombol mutation di empty state Product Detail.

---

## 24. Error State

### Product detail failure

Gunakan `ErrorState` existing dengan retry.

### Outlet failure

Error state hanya berada pada Outlet tab dan menyediakan retry assignment query.

Jangan membuat kegagalan endpoint Outlet membuat seluruh Product Detail gagal karena endpoint tersebut lazy-loaded.

---

## 25. Responsive Design

Target utama adalah mobile seperti desain terlampir, tetapi component harus tetap usable pada desktop.

### Mobile

- single-column content;
- tab horizontal scroll;
- summary cards 2x2;
- media grid 2-column atau adaptive;
- full-screen photo viewer.

### Tablet/Desktop

- max-width content container;
- hero dapat menggunakan layout dua kolom bila cocok;
- summary metrics dapat menjadi 4-column;
- media gallery bisa menggunakan grid lebih besar;
- tetap mempertahankan hierarchy yang sama.

Jangan membuat desktop layout yang secara semantik berbeda dengan mobile.

---

## 26. Accessibility

Pastikan:

- tab memakai role/keyboard semantics yang valid;
- active tab memiliki visual state dan `aria-selected`;
- icon-only buttons memiliki `aria-label`;
- image menggunakan alt text;
- photo viewer focus handling yang benar;
- Escape menutup viewer;
- navigasi tab dapat dipakai keyboard;
- status badge tidak menjadi satu-satunya indikasi status jika diperlukan context text.

---

## 27. Reusable Components yang Disarankan

Tambahkan atau refactor component menjadi komponen read-only berikut:

```text
app/modules/catalogs/components/product/
├── product-overview.tsx
├── product-detail-header.tsx
├── product-detail-tabs.tsx
├── product-summary-metrics.tsx
├── product-variant-list.tsx
├── product-customization-view.tsx
├── product-media-gallery.tsx
├── product-photo-viewer.tsx
├── product-outlet-list.tsx
└── detail-rows.tsx
```

Tidak harus membuat semua file baru jika component existing dapat direuse dengan struktur yang bersih.

Prinsip:

- component read-only tidak import mutation hook;
- component management tetap terpisah;
- naming membedakan `View/List/Gallery` dari `Editor/Manager/Assignment`.

---

## 28. Component Dependency Boundary

### Product Detail boleh depend pada

```text
ProductDetailResource data
ProductDetailSummary
ProductVariant
ProductModifierGroup
ProductMedia
OutletProductAssignment (read-only)
React Query query hooks
UI primitives
format utilities
```

### Product Detail tidak boleh depend pada

```text
VariantEditor
ModifierEditor
MediaManager
OutletAssignment
ProductInfoSection (form)
ProductPriceSection (form)
```

### Product Edit tetap boleh depend pada semua management component tersebut.

---

## 29. Pricing Rules

Satu source of truth untuk presentation Product Detail:

```ts
product.summary.price
```

Mapping:

```text
fixed + value 13000
→ Rp13.000

from + value 13000
→ Mulai dari Rp13.000

from + null
→ Harga belum tersedia
```

Jangan menggunakan `product.price` untuk variable product presentation.

Jangan mencari minimum price dari `product.variants` pada component.

Jangan menggunakan root `min_price` untuk Product Detail.

---

## 30. Count Rules

Gunakan hanya:

```ts
summary.variants_count
summary.customization_groups_count
summary.media_count
summary.outlets_count
```

Child array hanya digunakan untuk rendering detail item.

Contoh yang tidak boleh:

```ts
product.variants?.length
product.media?.length
product.modifier_groups?.length
```

sebagai label summary/tab count.

Alasan: API contract telah menyediakan semantic count khusus detail sehingga UI tidak perlu menjadikan collection length sebagai source of truth.

---

## 31. Media Handling

Product Detail API sudah meng-hydrate media URL pada backend.

Frontend:

- gunakan URL yang diterima API;
- tetap memiliki image error fallback;
- gunakan lazy loading untuk thumbnails/gallery non-primary;
- hindari fetch media endpoint terpisah pada initial load karena media sudah menjadi child data Product Detail;
- jangan melakukan re-hydration client-side.

---

## 32. Outlet Handling

Summary count:

```ts
product.summary.outlets_count
```

Collection:

```ts
useProductAssignments()
```

Ketika assignment mutation dilakukan pada halaman lain, pastikan Product Detail count direfresh melalui invalidation.

`ProductDetail` tidak menampung outlet collection agar response/query tidak menggembungkan payload dan management responsibility tetap terpisah.

---

## 33. React Query Cache Strategy

Query key existing:

```ts
catalogKeys.product(productId)
catalogKeys.productAssignments(productId)
```

Pertahankan.

Mutation success harus memastikan:

```text
product detail → fresh
product list    → fresh
outlet assignment tab → fresh
```

Gunakan invalidation helper central.

Jangan memodifikasi query cache secara manual dengan state duplikasi kecuali ada alasan performa yang terukur.

---

## 34. Product Edit Compatibility

Perubahan Product Detail tidak boleh merusak Product Edit.

`ProductEditPage` saat ini juga memakai `useProductDetail(productId)` dan memiliki concern mutation sendiri.

Karena itu:

- perubahan `ProductDetail` type harus tetap kompatibel;
- `summary` ditambahkan tanpa menghapus child data;
- Product Edit dapat mengabaikan `summary` jika tidak diperlukan;
- jangan memindahkan mutation dari edit page ke detail page;
- jangan menghapus management component existing.

---

## 35. API Mapper Compatibility Concern

Saat ini `toProductDetail()` menggunakan `toProduct(wire)`, dan `toProduct()` mengisi root listing aggregates.

Jangan melakukan refactor besar yang memutus Product List.

Pilihan aman:

1. pertahankan `toProduct()` untuk Product List;
2. tambahkan mapping `summary` pada `toProductDetail()`;
3. secara bertahap berhenti membaca root aggregates di Product Detail.

Refactor internal `ProductResource` backend tidak perlu diikuti dengan perubahan domain model frontend yang memecahkan Product List.

---

## 36. Testing — Mapper

Tambahkan/update unit test untuk:

### Simple product

Input:

```json
"summary": {
  "price": {"type": "fixed", "value": 15000},
  "variants_count": 0,
  "customization_groups_count": 0,
  "media_count": 2,
  "outlets_count": 1
}
```

Expect:

```ts
product.summary.price.type === "fixed"
product.summary.price.value === 15000
```

### Variable product

Expect:

```ts
product.summary.price.type === "from"
product.summary.price.value === 13000
```

### Variable tanpa active variant

Expect:

```ts
product.summary.price.value === null
```

### Count mapping

Assert semua count dipetakan dengan benar.

---

## 37. Testing — Product Detail UI

Tambahkan test untuk:

1. render product name dan status;
2. render primary media;
3. render `Mulai dari` dari `summary.price.type = from`;
4. render fixed price dari `summary.price.type = fixed`;
5. tidak menghitung minimum price dari variants di component;
6. tab count memakai summary;
7. Variant tab tidak menampilkan action mutation;
8. Customization tab tidak menampilkan action mutation;
9. Media tab tidak menampilkan upload/delete/reorder;
10. Outlet tab tidak menampilkan assignment mutation controls;
11. outlet query hanya enabled saat tab Outlet aktif;
12. empty state setiap tab;
13. photo viewer open/close/next/previous;
14. Edit action melakukan navigation ke edit route;
15. halaman detail tetap dapat digunakan tanpa endpoint Outlet berhasil;
16. retry bekerja pada product detail dan outlet query.

---

## 38. Testing — Regression Product Edit

Pastikan perubahan shared type/component tidak merusak:

- edit information;
- edit simple price;
- variant create/update/delete;
- modifier group create/update/delete;
- modifier create/update/delete;
- media upload/delete/set primary/reorder;
- outlet replace/remove/status/availability.

Test harus memastikan management component tetap hanya digunakan di Product Edit / flow yang sesuai.

---

## 39. Visual QA Checklist

Bandingkan implementasi dengan desain final terlampir.

Checklist:

- [ ] Tidak ada tombol `Edit Produk` besar di header detail.
- [ ] Edit hanya melalui overflow/action menu.
- [ ] Header minimal.
- [ ] Status badge dekat product name.
- [ ] Tab count berasal dari `summary`.
- [ ] Ringkasan menjadi default tab.
- [ ] Hero product image menonjol.
- [ ] Harga variable memakai `Mulai dari`.
- [ ] Summary metrics 2x2 pada mobile.
- [ ] Informasi produk read-only.
- [ ] Variant read-only.
- [ ] Customization read-only.
- [ ] Media read-only.
- [ ] Outlet read-only.
- [ ] Photo viewer tersedia.
- [ ] Empty states mengarahkan editing ke halaman Edit tanpa melakukan mutation.
- [ ] Bottom navigation/layout tetap mengikuti shell aplikasi existing.

---

## 40. File yang Kemungkinan Berubah

### Primary

```text
app/modules/catalogs/pages/product-detail-page.tsx
app/modules/catalogs/components/product/product-info-panel.tsx
app/modules/catalogs/types/catalog.types.ts
app/modules/catalogs/services/catalog.mappers.ts
```

### Suggested new/refactor components

```text
app/modules/catalogs/components/product/product-overview.tsx
app/modules/catalogs/components/product/product-detail-header.tsx
app/modules/catalogs/components/product/product-detail-tabs.tsx
app/modules/catalogs/components/product/product-summary-metrics.tsx
app/modules/catalogs/components/product/product-variant-list.tsx
app/modules/catalogs/components/product/product-customization-view.tsx
app/modules/catalogs/components/product/product-media-gallery.tsx
app/modules/catalogs/components/product/product-photo-viewer.tsx
app/modules/catalogs/components/product/product-outlet-list.tsx
```

### Query / invalidation jika diperlukan

```text
app/modules/catalogs/services/products/product.queries.ts
app/modules/catalogs/services/product-outlets/product-outlet.queries.ts
app/modules/catalogs/services/catalog.invalidation.ts
```

### Existing components yang kemungkinan tidak diubah karena tetap menjadi management layer

```text
app/modules/catalogs/components/variants/variant-editor.tsx
app/modules/catalogs/components/modifiers/modifier-editor.tsx
app/modules/catalogs/components/media/media-manager.tsx
app/modules/catalogs/components/outlets/outlet-assignment.tsx
```

---

## 41. Implementation Sequence

### Step 1 — Update contract

Tambahkan `ProductDetailSummary` ke frontend types.

### Step 2 — Update mapper

Map nested `summary` dan normalisasi price.

### Step 3 — Refactor Product Detail page

Ubah default tab menjadi `ringkasan` dan hilangkan management components.

### Step 4 — Build overview

Implementasikan hero, price, summary metrics, dan readonly information.

### Step 5 — Build read-only child views

Implementasikan:

- Variant List;
- Customization View;
- Media Gallery;
- Outlet List.

### Step 6 — Photo viewer

Tambahkan full-screen viewer read-only.

### Step 7 — Action menu navigation

Pindahkan `Edit Produk` ke overflow menu dan pastikan route menuju Product Edit bekerja.

### Step 8 — Invalidation verification

Pastikan mutation dari Product Edit/List/child management memperbarui Product Detail `summary`.

### Step 9 — Testing

Jalankan mapper/UI/query/regression tests.

### Step 10 — Visual QA

Bandingkan mobile dan desktop dengan desain final.

---

## 42. Acceptance Criteria

Implementasi dianggap selesai apabila:

### Product Detail architecture

- [ ] Product Detail benar-benar read-only.
- [ ] Tidak ada editor/manager component di Product Detail.
- [ ] Tidak ada inline form pada Product Detail.
- [ ] Tidak ada CRUD child resource di Product Detail.
- [ ] Edit dilakukan melalui halaman terpisah.

### API integration

- [ ] Nested `summary` berhasil diterima.
- [ ] `summary.price` menjadi source of truth.
- [ ] Semua summary counts memakai field dari API.
- [ ] Tidak ada frontend calculation untuk min variant price.
- [ ] Tidak ada frontend calculation menggunakan collection length untuk tab/summary counts.
- [ ] Outlet collection tetap lazy-loaded melalui endpoint terpisah.

### UX

- [ ] Default tab adalah Ringkasan.
- [ ] Header minimal dan tidak memiliki primary Edit button.
- [ ] Edit tersedia dari overflow action.
- [ ] Overview menampilkan informasi product secara keseluruhan.
- [ ] Semua child tabs read-only.
- [ ] Media dapat dibuka dalam viewer.
- [ ] Empty/error/loading states tersedia.

### Engineering

- [ ] Product Edit tetap berfungsi.
- [ ] Product List tetap berfungsi.
- [ ] Existing mutation flows tidak rusak.
- [ ] React Query invalidation memperbarui detail summary.
- [ ] Tidak terjadi N+1 dari komponen detail.
- [ ] Tidak ada query Outlet saat tab belum dibuka.
- [ ] Tests pass.

---

## 43. Non-Goals

Pekerjaan ini **tidak mencakup**:

- redesign Product Edit page secara menyeluruh;
- perubahan Product Detail API backend selain konsumsi kontrak yang sudah tersedia;
- pembuatan duplicate product API jika endpoint belum tersedia;
- perubahan domain Product/Variant/Modifier/Media/Outlet;
- pembuatan outlet endpoint baru;
- perubahan navigation shell aplikasi di luar kebutuhan Product Detail;
- penambahan business rule baru.

---

## 44. Final Architecture

Target akhir:

```text
                    PRODUCT LIST
                         │
              ┌──────────┴──────────┐
              │                     │
           View Detail             Edit
              │                     │
              ▼                     ▼
      PRODUCT DETAIL          PRODUCT EDIT
          READ ONLY             MANAGEMENT
              │                     │
       ┌──────┼──────┐       ┌──────┼──────┐
       │      │      │       │      │      │
   Overview Variant Media   Info Variant Media
       │      │      │       │      │      │
       ├──Customization      ├──Customization
       │                     │
       └──Outlet (read)      └──Outlet management
```

Product Detail API:

```text
Product Detail
├── Product identity
├── Category
├── Summary
│   ├── price
│   ├── variants_count
│   ├── customization_groups_count
│   ├── media_count
│   └── outlets_count
├── Variants
├── Modifier Groups
└── Media

Product Outlet API
└── Outlet assignments
```

Principle akhir:

> **Product Detail menjelaskan kondisi produk. Product Edit mengubah kondisi produk.**

API detail menyediakan presentation-ready summary; frontend menampilkan data tersebut tanpa melakukan business calculation atau mengambil alih child-resource management.
