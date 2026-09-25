# PRD — UI Module Catalog

## JualAntar Merchant

**Document Status:** Draft / Implementation Ready  
**Phase:** Merchant Frontend — Catalog UI  
**Product Area:** Merchant Application / Catalog  
**Primary Frontend Repository:** `https://github.com/Rumahkodingku/jualantar-merchant`  
**Primary Backend Repository:** `https://github.com/Rumahkodingku/jualantar-api`

---

# 1. Document Overview

## 1.1 Purpose

Dokumen ini mendefinisikan requirement untuk pembangunan **UI Module
Catalog** pada aplikasi JualAntar Merchant.

Fokus PRD ini adalah:

- membangun UI/UX Catalog pada frontend merchant;
- menyediakan halaman pengelolaan Product, Category, Variant, Media,
  Customization, dan Outlet Assignment;
- menyiapkan struktur UI agar siap dihubungkan ke Catalog API;
- menggunakan **dummy data** selama tahap implementasi UI awal;
- menjaga struktur frontend agar nantinya dapat mengganti dummy data dengan
  API tanpa perubahan besar pada komponen UI.

PRD ini **tidak mensyaratkan integrasi API pada tahap pertama implementasi UI**.

---

# 2. Source of Truth dan Batasan Analisis

## 2.1 Frontend Repository

Repository target:

`https://github.com/Rumahkodingku/jualantar-merchant`

Catatan penting: pada sesi analisis ini repository frontend tersebut tidak dapat
diambil melalui GitHub connector yang tersedia. Oleh karena itu, requirement
yang bersifat spesifik terhadap implementasi internal repository frontend
(misalnya exact folder component yang sudah ada, exact design-system component,
atau exact hook/API client yang tersedia) **tidak diasumsikan**.

Screenshot UI Catalog yang diberikan user digunakan sebagai referensi visual
untuk kondisi halaman saat ini.

Dokumen ini karena itu menetapkan **target UI dan boundary implementasi**
tanpa mengklaim struktur internal frontend yang belum dapat diverifikasi.

## 2.2 Backend Catalog API yang Terverifikasi

Catalog API pada `jualantar-api` menyediakan:

### Category

- list
- create
- detail
- update
- delete
- activate
- deactivate
- reorder

List category mendukung:

- search
- status
- sort
- order
- pagination

### Product

- list
- create
- detail
- update
- delete
- activate
- deactivate
- reorder

List product mendukung:

- search
- category filter
- status filter
- product type filter
- sort
- order
- pagination

### Product Variant

- list
- create
- detail
- update
- delete
- activate
- deactivate
- reorder

### Product Media

- list
- generate upload URL
- register media
- detail
- delete
- set primary
- reorder

### Product Modifier Group / Modifier

- modifier group list/create/detail/update/delete
- modifier group activate/deactivate/reorder
- modifier list/create/detail/update/delete
- modifier activate/deactivate/reorder

### Product Outlet Assignment

- list assignment
- assign outlets
- replace outlets
- remove assignment
- activate/deactivate assignment
- update availability

### Effective Outlet Catalog

API juga memiliki endpoint untuk menampilkan catalog efektif pada suatu
outlet dan melakukan reorder catalog outlet.

---

# 3. Product Architecture

## 3.1 Master Catalog

UI harus mengikuti konsep:

```text
Merchant
   │
   ├── Categories
   │
   ├── Master Products
   │      ├── Variants
   │      ├── Media
   │      └── Modifier Groups
   │              └── Modifiers
   │
   └── Outlets
             └── Product Assignments
```

Product merupakan master product pada level merchant.

Outlet tidak membuat product duplikat.

---

# 4. Goals

## 4.1 Primary Goals

UI Catalog harus memungkinkan merchant owner untuk:

1. Melihat daftar product.
2. Mencari product.
3. Memfilter product.
4. Menambah product.
5. Melihat detail product.
6. Mengubah product.
7. Mengaktifkan/nonaktifkan product.
8. Menghapus product.
9. Mengelola variant.
10. Mengelola media product.
11. Mengelola customization.
12. Mengelola category.
13. Mengatur assignment product ke outlet.
14. Mengatur urutan product/category pada catalog.

## 4.2 UI-Only Goal

Pada fase implementasi UI ini:

- seluruh daftar product menggunakan dummy data;
- seluruh category menggunakan dummy data;
- seluruh variant menggunakan dummy data;
- seluruh media menggunakan dummy data;
- seluruh modifier/customization menggunakan dummy data;
- seluruh outlet menggunakan dummy data;
- create/update/delete/status/reorder cukup mengubah local state;
- tidak ada request nyata ke Catalog API.

---

# 5. Non-Goals

Tidak termasuk dalam PRD ini:

- integrasi API nyata;
- authentication implementation;
- authorization backend;
- inventory;
- stock;
- pricing promotion;
- discount;
- voucher;
- order;
- cart;
- checkout;
- payment;
- product bundle/combo;
- product import/export;
- outlet creation;
- perubahan schema backend.

---

# 6. Information Architecture

Route yang ditargetkan:

```text
/catalog
/catalog/products
/catalog/products/new
/catalog/products/[productId]
/catalog/products/[productId]/edit
/catalog/categories
/catalog/modifiers
```

Recommended route ownership:

