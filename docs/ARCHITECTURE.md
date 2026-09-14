# Module Architecture

Standar arsitektur frontend untuk project **React Router v8 + React + TypeScript** dengan pendekatan **feature/module-based architecture**.

## Prinsip Utama

Setiap fitur/domain aplikasi harus menjadi **module yang self-contained**.

Business logic, page, component, hook, route, schema/type, dan logic consume API yang hanya digunakan oleh suatu fitur ditempatkan di dalam module tersebut.

Global layer hanya berisi kebutuhan yang benar-benar **shared** oleh banyak module dan **tidak boleh memiliki business logic milik satu domain**.

```text
app/
├── app.css
├── components/             # Global/shared UI & layout
│   ├── layouts/
│   └── ui/
├── hooks/                  # Global/shared hooks
├── stores/                 # Global client/UI state (Zustand)
├── lib/                    # Global utilities, config, infra helper
│   ├── utils.ts
│   ├── api.ts              # Axios instance tunggal untuk seluruh app
│   ├── constants.ts
│   └── config.ts
├── modules/                # Feature/domain modules
│   └── <module-name>/
│       ├── components/     # UI khusus module
│       ├── hooks/          # Hooks khusus module
│       ├── pages/          # Page/screen module
│       ├── routes/         # Route entry & route hierarchy module
│       ├── services/       # API client, TanStack Query, query keys
│       ├── schemas/        # optional — Zod schema, jika diperlukan
│       ├── types/          # optional — TypeScript types, jika diperlukan
│       ├── utils/          # optional — utility khusus module
│       └── index.ts        # Public API module
├── root.tsx                # Root React Router document/app shell
└── routes.ts                # Central route registry
```

## Module Ownership

Module adalah pemilik seluruh logic yang berkaitan dengan domain/fiturnya, termasuk route hierarchy, schema/type, dan business logic domain tersebut.

Contoh:

```text
modules/
├── auth/
├── users/
├── orders/
├── pricing/
├── merchants/
└── deliveries/
```

Domain logic yang punya konsep dan ownership jelas (mis. `pricing`) tetap menjadi **module tersendiri**, meskipun dikonsumsi lintas module — bukan dipindahkan ke shared layer.

Setiap module harus dapat dikembangkan tanpa menyebarkan implementation detail ke seluruh `app/`.

### Tanggung Jawab Folder

