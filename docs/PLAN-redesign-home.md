# PLAN.md — Redesign Home / Beranda JualAntar Merchant

## 1. Tujuan

Membangun ulang halaman **Home/Beranda** pada frontend `jualantar-merchant` agar mengikuti referensi UI yang diberikan: modern, mudah dipahami, hierarki informasi jelas, mobile-first, serta mampu menyesuaikan isi Home berdasarkan **jumlah outlet milik merchant owner**.

Scope implementasi ini berfokus pada **Home module dan UI state berbasis jumlah outlet**. Data bisnis seperti pesanan, penjualan, produk, rating, chart, dan aktivitas menggunakan **dummy data** terlebih dahulu.

### Kebutuhan utama

- Owner dengan **0 outlet** mendapat empty/setup state.
- Owner dengan **1 outlet** mendapat Home single-outlet.
- Owner dengan **>1 outlet** mendapat Home multi-outlet dan outlet selector.
- Owner dapat masuk ke konteks operasional outlet.
- Role non-owner tidak diubah dalam pekerjaan ini kecuali perubahan shared component diperlukan agar tidak regresif.
- Tidak membuat backend endpoint baru untuk dashboard pada phase ini.

---

## 2. Hasil Analisis Codebase

Repository yang menjadi basis analisis:

`https://github.com/Rumahkodingku/jualantar-merchant`

### 2.1 Stack yang digunakan

Project saat ini menggunakan:

- React 19
- React Router 7
- TypeScript
- TanStack Query 5
- Zustand 5
- Tailwind CSS 4
- shadcn
- Lucide React
- Recharts
- Axios
- Zod
- Vitest

### 2.2 Architecture

Project menggunakan feature/module-based architecture.

Struktur yang menjadi acuan:

```text
app/
├── components/
├── hooks/
├── stores/
├── lib/
├── modules/
│   └── <module-name>/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── schemas/
│       ├── types/
│       ├── utils/
│       └── index.ts
└── routes.ts
```

Aturan penting:

- Server state menggunakan TanStack Query.
- Global UI state menggunakan Zustand hanya bila memang lintas module.
- API access berada di `services/`.
- Module menggunakan Axios instance dari `app/lib/api.ts`.
- Route entry tetap tipis.
- Shared layer tidak boleh bergantung pada module.
- Antar-module hanya menggunakan public API melalui `index.ts`.
- Jangan melakukan deep import ke internal module lain.
- Test unit/component mengikuti pola co-located.

### 2.3 Existing Home Route

Pada `app/routes.ts`, Home sudah menjadi index route protected:

```text
index("modules/home/routes/home-route.tsx")
```

Route tersebut berada di dalam protected app shell dan merchant registration guard.

### 2.4 Existing Home Flow

`app/modules/home/pages/home-page.tsx` saat ini menangani:

- session user;
- owner vs employee;
- authorization loading;
- merchant registration;
- draft registration;
- revision required;
- approved merchant;
- employee home;
- forbidden state.

Untuk merchant yang sudah approved, component:

```text
MerchantHome
```

digunakan.

### 2.5 Existing MerchantHome

`app/modules/home/components/merchant-home.tsx` saat ini:

- menggunakan `useOperationsSummary()`;
- menggunakan `useOperationalOutlets({ per_page: 1 })`;
- mengambil outlet count dari:

```ts
outlets.data?.meta.total
```

- menampilkan business name;
- menampilkan merchant status;
- menampilkan jumlah outlet;
- menyediakan shortcut:
    - Pesanan
    - Produk
    - Promo
    - Keuangan
    - Pengaturan.

Dengan demikian, **mekanisme untuk mengetahui jumlah outlet sebenarnya sudah tersedia dan tidak perlu membuat endpoint outlet-count baru**.

### 2.6 Existing Outlet API

`merchant-operations` sudah memiliki API:

```text
GET /merchant/operations
GET /merchant/operations/profile
GET /merchant/operations/outlets
GET /merchant/operations/outlets/:outlet
GET /merchant/operations/outlets/:outlet/operating-hours
GET /merchant/operations/outlets/:outlet/service-area
GET /merchant/operations/outlets/:outlet/availability
GET /merchant/operations/outlets/:outlet/users
```