```text
/catalog
    └── Product workspace

/catalog/products
    └── Product list

/catalog/products/new
    └── Add Product wizard

/catalog/products/[productId]
    └── Product detail workspace

/catalog/products/[productId]/edit
    └── Product edit workspace

/catalog/categories
    └── Category management

/catalog/modifiers
    └── Modifier management view
```

## 6.1 `/catalog`

`/catalog` adalah root workspace Catalog.

Default state menampilkan Product workspace.

UI utama:

```text
Katalog
Kelola produk, kategori, dan kustomisasi katalog Anda.

[ Produk ] [ Kategori ] [ Modifier ]

[ Search ] [ Filter ]                    [ + Tambah Produk ]

Product List
```

---

# 7. Global Catalog Layout

## 7.1 Header

Header minimum:

- page title: `Katalog`
- supporting text
- primary action sesuai tab aktif

Untuk tab Product:

`+ Tambah Produk`

Untuk tab Category:

`+ Tambah Kategori`

Untuk tab Modifier:

`+ Tambah Modifier Group` hanya bila UI benar-benar memakai
global modifier management mock.

## 7.2 Catalog Tabs

Tab:

```text
Produk
Kategori
Modifier
```

Produk menjadi default.

Tabs harus dapat dipakai pada desktop dan mobile.

---

# 8. Product List UI

## 8.1 Purpose

Memberikan workspace utama untuk mengelola master product.

## 8.2 Controls

Toolbar:

```text
[ 🔍 Cari produk... ]

[ Kategori ▼ ]
[ Status ▼ ]
[ Tipe produk ▼ ]

[ + Tambah Produk ]
```

Search dummy harus bekerja secara lokal.

Filter dummy harus bekerja secara lokal.

## 8.3 Product Card / Row

Setiap product menampilkan:

- product image;
- product name;
- category;
- product type;
- price;
- status;
- optional variant count;
- action menu.

Example:

```text
┌───────────────────────────────────────────────────────┐
│ [IMG] Ayam Geprek                                     │
│      Makanan • Simple                                 │
│      Rp 18.000                          ● Aktif       │
│                                                     ⋮ │
└───────────────────────────────────────────────────────┘
```

Untuk variable product:

```text
Nasi Goreng
Makanan • Variable
3 variant
Mulai Rp 15.000
● Aktif
```

## 8.4 Product Action Menu

Menu:

- Lihat detail
- Edit
- Kelola variant
- Kelola customization
- Kelola media
- Kelola outlet
- Aktifkan / Nonaktifkan
- Hapus

Action menggunakan dummy/local state.

---

# 9. Product States

UI harus menyediakan:

### Loading

Skeleton list.

### Empty

Untuk catalog yang belum memiliki product:

```text
Belum ada produk

Tambahkan produk pertama Anda agar pelanggan dapat mulai memesan.

[ + Tambah Produk ]
```

### Search Empty

```text
Produk tidak ditemukan

Coba ubah kata pencarian atau filter Anda.
```

### Error

Karena fase ini dummy-only, error state cukup dibuat sebagai reusable state
component untuk kesiapan integrasi berikutnya.

---

# 10. Product Detail UI

## 10.1 Header

```text
← Kembali

Ayam Geprek
● Aktif

[ Edit Produk ]
```

## 10.2 Detail Navigation

```text
[ Informasi ]
[ Variant ]
[ Customization ]
[ Media ]
[ Outlet ]
```

## 10.3 Informasi

Tampilkan:

- image utama;
- nama;
- category;
- description;
- product type;
- price;
- status.

## 10.4 Variant

Hanya relevan untuk variable product.

Example:

```text
Variant

Regular       Rp 15.000      ● Aktif
Large         Rp 20.000      ● Aktif
Jumbo         Rp 25.000      ● Aktif

[ + Tambah Variant ]
```

Untuk simple product:

```text
Variant

Product ini menggunakan satu harga dan tidak memiliki variant.
```

---

# 11. Add Product UI

## 11.1 UX Model

Gunakan multi-step wizard:

```text
1. Informasi
2. Harga / Variant
3. Customization
4. Media
5. Outlet
6. Review
```

Wizard harus dapat digunakan tanpa API.

State seluruh wizard dikelola frontend.

---

# 12. Add Product — Step 1: Informasi

Field:

- Nama Produk
- Kategori
- Deskripsi
- Tipe Produk

Tipe:

```text
[ Simple Product ]
[ Variable Product ]
```

Validation UI:

- nama wajib;
- category wajib;
- type wajib;
- description optional.

---

# 13. Add Product — Step 2: Harga / Variant

## Simple

Field:

```text
Harga
Rp [____________]
```

Harga wajib.

## Variable

Tampilkan variant builder:

```text
Variant

┌─────────────────────────────────────────────┐
│ Nama       SKU          Harga        Status │
│ Regular    REG-001      Rp 15.000     Aktif │
│ Large      LRG-001      Rp 20.000     Aktif │
└─────────────────────────────────────────────┘

[ + Tambah Variant ]
```

Setiap variant mendukung:

- name;
- SKU;
- price;
- status;
- default;
- display order.

Minimal satu variant harus tersedia sebelum review untuk variable product.

---

# 14. Add Product — Step 3: Customization

Customization bersifat optional.

UI:

```text
Customization

Tambahkan pilihan yang dapat dipilih pelanggan.

[ + Tambah Modifier Group ]

Pilihan Sambal
● Wajib
Single
1 pilihan

Sambal Original    + Rp 0
Sambal Mata        + Rp 2.000
Sambal Ijo         + Rp 2.000
```

Modifier Group fields:

- name;
- description;
- selection type;
- minimum selection;
- maximum selection;
- required;
- status.

Modifier fields:

- name;
- description;
- price;
- status;
- default;
- order.

No outlet-specific customization dalam UI fase ini.

---

# 15. Add Product — Step 4: Media

UI:

```text
Foto Produk

┌─────────┐ ┌─────────┐ ┌─────────┐
│  FOTO   │ │  FOTO   │ │    +    │
│         │ │         │ │ Tambah  │
└─────────┘ └─────────┘ └─────────┘

[ Upload Foto ]

★ Foto utama
```

Dummy behavior:

- pilih dummy image;
- tambah image;
- hapus image;
- set primary;
- reorder.

Tidak ada upload ke storage pada tahap UI-only.

---

# 16. Add Product — Step 5: Outlet

Tampilkan outlet dummy:

```text
Outlet

Produk tersedia di:

☑ JualAntar Pontianak
☑ JualAntar Siantan
☐ JualAntar Sungai Raya
```

Per outlet:

- outlet name;
- assignment status;
- availability status.

UI harus membedakan:

```text
Assignment
Produk ditugaskan ke outlet

Availability
Produk sedang tersedia/tidak tersedia
```

---

# 17. Add Product — Step 6: Review

Review seluruh data:

```text
Review Product

Informasi
Ayam Geprek
Makanan
Simple
Rp 18.000

Customization
Pilihan Sambal
3 pilihan

Media
3 foto

Outlet
2 outlet

[ Kembali ]
[ Simpan Produk ]
```

Pada fase dummy:

`Simpan Produk` menambahkan product baru ke local state dan mengarahkan ke
Product Detail atau Product List.

---

# 18. Category Management

Route:

`/catalog/categories`

UI:

```text
Kategori

[ 🔍 Cari kategori... ]             [ + Tambah Kategori ]

Makanan                    ● Aktif       ⋮
Minuman                    ● Aktif       ⋮
Dessert                    ● Aktif       ⋮
```

Actions:

- create;
- edit;
- activate;
- deactivate;
- delete;
- reorder.

Karena backend menyediakan `display_order` dan reorder endpoint, gunakan
drag-and-drop interaction pada UI.

Dummy interaction:

- reorder mengubah local order;
- status berubah secara lokal.

---

# 19. Modifier Management

## 19.1 Important API Boundary

Pada backend yang terverifikasi, modifier group berada sebagai child dari
Product:

```text
Product
  └── Modifier Group
        └── Modifier
```

Backend route yang tersedia juga berada pada:

`/products/{product}/modifier-groups`

Karena itu, fase UI-only **tidak boleh mengasumsikan backend global modifier
CRUD sudah tersedia**.

## 19.2 Recommended UI

Gunakan Modifier page sebagai **management view berbasis product**.

Contoh:

```text
Modifier

[ Pilih Product ▼ ]

Pilihan Sambal
● Aktif

Sambal Original     Rp 0
Sambal Mata         Rp 2.000
Sambal Ijo          Rp 2.000
```

User dapat:

- memilih product;
- melihat modifier groups;
- membuat group;
- mengubah group;
- menambah modifier;
- mengubah modifier;
- mengaktifkan/nonaktifkan;
- mengatur order.

Semua menggunakan dummy data.

---

# 20. Dummy Data Requirements

Dummy data harus dibuat pada layer data terpisah dari component.

Recommended:

```text
modules/catalog/data/
    products.ts
    categories.ts
    variants.ts
    modifiers.ts
    outlets.ts
    media.ts
```

Atau satu mock service:

```text
modules/catalog/mocks/
    catalog.mock.ts
```

Component tidak boleh hard-code daftar product langsung di JSX.

---

# 21. Domain Types

Frontend harus memiliki type/interface yang mencerminkan backend.

Recommended types:

```ts
type ProductType = 'simple' | 'variable'

type CatalogStatus = 'active' | 'inactive'

interface CatalogCategory {
  id: string
  name: string
  description?: string
  status: CatalogStatus
  displayOrder: number
}

interface Product {
  id: string
  categoryId: string
  name: string
  description?: string
  productType: ProductType
  price?: number
  status: CatalogStatus
  displayOrder: number
}

interface ProductVariant {
  id: string
  productId: string
  name: string
  sku?: string
  price: number
  status: CatalogStatus
  isDefault: boolean
  displayOrder: number
}

interface ProductMedia {
  id: string
  productId: string
  url: string
  altText?: string
  mimeType: string
  fileSize?: number
  isPrimary: boolean
  displayOrder: number
}

interface ModifierGroup {
  id: string
  productId: string
  name: string
  description?: string
  selectionType: 'single' | 'multiple'
  minSelection: number
  maxSelection?: number
  isRequired: boolean
  status: CatalogStatus
  displayOrder: number
}

interface Modifier {
  id: string
  modifierGroupId: string
  name: string
  description?: string
  price: number
  status: CatalogStatus
  isDefault?: boolean
  displayOrder: number
}
```

Type naming dapat disesuaikan dengan konvensi repository frontend ketika
implementasi actual dimulai.

---

# 22. Component Architecture

