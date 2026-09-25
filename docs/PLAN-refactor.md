# JualAntar Merchant Frontend — Refactor Plan

## 1. Tujuan

Refactor repository `jualantar-merchant` agar memiliki module boundary yang jelas, high cohesion, low coupling, dan dapat dikembangkan dengan aman ketika fitur baru ditambahkan.

Refactor ini **tidak mengubah kontrak bisnis Catalogs/API**. Fokusnya adalah merapikan struktur kode, ownership, dependency, component composition, service/data layer, testing, dan enforcement architecture.

Repository saat ini menggunakan React + TypeScript + React Router + TanStack Query + Axios + Zustand, dengan `~/*` sebagai alias ke `app/*`.

## 2. Baseline Arsitektur yang Harus Dipertahankan

Repository sudah memiliki `docs/ARCHITECTURE.md` sebagai sumber aturan arsitektur.

Target refactor harus mengikuti prinsip tersebut:

- module/domain memiliki ownership penuh atas feature-specific code;
- shared layer hanya berisi UI/infrastructure/state yang benar-benar generic;
- module boleh menggunakan shared layer;
- shared layer tidak boleh bergantung pada module;
- module lain tidak boleh melakukan deep import ke internal module;
- dependency antar-module hanya melalui public API module (`index.ts`);
- route entry tetap tipis;
- API/server state tetap berada di `services/`;
- TanStack Query digunakan untuk server state;
- Zustand digunakan hanya untuk global client/UI state;
- domain-specific logic tidak dipindahkan ke `app/lib`;
- test ditempatkan co-located dengan source.

Referensi existing architecture: `docs/ARCHITECTURE.md`.

## 3. Masalah yang Teridentifikasi

### 3.1 Module boundary belum benar-benar enforced

Struktur module sudah tersedia, tetapi repository masih memungkinkan code antar-module bergantung langsung pada implementation detail module lain.

Temuan langsung pada Catalogs:

`app/modules/catalogs/services/catalog.queries.ts` mengonsumsi `useOperationalOutlets` dan `OperationalOutlet` dari `~/modules/merchant-operations`.

Dependency ini secara konsep dapat valid karena Catalogs memang membutuhkan outlet operasional, tetapi harus diperlakukan sebagai **public domain contract**, bukan alasan untuk membuka internal implementation detail module.

Target akhir:

`catalogs -> merchant-operations/public-api`

dan tidak pernah:

`catalogs -> merchant-operations/components/*`

`catalogs -> merchant-operations/services/*`

`catalogs -> merchant-operations/types/*`

kecuali item tersebut memang diekspor secara eksplisit dari public API.

### 3.2 File component terlalu besar

Temuan utama:

- `app/modules/catalogs/components/modifier-editor.tsx` ≈ 30 KB.
- `app/modules/catalogs/components/variant-editor.tsx` ≈ 17 KB.
- `app/modules/catalogs/components/outlet-assignment.tsx` ≈ 17 KB.
- `app/modules/catalogs/components/wizard/wizard-drafts.tsx` ≈ 44 KB.
- `app/modules/catalogs/pages/categories-page.tsx` ≈ 21 KB.

File-file tersebut bukan sekadar component tunggal; masing-masing memuat beberapa responsibility, form state, dialog, mutation wiring, list rendering, dan/or interaction logic.

Refactor harus memecah berdasarkan responsibility, bukan sekadar jumlah baris.

### 3.3 Catalog wizard terlalu gemuk

`wizard-drafts.tsx` saat ini menampung beberapa domain UI draft:

- Variant draft
- Modifier draft
- Modifier group draft
- Media draft
- Outlet draft
- helper presentation
- validation-related behavior

Target:

```text
catalogs/
  components/
    product-wizard/
      variant-draft-editor.tsx
      modifier-group-draft-editor.tsx
      modifier-draft-row.tsx
      media-draft-picker.tsx
      outlet-draft-picker.tsx
      label-row.tsx
      index.ts
```

Nama folder/file final boleh disesuaikan selama ownership tetap jelas.

### 3.4 Modifier editor mencampur banyak responsibility

`modifier-editor.tsx` saat ini menggabungkan:

- modifier group form;
- modifier form;
- group card;
- modifier list;
- reorder behavior;
- status mutation;
- delete confirmation;
- dialog state;
- formatting/presentation.

Target:

```text
catalogs/components/modifiers/
  modifier-editor.tsx
  modifier-group-card.tsx
  modifier-group-form-dialog.tsx
  modifier-form-dialog.tsx
  modifier-row.tsx
  modifier-list.tsx
  modifier-editor.test.tsx
```

Behavior yang masih benar-benar module-specific tetap berada di module Catalogs.

### 3.5 Variant editor mencampur editor, row, dialog dan orchestration

Target minimal:

```text
catalogs/components/variants/
  variant-editor.tsx
  variant-row.tsx
  variant-form-dialog.tsx
  variant-list.tsx
```

Reorder/status/delete/edit behavior tetap dimiliki Catalogs.

### 3.6 Categories page mencampur page orchestration dan feature UI

`categories-page.tsx` saat ini menangani fetching, filtering, DnD, modal, form, mutation, empty/error state, serta rendering list.

Target:

```text
catalogs/components/categories/
  category-list.tsx
  category-row.tsx
  category-form-dialog.tsx
  category-delete-dialog.tsx
  category-filters.tsx
```

Page hanya melakukan composition dan page-level state orchestration.

### 3.7 Shared component belum memiliki taxonomy yang tegas

Saat ini global component sudah ada di:

`app/components`

dan primitive UI ada di:

`app/components/ui`.

Refactor harus membedakan:

- **primitive UI** → `app/components/ui`;
- **generic application component** → `app/components`;
- **shared application composition/layout** → `app/components/layouts`;
- **feature-specific component** → `app/modules/<module>/components`.

Jangan memindahkan component ke shared hanya karena sedang dipakai dua file.

Kriteria shared:

1. dipakai oleh dua atau lebih module;
2. tidak membawa business rule domain tertentu;
3. API component dapat dirancang generic;
4. perubahan domain-specific tidak diperlukan agar component bekerja.

### 3.8 Service layer masih terlalu terkonsentrasi

`catalog.mutations.ts` berisi banyak mutation hook untuk produk, kategori, variant, media, modifier, outlet, sekaligus product creation bundle orchestration.

Target pengelompokan:

```text
catalogs/services/
  catalog.api.ts
  catalog.repository.ts
  catalog.keys.ts

  products/
    product.queries.ts
    product.mutations.ts

  categories/
    category.queries.ts
    category.mutations.ts

  variants/
    variant.mutations.ts

  modifiers/
    modifier.mutations.ts

  media/
    media.mutations.ts

  product-outlets/
    product-outlet.queries.ts
    product-outlet.mutations.ts

  product-bundle/
    product-bundle.mutation.ts
```

Tidak wajib semua folder dibuat sekaligus; lakukan hanya ketika ukuran/tanggung jawab sudah membenarkan pemisahan.

### 3.9 Query layer memiliki cross-module coupling yang harus didokumentasikan

Catalogs saat ini mengambil outlet melalui Merchant Operations.

Jangan menyelesaikannya dengan menyalin data outlet ke Catalogs atau memindahkan domain outlet ke `lib/`.

Pilihan target:

- Merchant Operations menyediakan **public contract** `useOperationalOutlets` / `OperationalOutlet`;
- Catalogs mengonsumsi public contract tersebut;
- jika kebutuhan outlet menjadi domain yang benar-benar lintas banyak module dan ownership makin kompleks, evaluasi pembentukan domain module tersendiri pada refactor lanjutan.

Untuk fase ini jangan melakukan domain split besar tanpa bukti kebutuhan.

## 4. Target Dependency Graph

Target dependency direction:

```text
Routes
  ↓
Pages
  ↓
Module Components / Module Hooks
  ↓
Module Services
  ↓
app/lib/api.ts
```

Shared:

```text
Modules ───────→ app/components
Modules ───────→ app/hooks
Modules ───────→ app/stores
Modules ───────→ app/lib

app/components ─X→ modules
app/hooks       ─X→ modules
app/lib         ─X→ modules
app/stores      ─X→ modules
```

Cross-module:

```text
Module A ─────→ Module B public API
                     ↓
                  index.ts
```

Tidak diperbolehkan:

```text
Module A ─X→ Module B/components/*
Module A ─X→ Module B/hooks/*
Module A ─X→ Module B/services/*
Module A ─X→ Module B/types/*
Module A ─X→ Module B/utils/*
```

kecuali implementation detail tersebut sengaja dipromosikan menjadi public API melalui `index.ts`.

## 5. Target Struktur Project

```text
app/
├── components/
│   ├── layouts/
│   ├── ui/
│   └── shared-domain-neutral/
├── hooks/
├── lib/
├── stores/
├── modules/
│   ├── auth/
│   ├── authorization/
│   ├── bank-directory/
│   ├── catalogs/
│   ├── finances/
│   ├── geography/
│   ├── home/
│   ├── merchant-operations/
│   ├── merchant-registration/
│   ├── orders/
│   ├── promotions/
│   ├── service-catalog/
│   └── settings/
├── root.tsx
└── routes.ts
```

Setiap module mengikuti struktur minimal:

```text
modules/<module>/
├── components/
├── hooks/
├── pages/
├── routes/
├── services/
└── index.ts
```

Folder `schemas/`, `types/`, `utils/` ditambahkan hanya ketika responsibility memang terpisah dan terbukti dibutuhkan.

## 6. Refactor Rules

### Rule A — One file, one primary responsibility

Satu file tidak boleh menjadi tempat kumpulan component unrelated.

Tidak diperbolehkan:

```text
modifier-editor.tsx
  ├── GroupFormDialog
  ├── ModifierFormDialog
  ├── GroupCard
  ├── ModifierRow
  └── ModifierEditor
```

Targetnya setiap concept utama memiliki file sendiri.

### Rule B — Page adalah composer, bukan dumping ground

Page boleh:

- membaca URL state;
- memanggil module hooks;
- mengatur page-level state;
- memilih section;
- menyusun component.

Page tidak boleh menjadi tempat implementasi detail component yang dapat diisolasi.

### Rule C — Component tidak melakukan API call langsung

Component mengonsumsi module hook/service.

Tidak diperbolehkan component membuat Axios request sendiri.

### Rule D — Shared component tidak boleh mengetahui domain

Contoh yang benar:

`DataTable`, `EmptyState`, `ConfirmDialog`, `FormSection`.

Contoh yang salah:

`CatalogProductStatusBadge` di global `app/components`.

### Rule E — Domain component tetap berada di domain owner

Walaupun component digunakan lintas screen dalam Catalogs, tetap simpan di Catalogs.

Jangan memindahkan code ke global hanya untuk mengurangi import path.

### Rule F — Public API module harus deliberate

`index.ts` hanya export:

- pages yang perlu direferensikan oleh route;
- public hooks yang benar-benar dibutuhkan module lain;
- public types;
- query-key factory jika dibutuhkan cross-module invalidation;
- domain utility yang memang merupakan public contract.

Jangan membuat `index.ts` menjadi barrel yang mengekspos seluruh internal module.

## 7. Phased Execution Plan

### Phase 0 — Freeze & Baseline

Tujuan: memastikan refactor tidak merusak Catalog API integration.

Aktivitas:

- catat baseline build;
- catat baseline typecheck;
- jalankan test suite;
- inventaris semua route;
- inventaris module;
- inventaris import antar-module;
- inventaris file > 10 KB;
- inventaris component multi-export;
- inventaris public exports tiap `index.ts`.

Definition of Done:

- baseline command tercatat;
- issue existing sebelum refactor dibedakan dari regression;
- Catalogs API behavior dianggap contract yang tidak boleh berubah.

### Phase 1 — Establish Architecture Guardrails

Tujuan: mencegah struktur lama kembali muncul.

Aktivitas:

- standardisasi alias import;
- definisikan aturan import boundary;
- tambahkan lint/static check untuk:
  - deep import antar-module;
  - shared → module dependency;
  - page → direct Axios;
  - component → direct repository;
- dokumentasikan allowed dependency direction.

Target:

```text
module → shared      ✅
module → module API  ✅
module → module deep ❌
shared → module      ❌
```

Definition of Done:

- architecture violations dapat terdeteksi otomatis;
- setiap PR refactor dapat memvalidasi boundary.

### Phase 2 — Normalize Shared Layer

Audit:

- `app/components`;
- `app/components/ui`;
- `app/hooks`;
- `app/lib`;
- `app/stores`.

Aktivitas:

- hapus/rename component global yang terlalu domain-specific;
- pindahkan kembali domain component ke module owner;
- naikkan component dari module ke shared hanya jika memenuhi criteria shared;
- pisahkan primitive UI dari application-level component.

Output:

```text
app/components/
  generic reusable components

app/modules/<module>/components/
  domain components
```

### Phase 3 — Refactor Catalogs Components

Urutan:

1. `wizard-drafts.tsx`;
2. `modifier-editor.tsx`;
3. `outlet-assignment.tsx`;
4. `variant-editor.tsx`;
5. `product-filters.tsx`;
6. `categories-page.tsx`;
7. media components;
8. product list/card/actions.

Strategi:

- extract presentational subcomponents;
- extract form dialogs;
- extract list/row components;
- extract interaction logic menjadi hook bila state/behavior cukup kompleks;
- keep current props/API behavior unchanged;
- update imports;
- delete old monolithic implementation hanya setelah consumer berpindah.

Definition of Done:

- tidak ada component file Catalogs yang menjadi container untuk banyak unrelated concepts;
- component memiliki single clear responsibility;
- behavior UI dan API tetap sama.

### Phase 4 — Refactor Catalog Service Layer

Pisahkan service berdasarkan bounded responsibility.

Aktivitas:

- identifikasi repository/resource boundary;
- pecah mutation/query file besar;
- pertahankan satu Axios infrastructure;
- pertahankan query key ownership;
- pastikan invalidation menggunakan `catalogKeys`.

Target akhir:

```text
products
categories
variants
modifiers
media
product-outlets
product-bundle
```

Definition of Done:

- page/component tidak mengetahui endpoint;
- setiap service file memiliki ownership jelas;
- query keys tetap konsisten.

### Phase 5 — Refactor Non-Catalog Modules

Setelah pattern Catalogs stabil, gunakan pattern yang sama untuk:

- merchant-operations;
- merchant-registration;
- settings;
- orders;
- promotions;
- finances;
- auth;
- authorization;
- geography;
- service-catalog;
- home;
- bank-directory.

Urutan ditentukan berdasarkan dependency risk dan ukuran file, bukan alphabetic order.

Setiap module harus melalui:

1. ownership audit;
2. component split;
3. page split;
4. service split;
5. public API cleanup;
6. test co-location;
7. boundary verification.

### Phase 6 — Route Normalization

Saat ini `app/routes.ts` menjadi central registry dan route module sudah berada di tiap module.

Pertahankan central registration tetapi rapikan agar:

- route file tipis;
- nested routes tetap dekat domain owner;
- page implementation tidak berada di route file;
- route-specific layout tetap dimiliki module;
- protected/authorization guard tetap di boundary.

Jangan memindahkan seluruh routing keluar module hanya demi mengurangi jumlah folder.

### Phase 7 — Public API Cleanup

Untuk setiap module:

```text
index.ts
```

harus menjadi explicit contract.

Review semua export:

- hapus export yang tidak dikonsumsi;
- jangan expose internal component;
- expose only domain contracts;
- expose query keys hanya jika memang diperlukan cross-module invalidation;
- expose types yang benar-benar digunakan consumer.

### Phase 8 — Test Reorganization

Target co-location:

```text
components/
  product-card.tsx
  product-card.test.tsx

hooks/
  use-products.ts
  use-products.test.ts

services/
  products/
    product.mutations.ts
    product.mutations.test.ts

pages/
  catalogs-page.tsx
  catalogs-page.test.tsx
```

Test priority:

1. module service behavior;
2. critical mutation flow;
3. complex form;
4. list filtering/sorting;
5. DnD/reorder behavior;
6. route rendering;
7. generic shared components.

### Phase 9 — Final Boundary Audit

Automated checks:

- zero forbidden deep imports;
- zero shared → module imports;
- zero direct Axios request from component/page;
- zero direct repository usage from UI component;
- no oversized file without documented reason;
- all module public APIs explicit;
- no cyclic module dependency.

Manual checks:

- Catalog create product flow;
- Catalog edit product flow;
- category CRUD;
- modifier CRUD;
- variant CRUD;
- media upload/reorder/primary;
- outlet assignment;
- settings;
- auth;
- registration;
- PWA/offline.

## 8. Catalogs Refactor Blueprint

Target:

```text
app/modules/catalogs/
├── components/
│   ├── categories/
│   │   ├── category-form-dialog.tsx
│   │   ├── category-list.tsx
│   │   ├── category-row.tsx
│   │   └── category-delete-dialog.tsx
│   ├── modifiers/
│   │   ├── modifier-editor.tsx
│   │   ├── modifier-group-card.tsx
│   │   ├── modifier-group-form-dialog.tsx
│   │   ├── modifier-form-dialog.tsx
│   │   └── modifier-row.tsx
│   ├── variants/
│   │   ├── variant-editor.tsx
│   │   ├── variant-form-dialog.tsx
│   │   └── variant-row.tsx
│   ├── media/
│   │   ├── media-manager.tsx
│   │   ├── media-upload-tile.tsx
│   │   └── media-item.tsx
│   ├── product/
│   │   ├── product-card.tsx
│   │   ├── product-list.tsx
│   │   ├── product-actions-menu.tsx
│   │   └── product-filters.tsx
│   ├── product-wizard/
│   │   ├── variant-draft-editor.tsx
│   │   ├── modifier-group-draft-editor.tsx
│   │   ├── media-draft-picker.tsx
│   │   ├── outlet-draft-picker.tsx
│   │   ├── label-row.tsx
│   │   └── index.ts
│   ├── outlets/
│   │   ├── outlet-assignment.tsx
│   │   └── outlet-assignment-row.tsx
│   ├── catalog-empty-state.tsx
│   ├── list-skeleton.tsx
│   ├── review-section.tsx
│   ├── status-badge.tsx
│   └── catalog-layout.tsx
├── hooks/
│   └── ...
├── pages/
│   └── ...
├── routes/
│   └── ...
├── services/
│   ├── products/
│   ├── categories/
│   ├── variants/
│   ├── modifiers/
│   ├── media/
│   ├── product-outlets/
│   └── product-bundle/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Struktur di atas adalah target konseptual. Jangan membuat file/folder yang tidak diperlukan hanya untuk memenuhi template.

## 9. Cross-Module Shared Component Strategy

Sebelum membuat shared component, lakukan tiga tahap:

### Step 1 — Identify repetition

Contoh:

- loading state;
- empty state;
- confirmation dialog;
- field group;
- page header;
- data table;
- status badge yang benar-benar generic.

### Step 2 — Verify domain neutrality

Pertanyaan:

- apakah component memiliki istilah bisnis Catalogs?
- apakah props menggunakan domain entity tertentu?
- apakah component membutuhkan service module tertentu?
- apakah component akan tetap masuk akal untuk Orders/Finances/Settings?

Jika tidak, tetap di module.

### Step 3 — Promote to shared

Hanya setelah dipakai lintas module dan terbukti generic.

## 10. Handling Domain Logic Used by Multiple Modules

Jangan membuat:

```text
app/lib/catalog-utils.ts
```

hanya karena beberapa module membutuhkan logic Catalogs.

Gunakan domain module:

```text
modules/catalogs/
```

atau buat domain module baru jika domain tersebut memang memiliki ownership tersendiri.

Contoh:

```text
modules/pricing/
modules/geography/
modules/merchant/
```

Consumer hanya menggunakan public API.

## 11. Naming Conventions

Gunakan:

- `<domain>-page.tsx`
- `<domain>-card.tsx`
- `<domain>-list.tsx`
- `<domain>-row.tsx`
- `<domain>-form-dialog.tsx`
- `use-<domain>.ts`
- `<domain>.api.ts`
- `<domain>.queries.ts`
- `<domain>.mutations.ts`
- `<domain>.keys.ts`

Hindari:

- `common.ts`;
- `helpers.ts`;
- `manager.tsx`;
- `data.ts`;
- `service.ts`;

ketika nama tersebut tidak menjelaskan ownership.

## 12. File Size Guideline

Target praktis:

- < 300 lines: preferred untuk component normal;
- 300–500 lines: review responsibility;
- > 500 lines: wajib dilakukan responsibility review;
- > 700 lines: split menjadi beberapa unit kecuali alasan kuat dan terdokumentasi.

Angka ini bukan aturan absolut. Single-responsibility dan cohesion tetap menjadi penentu utama.

## 13. Migration Safety

Refactor dilakukan incremental.

Tidak diperbolehkan sekaligus:

- mengganti API contract;
- mengubah data model;
- redesign UI;
- mengganti state management;
- mengganti routing architecture;

dalam migration yang sama.

Setiap batch:

1. refactor;
2. typecheck;
3. test;
4. build;
5. manual smoke test;
6. commit terpisah.

## 14. Git Commit Strategy

Gunakan commit kecil berdasarkan architectural change:

```text
refactor(catalogs): split product components
refactor(catalogs): split modifier editor
refactor(catalogs): split product wizard drafts
refactor(catalogs): organize service layer
refactor(shared): normalize reusable components
refactor(merchant-operations): enforce module boundaries
chore(architecture): add module boundary checks
test(catalogs): co-locate component tests
```

Hindari satu commit raksasa berisi seluruh repository.

## 15. Definition of Done — Repository Refactor

Refactor dianggap selesai ketika semua kondisi berikut terpenuhi:

### Architecture

- [ ] setiap module memiliki ownership yang jelas;
- [ ] route file tipis;
- [ ] page hanya composition/orchestration;
- [ ] component memiliki single responsibility;
- [ ] service layer terpisah dari UI;
- [ ] shared layer tidak bergantung pada module;
- [ ] tidak ada deep import antar-module;
- [ ] cross-module access hanya melalui public API.

### Catalogs

- [ ] `modifier-editor.tsx` telah dipecah;
- [ ] `variant-editor.tsx` telah dipecah;
- [ ] `wizard-drafts.tsx` telah dipecah;
- [ ] `categories-page.tsx` telah dipecah;
- [ ] `outlet-assignment.tsx` telah direview dan dipecah bila diperlukan;
- [ ] Catalog services telah dikelompokkan secara jelas;
- [ ] Catalog API integration tetap bekerja.

### Shared

- [ ] generic component dipusatkan ke shared;
- [ ] domain component tidak berada di shared;
- [ ] shared component tidak bergantung pada module.

### Quality

- [ ] typecheck green;
- [ ] test suite green;
- [ ] production build green;
- [ ] architecture boundary checks green;
- [ ] critical flows smoke-tested;
- [ ] no new cyclic dependency.

## 16. Recommended Execution Order

Prioritas pengerjaan:

1. Architecture guardrails.
2. Catalog wizard.
3. Modifier editor.
4. Variant editor.
5. Categories page.
6. Outlet assignment.
7. Catalog product list/filter/card/actions.
8. Catalog services.
9. Shared component normalization.
10. Merchant Operations.
11. Merchant Registration.
12. Settings.
13. Orders/Promotions/Finances.
14. Remaining supporting modules.
15. Final dependency/test/build audit.

Alasan urutan: Catalogs adalah area dengan kompleksitas UI tertinggi dan sudah aktif terintegrasi API, sehingga hasil refactor-nya dapat menjadi pattern untuk module lain tanpa terlebih dahulu mengganggu seluruh repository.

## 17. Non-Goals

Refactor ini tidak mencakup:

- perubahan endpoint API;
- perubahan payload API;
- perubahan database;
- perubahan product/catalog business rules;
- redesign UI;
- migrasi framework;
- penggantian TanStack Query;
- penggantian React Router;
- penggantian Axios;
- penggantian Zustand;
- pembentukan monorepo.

Semua perubahan tersebut hanya boleh dilakukan melalui PRD/task terpisah.

## 18. Success Criteria

Keberhasilan refactor diukur dari kemampuan developer untuk:

- menemukan seluruh code milik sebuah feature dari folder module;
- menambahkan feature baru tanpa menyentuh module lain kecuali melalui public contract;
- memakai shared component tanpa membawa business logic domain;
- mengubah implementation Catalogs tanpa memecahkan UI module lain;
- mengetahui dependency antar-module melalui `index.ts`;
- menjalankan architecture checks sebelum merge.

Target akhirnya adalah:

> **Feature-first architecture dengan public module boundaries yang enforceable, bukan sekadar folder organization.**