Query yang tersedia:

```ts
useOperationsSummary()
useOperationalOutlets(params)
useOperationalOutlet(outletId)
useOutletEmployees(outletId)
useOperatingHours(outletId)
useServiceArea(outletId)
useAvailability(outletId)
```

Outlet list memiliki pagination metadata:

```ts
meta.total
meta.current_page
meta.per_page
meta.last_page
```

### 2.7 Existing Outlet Type

`OperationalOutlet` sudah menyediakan data:

```ts
type OperationalOutlet = {
    id: string
    merchant_id: string
    name: string
    phone: string | null
    email: string | null
    address: string
    province_id: number
    regency_id: number
    district_id: number
    village_id: number
    postal_code: string
    latitude: number | string
    longitude: number | string
    service_area_type: OutletServiceAreaType
    service_radius_km: number | string | null
    operating_hours: OperatingHours | null
    photos: string[]
    photos_url: (string | null)[]
    status: OutletStatus
    geography: GeographyLabel | null
    created_at: string | null
    updated_at: string | null
}
```

Data ini cukup untuk membuat outlet card dan outlet selector tanpa membuat API baru.

---

# 3. Authorization yang Harus Dipertahankan

Frontend sudah memiliki authorization architecture.

Konsepnya:

```text
/auth/me
├── global roles
├── global permissions
└── outlet_assignments
    ├── outlet_id
    └── role
```

Role:

```text
merchant
outlet_manager
outlet_staff
```

Owner adalah global role:

```text
merchant
```

Outlet role:

```text
outlet_manager
outlet_staff
```

### Aturan penting

Jangan melakukan:

```ts
role === "merchant"
```

di component baru untuk mengambil keputusan authorization.

Gunakan public API authorization:

```text
useAuthorization()
useOutletAuthorization()
useOperationsPermissions()
```

Authorization frontend hanya mengatur:

- discoverability;
- navigation;
- route UX;
- action visibility.

API tetap menjadi security boundary.

### Konteks outlet tidak boleh mengubah role

Ketika owner memilih outlet tertentu:

```text
merchant
```

tetap:

```text
merchant
```

Pemilihan outlet hanya mengubah **dashboard context**, bukan authorization role.

---

# 4. Referensi UI

Referensi yang diberikan menunjukkan Home Merchant dengan visual mobile-first.

Elemen utama:

1. Header:
    - logo JualAntar Merchant;
    - notification;
    - profile/avatar.

2. Welcome:
    - "Selamat datang,"
    - nama usaha;
    - greeting.

3. Outlet card:
    - foto outlet;
    - nama outlet;
    - status buka;
    - alamat;
    - arrow.

4. Operational CTA:
    - status outlet;
    - pesan;
    - tombol "Masuk ke Operasional".

5. Pesanan Hari Ini:
    - Pesanan Baru;
    - Diproses;
    - Selesai.

6. Ringkasan Hari Ini:
    - Total Pesanan;
    - Total Penjualan;
    - Produk Terjual;
    - Rating Outlet.

7. Ringkasan 7 Hari Terakhir:
    - sales chart;
    - tanggal;
    - nilai penjualan.

8. Menu Utama:
    - Pesanan;
    - Produk;
    - Promo;
    - Keuangan;
    - Jam Operasional;
    - Pengaturan.

9. Pesanan Terbaru.

10. Produk Terlaris Hari Ini.

11. Aktivitas Terbaru.

12. JualAntar Academy.

13. Bantuan.

14. Bottom navigation:

- Beranda;
- Pesanan;
- FAB `+`;
- Keuangan;
- Pengaturan.

---

# 5. Prinsip UX Utama

## 5.1 Home harus mengetahui jumlah outlet

Jumlah outlet merupakan state penting dalam menentukan UI.

Gunakan:

```ts
const outlets = useOperationalOutlets(...)
const outletTotal = outlets.data?.meta.total ?? 0
```