Recommended structure:

```text
modules/
└── catalog/
    ├── components/
    │   ├── catalog-header
    │   ├── catalog-tabs
    │   ├── product-list
    │   ├── product-card
    │   ├── product-filters
    │   ├── product-actions
    │   ├── product-detail
    │   ├── product-form
    │   ├── product-wizard
    │   ├── variant-editor
    │   ├── media-manager
    │   ├── modifier-group-editor
    │   ├── modifier-editor
    │   ├── outlet-assignment
    │   ├── category-list
    │   ├── category-form
    │   └── catalog-empty-state
    │
    ├── data/
    │   ├── products.ts
    │   ├── categories.ts
    │   ├── modifiers.ts
    │   ├── outlets.ts
    │   └── media.ts
    │
    ├── types/
    │   └── catalog.ts
    │
    └── utils/
        ├── format-currency.ts
        └── catalog-mappers.ts
```

Actual path harus mengikuti convention repository frontend setelah codebase
dapat diakses.

---

# 23. State Management

Fase UI-only:

- local React state atau state management yang sudah digunakan repository;
- dummy data sebagai initial state;
- create/update/delete/status/reorder mengubah local state;
- page refresh boleh mengembalikan dummy state;
- tidak perlu persistence.

Pastikan UI state dan future server state dipisahkan.

Recommended conceptual boundary:

```text
UI Components
      ↓
Catalog State / View Model
      ↓
Mock Repository
      ↓
Dummy Data
```

Pada fase integrasi API:

```text
UI Components
      ↓
Catalog State / Query Hooks
      ↓
API Client
      ↓
jualantar-api
```

Dengan boundary tersebut, komponen UI tidak perlu direwrite total saat API
nyata dihubungkan.

---

# 24. Responsive Behavior

Karena Merchant App digunakan pada perangkat mobile, UI harus mobile-first.

## Mobile

Product item:

- compact card/list;
- action menu memakai bottom sheet / dropdown yang sesuai;
- filter memakai sheet;
- wizard satu step per layar;
- sticky action footer pada wizard.

## Desktop

- content width terkontrol;
- list menggunakan horizontal row/card;
- filter tampil inline;
- wizard dapat memakai centered content panel.

---

# 25. Visual Direction

Gunakan style yang konsisten dengan Merchant App existing.

Karakteristik:

- clean;
- modern;
- white/light surface;
- rounded cards;
- subtle border;
- red JualAntar accent untuk primary action;
- status menggunakan chip/badge;
- hierarchy typography jelas;
- spacing lega;
- icon sederhana;
- jangan membuat dashboard style yang terlalu padat.

Screenshot `/catalog` saat ini menjadi starting point:

```text
Katalog
Kelola katalog yang dijual di outlet Anda.

[ + Tambah ]

[ Empty State ]
```

Desain baru harus berkembang dari pola tersebut menjadi workspace Catalog
yang nyata.

---

# 26. Interaction Requirements

## Product

- click row/card → detail;
- click add → wizard;
- click edit → edit form;
- click status → confirmation lalu local update;
- click delete → confirmation lalu local removal;
- search → filter local;
- filter → filter local;
- reorder → local state update.

## Category

- create;
- edit;
- status;
- delete;
- reorder.

## Variant

- create;
- edit;
- status;
- delete;
- reorder.

## Modifier

- create group;
- edit group;
- create modifier;
- edit modifier;
- status;
- delete;
- reorder.

## Media

- add;
- delete;
- set primary;
- reorder.

## Outlet

- assign;
- unassign;
- activate/deactivate;
- availability toggle.

---

# 27. Validation Requirements

UI validation harus meniru constraint backend yang sudah diketahui.

## Product

- name required;
- name max 150;
- category required;
- product type required;
- simple product membutuhkan price;
- variable product tidak menggunakan master price;
- price >= 0.

## Variant

- name required;
- name max 100;
- SKU optional;
- SKU max 50;
- price required;
- price >= 0.

## Category

- name required;
- name max 100.

## Modifier Group

- name required;
- name max 100;
- selection type = single/multiple;
- min selection >= 0;
- max selection >= min;
- required group memiliki min selection >= 1.

## Modifier

- name required;
- name max 100;
- price >= 0.

---

# 28. Confirmation Dialogs

Gunakan confirmation dialog untuk destructive action:

### Delete Product

```text
Hapus produk?

Produk "Ayam Geprek" akan dihapus dari katalog.

[Batal] [Hapus]
```

### Deactivate

```text
Nonaktifkan produk?

Produk tidak akan aktif pada master catalog.

[Batal] [Nonaktifkan]
```

Text harus menjelaskan dampak action.

---

# 29. Accessibility

Minimum:

- keyboard navigation;
- visible focus state;
- button memiliki accessible label;
- menu tidak hanya mengandalkan icon;
- status tidak hanya dibedakan berdasarkan warna;
- modal/sheet memiliki title;
- form field memiliki label;
- error form terhubung ke field.

---

# 30. Performance

Untuk dummy implementation:

- jangan membuat image besar tanpa kebutuhan;
- list product menggunakan stable keys;
- modal/sheet tidak perlu mounted berlebihan;
- search/filter menggunakan state yang efisien.

Virtualization belum diperlukan untuk dummy dataset kecil.

---

# 31. Testing

## Component Tests

Minimal:

- product card;
- product filter;
- category list;
- variant editor;
- modifier group editor;
- media manager;
- outlet assignment;
- add product wizard.

## Behavior Tests

Harus dapat memverifikasi:

1. search product;
2. filter product;
3. add simple product;
4. add variable product;
5. add variant;
6. add modifier group;
7. add modifier;
8. add media;
9. set primary media;
10. assign outlet;
11. deactivate product;
12. delete product;
13. reorder item.

## Validation Tests

- simple product tanpa harga;
- variable product dengan master price;
- variable product tanpa variant;
- invalid modifier selection;
- negative price.

---

# 32. API Readiness

Walaupun belum memakai API, structure harus disiapkan untuk endpoint berikut.

## Category

```text
GET    /api/v1/merchant/catalog/categories
POST   /api/v1/merchant/catalog/categories
GET    /api/v1/merchant/catalog/categories/{category}
PATCH  /api/v1/merchant/catalog/categories/{category}
DELETE /api/v1/merchant/catalog/categories/{category}
POST   /api/v1/merchant/catalog/categories/{category}/activate
POST   /api/v1/merchant/catalog/categories/{category}/deactivate
PUT    /api/v1/merchant/catalog/categories/order
```

## Product

```text
GET    /api/v1/merchant/catalog/products
POST   /api/v1/merchant/catalog/products
GET    /api/v1/merchant/catalog/products/{product}
PATCH  /api/v1/merchant/catalog/products/{product}
DELETE /api/v1/merchant/catalog/products/{product}
POST   /api/v1/merchant/catalog/products/{product}/activate
POST   /api/v1/merchant/catalog/products/{product}/deactivate
PUT    /api/v1/merchant/catalog/products/order
```

## Variant

```text
GET    /products/{product}/variants
POST   /products/{product}/variants
GET    /products/{product}/variants/{variant}
PATCH  /products/{product}/variants/{variant}
DELETE /products/{product}/variants/{variant}
POST   /products/{product}/variants/{variant}/activate
POST   /products/{product}/variants/{variant}/deactivate
PUT    /products/{product}/variants/order
```

## Media

```text
GET  /products/{product}/media
POST /products/{product}/media/upload-url
POST /products/{product}/media
DELETE /products/{product}/media/{media}
POST /products/{product}/media/{media}/primary
PUT  /products/{product}/media/order
```

## Modifier Group / Modifier

```text
GET/POST       /products/{product}/modifier-groups
PATCH/DELETE   /products/{product}/modifier-groups/{group}
POST           /products/{product}/modifier-groups/{group}/activate
POST           /products/{product}/modifier-groups/{group}/deactivate
PUT            /products/{product}/modifier-groups/order

GET/POST       /products/{product}/modifier-groups/{group}/modifiers
PATCH/DELETE   /products/{product}/modifier-groups/{group}/modifiers/{modifier}
POST           /products/{product}/modifier-groups/{group}/modifiers/{modifier}/activate
POST           /products/{product}/modifier-groups/{group}/modifiers/{modifier}/deactivate
PUT            /products/{product}/modifier-groups/{group}/modifiers/order
```

## Product Outlet

```text
GET    /products/{product}/outlets
POST   /products/{product}/outlets
PUT    /products/{product}/outlets
DELETE /products/{product}/outlets/{outlet}
POST   /products/{product}/outlets/{outlet}/activate
POST   /products/{product}/outlets/{outlet}/deactivate
POST   /products/{product}/outlets/{outlet}/availability
```

Endpoint naming dan hierarchy di atas mengikuti route Catalog API yang telah
diverifikasi.

---

# 33. Dummy Data Dataset

Gunakan dataset yang cukup realistis untuk memperlihatkan seluruh state.

Recommended Products:

```text
1. Ayam Geprek
   Category: Makanan
   Type: Simple
   Price: Rp 18.000
   Status: Active

2. Nasi Goreng Spesial
   Category: Makanan
   Type: Variable
   Variants:
   - Regular Rp 15.000
   - Large Rp 20.000
   - Jumbo Rp 25.000

3. Es Teh Manis
   Category: Minuman
   Type: Simple
   Price: Rp 5.000

4. Kopi Susu Gula Aren
   Category: Minuman
   Type: Variable
   Variants:
   - Regular Rp 12.000
   - Large Rp 15.000
```

Categories:

```text
Makanan
Minuman
Dessert
Snack
```

Customization examples:

```text
Pilihan Sambal
- Sambal Original      Rp 0
- Sambal Mata          Rp 2.000
- Sambal Ijo           Rp 2.000

Tambahan
- Telur                Rp 4.000
- Keju                 Rp 5.000
- Extra Chicken        Rp 8.000
```

Outlets:

```text
JualAntar Pontianak
JualAntar Siantan
JualAntar Sungai Raya
```

Dataset harus memiliki kombinasi:

- active/inactive;
- simple/variable;
- dengan/tanpa media;
- dengan/tanpa customization;
- assigned/unassigned outlet.

Dengan demikian semua UI state dapat diuji tanpa API.

---

# 34. Definition of Done

Implementasi UI dianggap selesai apabila:

### Catalog

- [ ] `/catalog` tidak lagi hanya empty state statis.
- [ ] Product menjadi default workspace.
- [ ] Category dan Modifier memiliki navigation yang jelas.

### Product