| Folder                  | Tanggung jawab                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/`           | Component yang hanya digunakan module tersebut.                                                                                                                         |
| `hooks/`                | Custom hook dan state/behavior khusus module.                                                                                                                           |
| `pages/`                | Screen/page utama yang menyusun UI module.                                                                                                                              |
| `routes/`               | Route entry & route hierarchy (termasuk nested/layout route) untuk module. Route file sebaiknya tipis dan mendelegasikan UI/logic ke `pages`, `hooks`, atau `services`. |
| `services/`             | API client function, query/mutation, query key factory, mapper, dan logic data access module.                                                                           |
| `schemas/` _(optional)_ | Zod schema untuk validasi runtime, terutama boundary API/input eksternal. Dibuat hanya ketika module punya kebutuhan validasi yang cukup untuk dipisah.                 |
| `types/` _(optional)_   | TypeScript type/interface milik module yang tidak diinfer dari Zod schema.                                                                                              |
| `utils/` _(optional)_   | Utility murni yang spesifik untuk module tersebut (bukan infrastructure generik).                                                                                       |
| `index.ts`              | Public API module. Export hanya hal yang memang boleh digunakan module lain.                                                                                            |

Folder optional (`schemas/`, `types/`, `utils/`) dibuat **berdasarkan separation of concern dan keterbacaan**, bukan jumlah file. Gunakan folder tersebut ketika:

- file punya tanggung jawab yang jelas dan berbeda dari file lain;
- logic/data dipakai oleh beberapa file dalam module yang sama;
- menyimpan di file existing membuat file terlalu besar atau boundary tidak jelas.

Jangan membuat folder ini hanya untuk mengikuti template.

## Shared Layer

Gunakan global layer hanya ketika code memang reusable lintas module dan tidak membawa business logic satu domain.

### `app/components`

Berisi component global, misalnya:

- Application layout
- Navigation, Header, Sidebar
- Generic UI component
- shadcn/ui component

Jangan memasukkan component yang hanya digunakan satu module ke sini.

### `app/hooks`

Berisi hook yang bersifat generic dan digunakan lintas module. Contoh: responsive/mobile hook, generic browser hook, atau reusable interaction hook.

### `app/stores`

Berisi **Zustand store** untuk **global client/UI state** yang memang perlu diakses lintas component/module — misalnya sidebar state, modal, theme, atau UI preference.

- Zustand **hanya untuk client/UI state**, bukan server state.
- Server state tetap menjadi tanggung jawab TanStack Query.
- Jangan membuat store Zustand untuk state yang hanya dimiliki satu module — simpan sebagai local state/hook di dalam module tersebut.

### `app/lib`

Berisi utility dan infrastructure helper yang bersifat global, termasuk konfigurasi HTTP client tunggal.

```text
lib/
├── utils.ts
├── api.ts        # Axios instance tunggal: base URL, headers, interceptor, auth, error normalization
├── constants.ts
└── config.ts
```

Aturan `app/lib`:

- `lib` **tidak boleh** menjadi tempat business logic domain, termasuk domain logic yang dipakai banyak module (lihat "Domain Logic Lintas Module" di bawah).
- Seluruh module **wajib** menggunakan instance Axios dari `lib/api.ts`. Module tidak boleh membuat instance Axios sendiri.
- Constant yang sifatnya domain-specific (mis. enum status order) disimpan di dalam module terkait, bukan di `lib/constants.ts`.

## Routing

Routing menggunakan **React Router v7, Data Mode**.

`app/routes.ts` adalah **single route registry / composition layer**. Ia hanya mendaftarkan route module, **bukan** tempat menyimpan business logic atau route hierarchy detail.

Route milik feature — termasuk nested/layout route — tetap berada dan dikelola sepenuhnya di dalam module:

```text
modules/orders/
├── components/
├── hooks/
├── pages/
├── routes/
│   ├── index.tsx
│   ├── orders-layout.tsx
│   └── order-detail-route.tsx
├── services/
└── index.ts
```

Contoh nested route (`/orders`, `/orders/:id`, `/orders/:id/edit`) didefinisikan di `modules/orders/routes`, kemudian diregistrasikan di `app/routes.ts`:

```ts
import { type RouteConfig, route } from "@react-router/dev/routes"

export default [
    route("orders", "modules/orders/routes/orders-layout.tsx", [
        route("", "modules/orders/routes/index.tsx"),
        route(":id", "modules/orders/routes/order-detail-route.tsx"),
    ]),
] satisfies RouteConfig
```

### Data Fetching: TanStack Query vs Loader

- **TanStack Query adalah pola default** untuk fetching, caching, dan mutation server state.
- `loader`/`action` **tidak digunakan sebagai pola default**. Gunakan `loader` hanya untuk kebutuhan route-level orchestration tertentu, misalnya prefetch/`ensureQueryData` untuk data kritikal sebelum route dirender.
- Mutation API selalu menggunakan **TanStack Query mutation**, bukan `action`.

### Lazy Loading

- Gunakan lazy loading (code splitting) **per-module/per-route** untuk route yang tidak dibutuhkan pada initial load.
- Route yang kecil, global, atau memang dibutuhkan pada initial load boleh menggunakan eager import.
- Prinsipnya: code splitting mengikuti module/route boundary, bukan dipaksakan pada setiap component.

### Protected/Auth-Guarded Route

- Authentication/authorization diterapkan pada **route boundary** melalui parent protected route/layout, bukan dicek manual di tiap page.
- Authorization berbasis permission/role juga dilakukan di route boundary ketika memungkinkan.
- Page tetap bertanggung jawab atas UI-level permission behavior (mis. menyembunyikan/men-disable action tertentu), bukan gatekeeping akses route.

Contoh konsep:

```text
ProtectedRoute
├── Dashboard
├── Orders
│   ├── List
│   └── Detail
└── Users
```

## Page vs Route

Pisahkan route entry dengan page implementation.

```text
modules/orders/
├── pages/
│   └── orders-page.tsx
└── routes/
    └── orders.tsx