Tidak boleh:

```ts
const outletTotal = 1
```

atau hardcoded lainnya.

## 5.2 State berdasarkan jumlah outlet

| Kondisi     | UI                      |
| ----------- | ----------------------- |
| `0 outlet`  | Setup / empty state     |
| `1 outlet`  | Single outlet dashboard |
| `>1 outlet` | Multi outlet dashboard  |

---

# 6. Business Context vs Outlet Context

Gunakan dua konteks:

```text
Merchant / Business Context
│
├── Semua Outlet
│   ├── aggregate KPI
│   ├── aggregate sales
│   └── outlet performance
│
└── Outlet Context
    └── Outlet tertentu
        ├── KPI outlet
        ├── order outlet
        ├── product outlet
        └── operational CTA
```

Pemilihan outlet tidak boleh mengubah:

- user role;
- permissions;
- outlet assignment;
- session.

Pemilihan outlet hanya menentukan scope data Home.

---

# 7. Home Context Model

Buat type khusus:

```ts
type HomeOutletContext =
    | {
          type: "none"
      }
    | {
          type: "single"
          outletId: string
      }
    | {
          type: "all"
          outletIds: string[]
      }
    | {
          type: "selected"
          outletId: string
          outletIds: string[]
      }
```

### Aturan derivasi

```text
0 outlet
→ none

1 outlet
→ single

>1 outlet
→ all
```

Saat user memilih outlet:

```text
all
→ selected
```

Saat user kembali:

```text
selected
→ all
```

---

# 8. State Management

Jangan membuat Zustand store hanya untuk outlet selector Home.

Prioritas:

```text
Server state
→ TanStack Query

Local UI state
→ React state

Navigational state / deep-linkable context
→ URL search params

Global UI state
→ Zustand
```

Untuk outlet selector, prioritaskan URL state apabila context perlu:

- deep linking;
- browser back/forward;
- refresh persistence.

Contoh:

```text
/
?outlet=outlet-id
```

atau mekanisme URL state lain yang konsisten dengan architecture project.

---

# 9. Single Outlet Home

## Kondisi

```text
outletTotal === 1
```

### Header

Tampilkan:

```text
JualAntar Merchant             🔔
```

Kemudian:

```text
Selamat datang,
Ayam Geprek Ganteng 👋

Kelola usahamu dengan lebih mudah di JualAntar.
```

Nama usaha harus berasal dari data merchant/outlet yang tersedia, bukan hardcoded.

### Outlet Card

Tampilkan:

- outlet image;
- outlet name;
- status;
- address;
- navigation arrow.

### Operational CTA

Contoh:

```text
🏪 Outlet sedang buka

Terima dan proses pesanan dengan cepat.

[ Masuk ke Operasional → ]
```

CTA harus menjadi salah satu action paling prominent.

### Urutan section

```text
Header
↓
Welcome
↓
Outlet Card
↓
Operational CTA
↓
Pesanan Hari Ini
↓
Ringkasan Hari Ini
↓
Ringkasan 7 Hari
↓
Menu Utama
↓
Pesanan Terbaru
↓
Produk Terlaris
↓
Aktivitas Terbaru
↓
JualAntar Academy
↓
Bantuan
↓
Bottom Navigation
```

---

# 10. Multi Outlet Home

## Kondisi

```text
outletTotal > 1
```

### Outlet Selector

Tampilkan:

```text
Outlet
Semua Outlet (N)
```

Selector menyediakan:

```text
Semua Outlet
Outlet A
Outlet B
Outlet C
...
```

Setiap item dapat menampilkan:

- nama outlet;
- status;
- alamat singkat.

### Default

Ketika pertama kali membuka Home:

```text
Semua Outlet
```

### Semua Outlet

Saat context:

```text
all
```

Tampilkan:

- aggregate total orders;
- aggregate sales;
- aggregate products sold;
- outlet performance;
- aggregate sales chart;
- recent aggregate orders/activity bila dummy data mendukung.

### Outlet tertentu