- [ ] Product list tampil dengan dummy data.
- [ ] Search berjalan.
- [ ] Filter berjalan.
- [ ] Product detail tersedia.
- [ ] Product create tersedia.
- [ ] Product edit tersedia.
- [ ] Product status tersedia.
- [ ] Delete tersedia.
- [ ] Reorder tersedia.

### Variant

- [ ] Variable product dapat memiliki dummy variants.
- [ ] Add/edit/delete/status/reorder tersedia.

### Customization

- [ ] Modifier group dapat dibuat di wizard/detail.
- [ ] Modifier dapat dibuat/diedit.
- [ ] Selection rule dapat dikonfigurasi.

### Media

- [ ] Dummy image list tersedia.
- [ ] Add/delete tersedia.
- [ ] Set primary tersedia.
- [ ] Reorder tersedia.

### Outlet

- [ ] Dummy outlet tersedia.
- [ ] Assignment UI tersedia.
- [ ] Availability UI tersedia.

### Category

- [ ] CRUD UI tersedia.
- [ ] Status tersedia.
- [ ] Reorder tersedia.

### Technical

- [ ] Dummy data tidak hard-coded di JSX.
- [ ] Domain types tersedia.
- [ ] Komponen dapat menerima data melalui props/state boundary.
- [ ] Tidak ada request API nyata.
- [ ] Structure siap diganti dengan API client kemudian.
- [ ] Responsive mobile dan desktop.
- [ ] Basic accessibility terpenuhi.
- [ ] Unit/component tests untuk critical interactions tersedia.

---

# 35. Recommended Implementation Sequence

Urutan implementasi:

```text
1. Catalog shell
      ↓
2. Product list
      ↓
3. Product detail
      ↓
4. Category management
      ↓
5. Add Product wizard
      ↓
6. Variant editor
      ↓
7. Customization editor
      ↓
8. Media manager
      ↓
9. Outlet assignment
      ↓
10. Local CRUD/state behavior
      ↓
11. Responsive refinement
      ↓
12. Tests
```

Alasan urutan tersebut: Product merupakan root domain entity untuk sebagian
besar fitur Catalog, sehingga Product UI sebaiknya menjadi fondasi sebelum
Variant, Media, Modifier, dan Outlet diperluas.

---

# 36. Future API Integration Plan

Setelah UI dummy selesai, tahap berikutnya adalah mengganti mock repository
dengan API repository:

```text
Before

Component
   ↓
Mock Catalog Repository
   ↓
Dummy Data


After

Component
   ↓
Catalog Query/Mutation Hooks
   ↓
API Client
   ↓
jualantar-api
```

Migrasi tidak boleh memindahkan logic API langsung ke komponen.

Targetnya adalah:

> UI component tidak mengetahui apakah sumber data berasal dari dummy data
> atau API.

---

# 37. Important Architectural Decisions

## 37.1 Product-first

Catalog workspace berpusat pada Product karena Product menjadi parent
untuk:

- Variant;
- Media;
- Modifier Group;
- Outlet Assignment.

## 37.2 No Fake Variant

Simple product tidak menggunakan fake/default variant hanya untuk menyamakan
UI dengan variable product.

## 37.3 Modifier Is Product Child

Customization tetap dipresentasikan sebagai:

```text
Product
  └── Modifier Group
        └── Modifier
```

## 37.4 No Global Modifier CRUD Assumption

Jangan mendesain frontend seolah backend saat ini memiliki global
`/modifier-groups` endpoint. UI global modifier management harus dipahami
sebagai view/UX layer atas product-scoped modifier API sampai backend
menyediakan global resource.

## 37.5 Dummy First

Tidak ada ketergantungan API untuk fase UI pertama.

Dummy data digunakan untuk memastikan layout, state, interaction dan component
architecture matang sebelum network integration dilakukan.

---

# 38. Final UX Structure

Target akhir module:

```text
KATALOG
│
├── Produk
│   ├── List
│   ├── Search / Filter
│   ├── Add Product
│   │   ├── Informasi
│   │   ├── Harga / Variant
│   │   ├── Customization
│   │   ├── Media
│   │   ├── Outlet
│   │   └── Review
│   │
│   └── Product Detail
│       ├── Informasi
│       ├── Variant
│       ├── Customization
│       ├── Media
│       └── Outlet
│
├── Kategori
│   ├── List
│   ├── Create
│   ├── Edit
│   ├── Status
│   └── Reorder
│
└── Modifier
    └── Product-scoped management view
```

---

# 39. Implementation Principle

Prinsip utama module ini:

> **Bangun UI Catalog seolah-olah API sudah siap, tetapi gunakan dummy
> repository sehingga frontend dapat divalidasi lebih dahulu tanpa coupling
> dengan backend.**

Dengan pendekatan tersebut, implementasi UI dapat berjalan sekarang,
sedangkan pekerjaan integrasi API pada tahap berikutnya terutama menjadi
pekerjaan penggantian data source dan mutation layer, bukan redesain UI.

# 40. Backend-Exact UI Data Contract

Bagian ini menjadi **aturan wajib** untuk implementasi UI Catalog.

Tujuannya adalah membuat dummy data frontend yang mengikuti bentuk response
dan field backend API secara langsung, sehingga ketika API diaktifkan pada tahap
integrasi berikutnya, developer tidak perlu mengubah kontrak data UI.