```

Route:

```tsx
export default function OrdersRoute() {
    return <OrdersPage />
}
```

Page menangani composition UI:

```tsx
export function OrdersPage() {
    // compose module components/hooks
}
```

Tujuannya agar route tetap tipis dan mudah dipahami.

## Services, TanStack Query & Data Layer

Semua komunikasi API dan server-state module berada di `services/`. Component/page tidak boleh menyimpan detail HTTP request secara langsung.

```text
modules/orders/services/
├── orders.api.ts
├── orders.queries.ts
├── orders.mutations.ts
└── orders.keys.ts
```

Arah dependency:

```text
Page
  ↓
Hook / Query
  ↓
Service
  ↓
API (lib/api.ts)
```

### Query Key Ownership & Cross-Module Invalidation

- Setiap module bertanggung jawab atas **query key miliknya sendiri**, diekspos sebagai query-key factory (mis. `orders.keys.ts`).
- Jika mutation di satu module memengaruhi data module lain, invalidasi dilakukan menggunakan **public query-key factory** dari module terdampak yang diekspos lewat `index.ts` — **bukan** string query key internal yang ditulis ulang secara manual.

```ts
import { ordersQueryKeys } from "@/modules/orders";

queryClient.invalidateQueries({ queryKey: ordersQueryKeys.list() });
```

### Error Handling

- Service layer menggunakan **exception/throw-based error handling**, bukan `Result<T, E>`.
- Error dinormalisasi di layer HTTP/API (`lib/api.ts` atau service) sebelum dilempar, agar module menerima bentuk error yang konsisten.

```ts
try {
  // API request
} catch (error) {
  throw normalizeApiError(error);
}
```

- TanStack Query menangani error lewat `query.error` / `mutation.error`.

## Data Validation & Types

- Gunakan **Zod** sebagai standar validation schema, terutama untuk boundary API dan input eksternal yang membutuhkan validasi runtime.
- Schema dan type **dimiliki oleh module terkait**, ditempatkan di `schemas/` dan/atau `types/` (lihat "Tanggung Jawab Folder"). Jangan membuat folder `schemas/`/`types/` global untuk data yang sifatnya domain-specific.
- Gunakan TypeScript type untuk compile-time typing dan Zod untuk runtime validation. Jangan menduplikasi type jika type tersebut bisa diinfer langsung dari Zod schema (`z.infer<typeof schema>`).

## Dependency Rules

1. **Module boleh menggunakan shared layer** (`app/components`, `app/hooks`, `app/stores`, `app/lib`).
2. **Shared layer tidak boleh bergantung pada module.**
3. **Module boleh bergantung pada module lain**, tetapi **hanya melalui public API (`index.ts`)** — tidak boleh mengakses file internal module lain secara langsung.
4. Jika module lain membutuhkan sesuatu dari module B, expose melalui `module-b/index.ts`.
5. Module tidak wajib sepenuhnya terisolasi — controlled dependency antar-module diperbolehkan ketika memang ada hubungan domain yang nyata (mis. `orders` menggunakan `pricing`). Tetap jaga dependency antar-module seminimal mungkin.
6. Hindari circular dependency antar-module.
7. Jangan memindahkan code ke global hanya karena dipakai beberapa file; pindahkan ke global hanya ketika code tersebut memang menjadi reusable infrastructure/UI generik (bukan business logic domain — lihat "Domain Logic Lintas Module").

Contoh yang benar:

```ts
import { UserCard } from "~/modules/users"
import { usePricing } from "~/modules/pricing"
```

Bukan:

```ts
import { UserCard } from "~/modules/users/components/user-card"
import { calculatePrice } from "~/modules/pricing/services/calculate-price"
```

`index.ts` menjadi boundary/public API module.

### Domain Logic Lintas Module

Business logic domain yang dibutuhkan oleh lebih dari satu module, dan memiliki konsep/ownership domain yang jelas, dipisahkan menjadi **module/domain tersendiri** (mis. `modules/pricing`) — **bukan** dipindahkan ke `app/lib` atau shared layer. Module lain mengonsumsinya lewat public API module tersebut.

## State Management

Bedakan jenis state sebelum memilih tempat penyimpanannya:

```text
Server state     → TanStack Query
Local UI state   → React state / module hook
URL state        → React Router params/search params
Global UI state  → Zustand (app/stores), hanya jika memang dibutuhkan lintas module
```

Jangan membuat global state (Zustand) untuk state yang hanya dimiliki satu module.

## Export Convention

- **Named export** adalah convention default untuk components, hooks, services, utilities, schemas, types, dan pages.
- **Default export** hanya digunakan ketika diwajibkan/direkomendasikan secara eksplisit oleh React Router, yaitu pada **route file**.

```ts
// components, hooks, services, pages → named export
export function OrdersPage() {}
export function useOrders() {}
export const ordersService = {};
```

```ts
// route file → default export
export default OrdersPage;
```

## Testing

- Unit dan component test menggunakan pola **co-located**: test file diletakkan di sebelah source file yang diuji.

```text
orders/
├── components/
│   ├── order-card.tsx
│   └── order-card.test.tsx
├── hooks/
│   ├── use-orders.ts
│   └── use-orders.test.ts
└── pages/
    ├── orders-page.tsx
    └── orders-page.test.tsx