Saat context:

```text
selected
```

Tampilkan:

- KPI outlet;
- sales outlet;
- recent orders outlet;
- top products outlet;
- operational CTA;
- activity outlet.

---

# 11. Outlet Performance

Pada mode `Semua Outlet`, tambahkan section:

```text
Performa Outlet
```

Setiap row:

```text
[image] Ayam Geprek Ganteng
       Buka
       12 pesanan

                    Rp 358.000 >
```

Data dapat menggunakan dummy data.

Interaction:

```text
tap outlet
→ selected outlet context
```

---

# 12. Data Strategy

## 12.1 Real API Data

Gunakan real data hanya untuk:

- merchant name;
- merchant status;
- outlet count;
- outlet id;
- outlet name;
- outlet address;
- outlet status;
- outlet photo;
- outlet geography bila diperlukan.

Sumber:

```text
useOperationsSummary()
useOperationalOutlets()
```

## 12.2 Dummy Data

Gunakan dummy data untuk:

- today orders;
- order status count;
- total sales;
- products sold;
- rating;
- 7-day sales;
- recent orders;
- top products;
- activities;
- outlet performance metrics;
- academy content.

Jangan menaruh dummy object langsung tersebar di JSX.

Buat source:

```text
app/modules/home/utils/home-dummy-data.ts
```

---

# 13. Dummy Data Contract

Contoh:

```ts
export type HomeDashboardData = {
    todayOrders: {
        new: number
        processing: number
        completed: number
    }

    summary: {
        totalOrders: number
        sales: number
        productsSold: number
        rating: number
    }

    sales7Days: Array<{
        label: string
        value: number
    }>

    recentOrders: Array<{
        id: string
        customerName: string
        itemCount: number
        total: number
        status: "new" | "processing" | "completed"
        createdAt: string
    }>

    topProducts: Array<{
        id: string
        name: string
        sold: number
        price: number
        imageUrl: string
    }>

    activities: Array<{
        id: string
        type: string
        title: string
        description: string
        createdAt: string
    }>
}
```

Data ini nantinya dapat diganti dengan API tanpa perlu mengubah seluruh UI component.

---

# 14. UI Component Plan

Target struktur:

```text
app/modules/home/
├── components/
│   ├── merchant-home.tsx
│   ├── home-header.tsx
│   ├── outlet-context-card.tsx
│   ├── outlet-selector.tsx
│   ├── outlet-performance-list.tsx
│   ├── operational-cta.tsx
│   ├── today-orders-summary.tsx
│   ├── business-summary.tsx
│   ├── sales-chart.tsx
│   ├── main-menu-grid.tsx
│   ├── recent-orders.tsx
│   ├── top-products.tsx
│   ├── recent-activities.tsx
│   ├── academy-banner.tsx
│   └── support-card.tsx
│
├── hooks/
│   └── use-home-context.ts
│
├── pages/
│   └── home-page.tsx
│
├── routes/
│   └── home-route.tsx
│
├── types/
│   └── home.types.ts
│
├── utils/
│   └── home-dummy-data.ts
│
└── index.ts
```

Tidak semua file wajib dibuat jika separation of concern belum diperlukan. Hindari membuat abstraction hanya untuk memenuhi template.

---

# 15. Component Responsibilities

## `merchant-home.tsx`

Sebagai orchestrator:

- mengambil merchant/outlet data;
- menentukan outlet count;
- menentukan Home context;
- memilih state 0/1/many;
- compose section.

Jangan menaruh seluruh UI dashboard dalam satu file.

## `home-header.tsx`

Tanggung jawab:

- logo;
- notification;
- profile/avatar.

## `outlet-context-card.tsx`

Tanggung jawab:

- outlet identity;
- image;
- name;
- address;
- status.

## `outlet-selector.tsx`

Tanggung jawab:

- memilih `Semua Outlet`;
- memilih outlet tertentu;
- keyboard/focus accessibility;
- menampilkan loading/error bila diperlukan.

## `operational-cta.tsx`

Tanggung jawab:

- outlet operational status;
- CTA;
- state inactive/suspended.

## `today-orders-summary.tsx`

Tanggung jawab:

```text
Pesanan Baru
Diproses
Selesai
```

## `business-summary.tsx`

Tanggung jawab:

```text
Total Pesanan
Total Penjualan
Produk Terjual
Rating Outlet
```

## `sales-chart.tsx`

Tanggung jawab:

- chart 7 hari;
- responsive;
- tooltip;
- currency formatting.

Gunakan Recharts yang sudah tersedia.

## `main-menu-grid.tsx`

Tanggung jawab:

```text
Pesanan
Produk
Promo
Keuangan
Jam Operasional
Pengaturan
```

## `recent-orders.tsx`

Menampilkan dummy recent orders.

## `top-products.tsx`

Menampilkan dummy top products.

## `recent-activities.tsx`

Menampilkan activity timeline dummy.

## `academy-banner.tsx`

Banner edukasi.

## `support-card.tsx`

Entry bantuan/support.

---

# 16. Navigation

Existing routes yang sudah tersedia:

```text
/orders
/finances
/products
/promotions
/settings
/settings/outlets
/settings/outlets/:outlet
/settings/outlets/:outlet/hours
/settings/outlets/:outlet/service-area
/settings/outlets/:outlet/availability
```

Gunakan route yang sudah tersedia.

Jangan membuat route baru apabila kebutuhan dapat dipenuhi menggunakan route existing.

## Operational CTA

Prioritas:

```text
Home
→ Masuk ke Operasional
→ /orders
```

Untuk selected outlet, gunakan outlet context hanya apabila Orders module sudah mendukung context/filter outlet.

Jika Orders belum mendukung outlet context:

- jangan membuat integration besar pada phase ini;
- sediakan TODO;
- jangan mengarang parameter API baru.

---

# 17. Zero Outlet State

## Kondisi

```text
outletTotal === 0
```

Jangan menampilkan dashboard dummy seolah-olah merchant sudah beroperasi.

Tampilkan:

```text
Belum ada outlet

Tambahkan outlet pertama Anda agar dapat mulai menerima pesanan.

[ + Tambah Outlet ]
```

Gunakan route existing:

```text
/settings/outlets/new
```

atau `SETTINGS_PATHS.outletNew` apabila public constant tersebut tersedia.

### Optional guidance

Dapat menampilkan:

```text
1. Tambahkan outlet
2. Atur jam operasional
3. Tambahkan produk
4. Mulai menerima pesanan
```

Tetapi jangan membuat flow baru di luar scope.

---

# 18. Merchant Suspended State

Existing code sudah memiliki:

```text
SuspendedBanner
```

Pertahankan pattern tersebut.

Jika merchant suspended:

- tampilkan banner dengan prioritas tinggi;
- jangan menyembunyikan informasi penting secara diam-diam;
- operational CTA harus menjelaskan bahwa outlet tidak dapat menerima order.

---

# 19. Outlet Inactive State

Jika outlet:

```text
status === "inactive"
```

Operational CTA berubah dari:

```text
Outlet sedang buka
```

menjadi:

```text
Outlet sedang tidak aktif
```

Action hanya ditampilkan jika user mempunyai permission yang sesuai.

Jangan menggunakan role literal untuk menentukan action.

---

# 20. Loading State

Loading harus mengikuti bentuk UI final.

Minimal:

```text
Header skeleton
Outlet skeleton
CTA skeleton
KPI skeleton
Chart skeleton
List skeleton
```

Jangan menampilkan blank screen.

Gunakan existing:

```text
Skeleton
```

component.

---

# 21. Error State

Gunakan existing:

```text
ErrorState
```

Pattern:

```text
Gagal memuat beranda

Silakan coba beberapa saat lagi.

[ Coba lagi ]
```

Outlet API error tidak boleh membuat seluruh application crash.

Jika memungkinkan:

- merchant info tetap tampil;
- outlet-specific section menampilkan local error;
- retry hanya query yang gagal.

---

# 22. Responsive Design

Mobile-first.