## 40.1 Prinsip

Gunakan:

```text
Backend Resource
      ↓
Frontend Type
      ↓
Dummy Data
      ↓
UI Component
```

Bukan:

```text
UI Design
  ↓
Custom frontend fields
  ↓
Nanti dipetakan ke API
```

Artinya field dummy harus mengikuti **nama dan semantic backend**.

Jangan membuat field baru seperti:

- `image`
- `categoryName`
- `isActive`
- `variantCount`
- `priceLabel`
- `available`
- `modifierType`

sebagai source-of-truth domain object apabila field tersebut tidak ada pada
API resource.

Field turunan boleh dibuat di presentation layer, tetapi harus dihasilkan dari
data API/domain.

---

# 41. Exact Product Contract

Backend `ProductResource` menghasilkan:

```json
{
    "id": "uuid",
    "category_id": "uuid",
    "name": "string",
    "description": "string|null",
    "product_type": "simple|variable",
    "price": "number|null",
    "status": "string",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null"
}
```

Frontend dummy `Product` harus menggunakan field tersebut.

Contoh:

```ts
const product: Product = {
  id: 'prd-001',
  category_id: 'cat-001',
  name: 'Ayam Geprek',
  description: 'Ayam goreng crispy dengan sambal khas JualAntar.',
  product_type: 'simple',
  price: 18000,
  status: 'active',
  display_order: 0,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-20T08:00:00Z',
}
```

Jangan mengubah menjadi:

```ts
{
  productId,
  categoryId,
  title,
  isActive,
  amount
}
```

di domain/mock layer.

---

# 42. Exact Category Contract

Backend `CatalogCategoryResource` menghasilkan:

```json
{
    "id": "uuid",
    "name": "string",
    "description": "string|null",
    "status": "string",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null"
}
```

Dummy data harus mengikuti struktur tersebut.

```ts
const category: CatalogCategory = {
  id: 'cat-001',
  name: 'Makanan',
  description: 'Menu makanan utama.',
  status: 'active',
  display_order: 0,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-20T08:00:00Z',
}
```

---

# 43. Exact Product Detail Contract

Backend `ProductDetailResource` adalah gabungan:

```text
ProductResource
+
category
+
variants
+
media
+
modifier_groups
```

Struktur frontend detail:

```ts
interface ProductDetail extends Product {
  category?: CatalogCategory
  variants?: ProductVariant[]
  media?: ProductMedia[]
  modifier_groups?: ProductModifierGroup[]
}
```

Nama relation harus tetap:

```text
category
variants
media
modifier_groups
```

bukan mengganti menjadi:

```text
categoryData
productVariants
images
customizations
```

Presentation label boleh menggunakan bahasa UX, tetapi domain property tetap
mengikuti API.

---

# 44. Exact Product Variant Contract

Backend `ProductVariantResource`:

```json
{
    "id": "uuid",
    "name": "string",
    "sku": "string|null",
    "price": "number",
    "status": "string",
    "is_default": "boolean",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null"
}
```

Dummy:

```ts
const variant: ProductVariant = {
  id: 'var-001',
  name: 'Regular',
  sku: 'REG-001',
  price: 15000,
  status: 'active',
  is_default: true,
  display_order: 0,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-20T08:00:00Z',
}
```

Perhatikan:

`is_default` harus dipakai, bukan `isPrimary`.

---

# 45. Exact Product Media Contract

Backend `ProductMediaResource`:

```json
{
    "id": "uuid",
    "url": "string|null",
    "alt_text": "string|null",
    "mime_type": "string",
    "file_size": "number|null",
    "is_primary": "boolean",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null"
}
```

Dummy:

```ts
const media: ProductMedia = {
  id: 'med-001',
  url: '/images/catalog/ayam-geprek-01.jpg',
  alt_text: 'Ayam Geprek',
  mime_type: 'image/jpeg',
  file_size: 245760,
  is_primary: true,
  display_order: 0,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-20T08:00:00Z',
}
```

Jangan membuat:

```ts
{
  image_url,
  primary,
  size
}
```

sebagai domain mock.

---

# 46. Exact Modifier Group Contract

Backend `ProductModifierGroupResource`:

```json
{
    "id": "uuid",
    "name": "string",
    "description": "string|null",
    "selection_type": "single|multiple",
    "min_selection": "number",
    "max_selection": "number|null",
    "is_required": "boolean",
    "status": "string",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null",
    "modifiers": []
}
```

Dummy:

```ts
const modifierGroup: ProductModifierGroup = {
  id: 'mgr-001',
  name: 'Pilihan Sambal',
  description: 'Pilih sambal untuk menu.',
  selection_type: 'single',
  min_selection: 1,
  max_selection: 1,
  is_required: true,
  status: 'active',
  display_order: 0,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-20T08:00:00Z',
  modifiers: [],
}
```

UI label seperti:

```text
Wajib
Single
1 pilihan
```

harus dihitung dari field backend.

---

# 47. Exact Modifier Contract

Backend `ProductModifierResource`:

```json
{
    "id": "uuid",
    "name": "string",
    "description": "string|null",
    "price": "number",
    "is_default": "boolean",
    "status": "string",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null"
}
```

Dummy:

```ts
const modifier: ProductModifier = {
  id: 'mod-001',
  name: 'Sambal Mata',
  description: 'Sambal matah pedas.',
  price: 2000,
  is_default: false,
  status: 'active',
  display_order: 1,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-20T08:00:00Z',
}
```