```

- Folder test terpisah hanya digunakan untuk integration test, e2e test, atau test suite yang memang membutuhkan struktur khusus.

## Naming Convention

Gunakan nama berdasarkan domain/feature, bukan tipe teknis saja.

Disarankan:

```text
orders-page.tsx
orders-table.tsx
use-orders.ts
orders.api.ts
orders.queries.ts
orders.mutations.ts
orders.keys.ts
order.schema.ts
```

Hindari nama terlalu generik seperti:

```text
common.ts
helpers.ts
manager.ts
data.ts
service.ts
```

kecuali konteksnya benar-benar jelas.

## Aturan Praktis

### Tambahkan code ke `modules/<name>` ketika

- code hanya digunakan oleh satu feature/domain;
- memiliki business logic khusus feature, termasuk domain logic yang punya ownership jelas meski dikonsumsi module lain;
- menggunakan API endpoint khusus feature;
- component/hook hanya relevan untuk feature tersebut.

### Tambahkan code ke global `app/` ketika

- digunakan oleh banyak module;
- tidak memiliki business logic milik satu domain;
- merupakan infrastructure/shared UI/state generik (component, hook, atau Zustand store yang benar-benar lintas module).

## Target Struktur Module

Module sederhana:

```text
modules/orders/
├── components/
├── hooks/
├── pages/
├── routes/
├── services/
└── index.ts
```

Module dengan kebutuhan tambahan dapat menambahkan folder internal lain **hanya ketika diperlukan** (lihat kriteria di "Tanggung Jawab Folder"), misalnya:

```text
modules/orders/
├── components/
├── hooks/
├── pages/
├── routes/
│   ├── index.tsx
│   ├── orders-layout.tsx
│   └── order-detail-route.tsx
├── services/
├── schemas/
├── types/
└── index.ts
```

Jangan membuat folder hanya untuk memenuhi struktur.

## Definition of Done untuk Feature Baru

Sebelum feature dianggap selesai:

- seluruh feature-specific logic (termasuk domain logic lintas module bila relevan) berada di module yang tepat;
- route — termasuk nested/layout route dan proteksi auth bila diperlukan — sudah didefinisikan di module dan diregistrasikan di `app/routes.ts`;
- API/server-state berada di `services/`, menggunakan Axios instance dari `lib/api.ts`, dan error dinormalisasi sebelum di-throw;
- query key module diekspos sebagai factory dan dipakai module lain (jika ada) untuk invalidation lintas module;
- schema/type API menggunakan Zod dan ditempatkan di dalam module, tanpa duplikasi type yang bisa diinfer;
- route tetap tipis;
- shared code (`components/`, `hooks/`, `stores/`, `lib/`) tidak memiliki ketergantungan ke module dan tidak membawa business logic domain;
- public API module tersedia melalui `index.ts` bila dibutuhkan module lain;
- tidak ada deep import ke internal module dari luar module;
- unit/component test ditulis co-located dengan source file-nya.

## Architecture Goal

Tujuan utama arsitektur ini adalah **high cohesion, low coupling, dan feature ownership yang jelas**.

Struktur project harus memungkinkan developer menambahkan, mengubah, atau menghapus sebuah feature dengan dampak seminimal mungkin terhadap feature lain.