Reference utama merupakan layout mobile/PWA.

### Mobile

- full-width sections;
- 16px–20px horizontal padding;
- rounded cards;
- 2-column KPI grid;
- 2-column shortcut grid;
- horizontal selector bila diperlukan;
- sticky bottom navigation;
- bottom padding agar content tidak tertutup navigation.

### Tablet/Desktop

Jika application shell mendukung:

- content width dapat dibatasi;
- sections dapat menggunakan grid;
- recent orders/top products dapat menjadi multi-column;
- chart dapat menggunakan area lebih luas.

Jangan mengubah Home menjadi desktop dashboard yang kehilangan karakter mobile reference.

---

# 23. Visual Direction

Gunakan existing design system.

### Prinsip

- light background;
- white cards;
- rounded corners;
- subtle borders;
- subtle shadows;
- red brand accent;
- pastel icon backgrounds;
- strong typography hierarchy;
- compact but breathable spacing;
- CTA utama menggunakan brand red;
- status menggunakan semantic color.

### Hindari

- hardcoded screenshot;
- image sebagai background untuk seluruh dashboard;
- excessive gradients;
- terlalu banyak warna accent;
- giant typography;
- card border/shadow berlebihan.

---

# 24. Accessibility

Minimal:

- semua icon-only button memiliki `aria-label`;
- status tidak hanya dibedakan berdasarkan warna;
- selector dapat digunakan keyboard;
- focus-visible state tersedia;
- touch target sekitar 44px;
- chart memiliki accessible summary;
- image memiliki meaningful alt atau empty alt jika decorative;
- heading hierarchy valid.

---

# 25. Testing Plan

Test harus co-located.

Minimal:

```text
components/
├── merchant-home.tsx
├── merchant-home.test.tsx
├── outlet-selector.tsx
└── outlet-selector.test.tsx

hooks/
├── use-home-context.ts
└── use-home-context.test.ts
```

### Test `use-home-context`

Wajib menguji:

```text
0 outlet → none
1 outlet → single
2 outlet → all
5 outlet → all
selected outlet → selected
selected → all
```

### Test `merchant-home`

Wajib menguji:

- zero outlet UI;
- single outlet UI;
- multi outlet UI;
- outlet selector;
- loading;
- error;
- suspended;
- inactive outlet.

### Test navigation

Pastikan:

- Tambah Outlet mengarah ke outlet creation route;
- CTA operational mengarah ke route yang benar;
- shortcut existing tetap bekerja.

---

# 26. Implementation Phases

## Phase 1 — Audit & Preparation

Tasks:

- audit current `MerchantHome`;
- audit existing UI primitives;
- audit existing routes/constants;
- buat `home.types.ts`;
- buat dummy data source;
- tentukan Home context model.

Output:

```text
Home data contract
Home context contract
```

---

## Phase 2 — Outlet Context

Tasks:

- gunakan `useOperationalOutlets`;
- gunakan `meta.total`;
- implementasi 0/1/many branching;
- implementasi `useHomeContext`;
- single outlet auto-select;
- multi outlet default `all`.

Output:

```text
Home mengetahui jumlah outlet secara real-time dari API.
```

---

## Phase 3 — Single Outlet UI

Implementasi sesuai reference:

```text
Header
Welcome
Outlet Card
Operational CTA
Today Orders
Summary
Sales Chart
Main Menu
Recent Orders
Top Products
Activities
Academy
Support
Bottom Navigation
```

Semua data selain merchant/outlet berasal dari dummy data.

---

## Phase 4 — Multi Outlet UI

Implementasi:

```text
Outlet Selector
All Outlet Context
Outlet Performance
Selected Outlet Context
```

Interaction:

```text
All Outlet
↓
Outlet A
↓
All Outlet
```

---

## Phase 5 — Empty & Operational States

Implementasi:

- zero outlet;
- inactive outlet;
- merchant suspended;
- loading;
- query error;
- retry.

---

## Phase 6 — Responsive & Accessibility

Check:

- mobile;
- tablet;
- desktop;
- keyboard;
- focus;
- screen reader semantics;
- bottom navigation spacing;
- chart responsiveness.

---

## Phase 7 — Testing & Quality

Run:

```bash
bun run typecheck
bun run test:run
bun run build
```

Fix:

- TypeScript errors;
- test failures;
- React Router issues;
- responsive layout issues;
- accessibility issues.

---

# 27. Definition of Done

Feature dianggap selesai apabila:

- [ ] Home owner menggunakan visual direction dari reference.
- [ ] Jumlah outlet berasal dari API.
- [ ] Tidak ada hardcoded outlet count.
- [ ] 0 outlet memiliki setup state.
- [ ] 1 outlet menggunakan single-outlet dashboard.
- [ ] >1 outlet menggunakan multi-outlet dashboard.
- [ ] Multi-outlet default context adalah `Semua Outlet`.
- [ ] User dapat memilih outlet.
- [ ] Selecting outlet tidak mengubah role.
- [ ] Business context dan outlet context jelas.
- [ ] Dashboard metrics masih menggunakan dummy data.
- [ ] Dummy data terpusat.
- [ ] Merchant/outlet identity menggunakan real API data.
- [ ] Existing authorization tetap digunakan.
- [ ] Tidak ada deep import antar-module.
- [ ] Tidak ada backend API baru.
- [ ] Existing route digunakan kembali.
- [ ] Loading state tersedia.
- [ ] Error state tersedia.
- [ ] Retry tersedia.
- [ ] Suspended state dipertahankan.
- [ ] Inactive outlet state tersedia.
- [ ] Mobile responsive.
- [ ] Accessibility dasar terpenuhi.
- [ ] Component/unit test tersedia.
- [ ] `bun run typecheck` berhasil.
- [ ] `bun run test:run` berhasil.
- [ ] `bun run build` berhasil.

---

# 28. Future Integration

Phase ini sengaja menggunakan dummy dashboard data.

Integrasi real dapat dilakukan setelah UI stabil.

Urutan yang disarankan:

1. Real Orders Summary.
2. Real Sales/Finance Summary.
3. Real Product Performance.
4. Real Rating.
5. Real Activity Timeline.
6. Real Outlet Performance.
7. Real Notification Count.
8. Real outlet context pada Orders.
9. Real Academy/support content.

Jangan menggabungkan pekerjaan tersebut ke phase redesign Home ini.

---

# 29. File/Source Basis

Analisis dibuat berdasarkan source code repository:

```text
app/routes.ts

app/modules/home/pages/home-page.tsx
app/modules/home/components/merchant-home.tsx
app/modules/home/components/employee-home.tsx
app/modules/home/routes/home-route.tsx

app/modules/merchant-operations/services/merchant-operations.api.ts
app/modules/merchant-operations/services/merchant-operations.queries.ts
app/modules/merchant-operations/services/merchant-operations.keys.ts
app/modules/merchant-operations/types/merchant-operations.types.ts
app/modules/merchant-operations/pages/outlets-page.tsx

docs/ARCHITECTURE.md
docs/AUTHORIZATION.md
package.json
```

---

# 30. Final Implementation Principle

Implementasi harus mengikuti prinsip:

```text
Real API
   │
   ├── Merchant identity
   ├── Outlet count
   ├── Outlet identity
   └── Outlet status
          │
          ▼
     Home Context
          │
     ┌────┼────┐
     ▼    ▼    ▼
    0     1    >1
  Outlet Outlet Multi
     │    │      │
     ▼    ▼      ▼
  Setup Single  Selector
               + Aggregate
               + Outlet Detail
```

Sedangkan dashboard metrics:

```text
Dummy Data
    │
    ├── Orders
    ├── Sales
    ├── Products
    ├── Rating
    ├── Activities
    └── Chart
```

Dengan pendekatan ini, **UI dapat selesai terlebih dahulu tanpa menunggu dashboard API**, tetapi struktur component dan data contract sudah disiapkan agar integrasi API real pada phase berikutnya tidak memerlukan redesign besar.