---

# 48. Exact Outlet Assignment Contract

Backend `OutletProductAssignmentResource`:

```json
{
    "id": "uuid",
    "product_id": "uuid",
    "outlet_id": "uuid",
    "outlet": {
        "id": "uuid",
        "name": "string",
        "status": "string"
    },
    "status": "string",
    "availability_status": "string",
    "unavailable_reason": "string|null",
    "display_order": "number",
    "created_at": "ISO-8601|null",
    "updated_at": "ISO-8601|null"
}
```

Frontend harus mempertahankan relation nested:

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
  status: string
  availability_status: string
  unavailable_reason?: string | null
  display_order: number
  created_at?: string | null
  updated_at?: string | null
}
```

Jangan menyatukan:

```text
status
availability_status
```

menjadi satu boolean.

Keduanya merepresentasikan state berbeda.

---

# 49. Exact Enum / Value Handling

Frontend harus menyimpan raw backend values.

Contoh:

```text
product_type:
simple
variable
```

```text
selection_type:
single
multiple
```

Status disimpan sesuai value enum yang dikirim backend.

UI dapat memiliki label mapper:

```ts
const productTypeLabel = {
  simple: 'Produk Sederhana',
  variable: 'Produk dengan Variant',
}
```

tetapi value state tetap:

```ts
'simple'
'variable'
```

Bukan:

```ts
'Produk Sederhana'
'Produk Variable'
```

---

# 50. Exact Pagination Contract

Product/category/variant/media/outlet assignment index API menggunakan pagination.

UI mock harus mensimulasikan bentuk:

```json
{
    "data": [],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 4,
        "last_page": 1
    }
}
```

Mock repository sebaiknya mengembalikan:

```ts
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
```

Dengan demikian query hook nantinya dapat menggunakan response mock dan
response API dengan kontrak yang sama.

---

# 51. Exact Query Parameters

Product list mock harus menerima parameter yang sama dengan backend:

```ts
interface ProductIndexParams {
  search?: string
  category_id?: string
  status?: string
  product_type?: 'simple' | 'variable'
  sort?: 'name' | 'display_order' | 'created_at'
  order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}
```

Category list:

```ts
interface CategoryIndexParams {
  search?: string
  status?: string
  sort?: 'name' | 'display_order' | 'created_at'
  order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}
```

Search/filter di UI harus memetakan ke parameter tersebut.

---

# 52. UI-Derived Data

Data turunan diperbolehkan, tetapi tidak boleh mengubah domain contract.

Contoh:

```ts
const variantCount = productDetail.variants?.length ?? 0
```

atau:

```ts
const categoryName = product.category?.name
```

atau:

```ts
const primaryMedia =
  productDetail.media?.find((item) => item.is_primary)
```

Nilai tersebut merupakan derived view data.

Jangan disimpan sebagai field backend-style baru di mock entity.

---

# 53. Dummy Repository Contract

Mock repository harus meniru operation backend:

```ts
catalogProducts.list(params)
catalogProducts.get(id)
catalogProducts.create(payload)
catalogProducts.update(id, payload)
catalogProducts.delete(id)
catalogProducts.activate(id)
catalogProducts.deactivate(id)
catalogProducts.reorder(items)
```

Dan pola serupa:

```ts
catalogCategories
catalogProductVariants
catalogProductMedia
catalogModifierGroups
catalogModifiers
catalogProductOutlets
```

Mock method names boleh berbeda sesuai convention codebase, tetapi operation
boundary harus merefleksikan API.

---

# 54. Important Integration Rule

Saat API integration dilakukan, developer seharusnya dapat melakukan:

```text
MockCatalogRepository
        ↓
ApiCatalogRepository
```

tanpa mengubah:

```text
ProductCard
ProductList
ProductDetail
ProductWizard
VariantEditor
MediaManager
ModifierEditor
OutletAssignment
CategoryList
```

secara substantif.

Perubahan yang diharapkan terutama:

- repository/provider;
- query/mutation layer;
- loading/error handling;
- authentication;
- response normalization bila diperlukan.

---

# 55. Backend-Exact Data Acceptance Criteria

Implementasi UI dinyatakan sesuai contract apabila:

- [ ] setiap domain entity memiliki field yang sesuai resource backend;
- [ ] tidak ada nama field domain custom yang menggantikan field backend;
- [ ] `product_type` memakai `simple|variable`;
- [ ] `price` product dapat `null`;
- [ ] variant menggunakan `is_default`;
- [ ] media menggunakan `is_primary`;
- [ ] modifier menggunakan `is_default`;
- [ ] modifier group menggunakan `selection_type`;
- [ ] modifier group menggunakan `min_selection`;
- [ ] modifier group menggunakan `max_selection`;
- [ ] modifier group menggunakan `is_required`;
- [ ] outlet assignment memisahkan `status` dan `availability_status`;
- [ ] nested `category`, `variants`, `media`, `modifier_groups` tersedia pada
      product detail;
- [ ] pagination menggunakan `data` + `meta`;
- [ ] list filters menggunakan parameter backend;
- [ ] mock CRUD mengikuti operation backend;
- [ ] UI labels hanya merupakan presentation layer;
- [ ] tidak ada request network pada fase UI-only.
