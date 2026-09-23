# PLAN.md — Integrasi Authorization `jualantar-merchant`

## 1. Tujuan

Dokumen ini adalah rencana implementasi khusus untuk frontend repository `jualantar-merchant`.

Tujuannya adalah mengintegrasikan frontend Merchant dengan authorization contract baru dari `jualantar-api`, tanpa mengubah model authorization backend.

Frontend harus mampu memahami bahwa authorization outlet bersifat contextual:

```text
user + outlet + outlet assignment role + capability
```

Contoh target:

```text
Budi
├── Outlet A → outlet_manager
└── Outlet B → outlet_staff
```

Saat Budi membuka Outlet A, UI dapat menampilkan capability manager. Saat membuka Outlet B, UI hanya menampilkan capability staff.

> API tetap menjadi security boundary. Authorization frontend hanya mengatur UX, navigation, route access, dan action visibility. Semua request tetap harus divalidasi oleh API.

---

## 2. Scope

### In Scope

- Integrasi `/auth/me` dengan `outlet_assignments`.
- Perubahan tipe/model session user.
- Centralized frontend authorization model.
- Outlet-scoped capability resolver.
- Refactor `useOperationsPermissions()`.
- Outlet context berdasarkan `outletId`.
- Route authorization dan 403 handling.
- Navigation filtering.
- Quick-action authorization.
- Settings authorization.
- Outlet detail authorization.
- Outlet employee authorization.
- Operating hours authorization.
- Service area authorization.
- Availability authorization.
- Outlet create/edit authorization sesuai contract API.
- Handling 401/403.
- Query/mutation authorization behavior.
- Multi-outlet authorization tests.
- Cleanup terhadap asumsi permission global lama.
- Documentation dan Definition of Done.

### Out of Scope

Jangan dikerjakan dalam PLAN frontend ini:

- perubahan Spatie role di API;
- perubahan `MerchantOperationsAuthorization` di API;
- perubahan database API;
- perubahan capability mapping backend;
- migration legacy role backend;
- redesign visual UI yang tidak berkaitan dengan authorization;
- integrasi authorization ke module bisnis lain di luar scope Merchant Operations;
- mengganti security boundary API dengan frontend authorization.

---

# 3. Prasyarat API

Frontend baru boleh mengimplementasikan contract final setelah API authorization selesai dan stabil.

Minimal API harus menyediakan:

```json
{
    "id": "...",
    "email": "...",
    "roles": ["merchant"],
    "permissions": [],
    "outlet_assignments": [
        {
            "outlet_id": "...",
            "role": "outlet_manager"
        },
        {
            "outlet_id": "...",
            "role": "outlet_staff"
        }
    ]
}
```

Bentuk response boleh berbeda selama informasi yang dibutuhkan tersedia.

Frontend tidak boleh mengasumsikan bahwa:

```text
user.permissions
```

merepresentasikan capability outlet.

`permissions` global hanya digunakan untuk authorization yang memang bersifat global.

---

# 4. Kondisi Frontend Saat Ini

Berdasarkan audit repository `jualantar-merchant`, authorization saat ini masih banyak bergantung pada permission global.

Area penting:

```text
app/modules/auth/
├── components/protected-route.tsx
└── routes/protected-layout-route.tsx

app/modules/merchant-operations/
├── types/merchant-operations.types.ts
├── utils/permissions.ts
├── components/layout/outlet-scoped-page.tsx
├── components/outlets/outlet-section-nav.tsx
├── pages/outlet-detail-page.tsx
├── pages/outlet-employees-page.tsx
├── pages/outlet-hours-page.tsx
├── pages/outlet-service-area-page.tsx
└── pages/outlet-availability-page.tsx
```

Temuan penting:

1. `OutletUserRole` sudah tersedia:

    ```ts
    export type OutletUserRole =
      | "outlet_manager"
      | "outlet_staff"
    ```

2. `useOperationsPermissions()` saat ini membaca:

    ```ts
    user?.permissions
    ```

3. `ProtectedRoute` saat ini menangani authentication, bukan contextual authorization.

4. `OutletScopedPage` sudah menerima `outletId`, sehingga dapat menjadi salah satu titik integrasi outlet context.

5. `OutletSectionNav` sudah menerima beberapa boolean authorization seperti:

    ```text
    canViewHours
    canViewServiceArea
    canViewEmployees
    canViewAvailability
    ```

6. Beberapa halaman outlet sudah menggunakan `useOperationsPermissions()`, tetapi belum memberikan konteks `outletId`.

7. Bottom navigation dan quick actions masih memiliki item hardcoded yang belum seluruhnya authorization-aware.

---

# 5. Target Architecture

Target frontend:

```text
/auth/me
     │
     ▼
Auth Session
     │
     ├── Global Roles
     ├── Global Permissions
     └── Outlet Assignments
             │
             ▼
      Authorization Resolver
             │
       outletId + action
             │
             ▼
      Effective Capability
             │
      ┌──────┼─────────┐
      ▼      ▼         ▼
 Navigation Routes   Actions
      │      │         │
      └──────┼─────────┘
             ▼
         API Request
             │
             ▼
       API Authorization
             │
        ┌────┴────┐
        ▼         ▼
      2xx       403
```

Prinsip:

```text
Global authorization
    ≠
Outlet authorization
```

Dan:

```text
role
    ↓
capability
    ↓
action
```

bukan:

```text
role literal
    ↓
UI decision
```

---

# 6. Phase 0 — Baseline Frontend

## Tujuan

Membuat baseline sebelum authorization diubah.

## Tasks

- Jalankan test suite.
- Jalankan typecheck.
- Jalankan lint.
- Jalankan build.
- Catat route yang terkait Merchant Operations.
- Catat seluruh penggunaan:
    - `user.permissions`;
    - `hasPermission`;
    - `useOperationsPermissions`;
    - `OutletUserRole`;
    - hardcoded navigation;
    - hardcoded quick actions;
    - route guards.
- Inventarisasi seluruh halaman yang menggunakan `outletId`.

## Acceptance Criteria

- Baseline build hijau.
- Baseline test terdokumentasi.
- Seluruh consumer authorization teridentifikasi.

---

# 7. Phase 1 — Freeze API Authorization Contract

## Tujuan

Menentukan bentuk data yang akan dikonsumsi frontend.

## Tasks

Dokumentasikan contract final:

```text
AuthUser
├── id
├── email
├── global roles
├── global permissions
└── outlet_assignments
    ├── outlet_id
    └── role
```

Tentukan apakah field menggunakan:

```text
outlet_id
```

atau identifier lain.

Jangan membuat resolver frontend sebelum naming contract final.

## Acceptance Criteria

- Response `/auth/me` final.
- `outlet_assignments` tersedia.
- `role` menggunakan nilai yang konsisten dengan `OutletUserRole`.
- Contract terdokumentasi.

---

# 8. Phase 2 — Update Auth User Model

## Target Area

Module:

```text
app/modules/auth/
```

## Tasks

Tambahkan model:

```ts
type OutletAssignment = {
  outletId: string
  role: OutletUserRole
}
```

Kemudian perluas `AuthUser` agar dapat menyimpan:

```text
global roles
global permissions
outlet assignments
```

Hindari duplikasi definisi:

```text
outlet_manager
outlet_staff
```

Gunakan `OutletUserRole` yang sudah ada.

## Acceptance Criteria

- TypeScript mengenali `outlet_assignments`.
- Session user dapat menyimpan assignment per outlet.
- Tidak ada `any`.
- Tidak ada duplicate outlet-role type.

---

# 9. Phase 3 — Normalize `/auth/me`

## Tujuan

Memisahkan API response shape dari model yang digunakan UI.

Jika API menggunakan:

```json
{
    "outlet_assignments": [
        {
            "outlet_id": "123",
            "role": "outlet_manager"
        }
    ]
}
```

frontend boleh melakukan normalization menjadi:

```ts
{
  outletId: "123",
  role: "outlet_manager"
}
```

## Tasks

- Update schema validation.
- Update API response type.
- Update normalization.
- Update session hydration.
- Pastikan missing `outlet_assignments` memiliki behavior yang aman.
- Jangan fallback menjadi global permission untuk outlet authorization.

## Acceptance Criteria

- `/auth/me` tervalidasi.
- Invalid role tidak diam-diam dianggap authorized.
- Session dapat membaca assignment outlet.

---

# 10. Phase 4 — Build Central Authorization Resolver

## Tujuan

Membuat satu sumber keputusan authorization di frontend.

Conceptual API:

```ts
can(permission: string): boolean

canForOutlet(
  outletId: string,
  permission: string
): boolean

roleForOutlet(
  outletId: string
): OutletUserRole | null
```

Resolver harus:

1. mencari assignment berdasarkan `outletId`;
2. membaca role assignment;
3. resolve capability role;
4. mengembalikan boolean.

Contoh:

```text
Budi
A → manager

canForOutlet(A, "merchant.operations.hours.update")
→ true

canForOutlet(B, "merchant.operations.hours.update")
→ false
```

## Rule

Jangan menyebarkan:

```ts
role === "outlet_manager"
```

ke banyak component.

Role-to-capability mapping harus terpusat.

## Acceptance Criteria

- Satu resolver menjadi source of truth frontend.
- Resolver memiliki unit test.
- Tidak ada component yang melakukan role comparison ad-hoc.

---

# 11. Phase 5 — Separate Global and Outlet Authorization

Buat dua konsep eksplisit:

```text
GlobalAuthorization
OutletAuthorization
```

Global:

```ts
can("some.global.permission")
```

Outlet:

```ts
canForOutlet(outletId, "merchant.operations.hours.update")
```

Jangan:

```ts
user.permissions.includes("merchant.operations.hours.update")
```

untuk menentukan capability outlet.

## Acceptance Criteria

- Consumer dapat membedakan global dan outlet permission.
- Outlet permission selalu memiliki `outletId`.

---

# 12. Phase 6 — Refactor `useOperationsPermissions()`

## Current

Saat ini hook membaca permission global.

## Target

Hook harus menerima context:

```ts
useOperationsPermissions(outletId)
```

atau bentuk equivalent yang mengikuti architecture repository.

Return tetap dapat menggunakan API ergonomis:

```ts
{
  canView,
  canUpdateOutlet,
  canUpdateOutletStatus,
  canViewEmployees,
  canAssignEmployee,
  canRemoveEmployee,
  canUpdateEmployeeRole,
  canViewHours,
  canUpdateHours,
  canViewServiceArea,
  canUpdateServiceArea,
  canViewAvailability,
}
```

Tetapi seluruh nilai harus dihitung untuk `outletId`.

## Acceptance Criteria

Untuk:

```text
Outlet A = manager
Outlet B = staff
```

hook menghasilkan capability berbeda sesuai outlet.

---

# 13. Phase 6A — Role-Based UI/UX Contract

## Tujuan

Phase ini menetapkan **kontrak UI/UX eksplisit** untuk `outlet_manager` dan `outlet_staff`.

Kontrak ini wajib menjadi acuan seluruh phase setelahnya. AI agent **tidak boleh membuat keputusan UI berdasarkan asumsi role** di luar matrix dan rules yang ditetapkan di sini.

Role hanya merupakan input domain. UI harus mengambil keputusan melalui **effective capability** dari centralized authorization resolver.

Target:

```text
outlet assignment role
        ↓
role-to-capability mapping
        ↓
effective capability
        ↓
UI behavior
```

Bukan:

```text
role literal
    ↓
UI decision ad-hoc
```

## Scope UI Role

UI role behavior hanya berlaku pada **Merchant Operations dan outlet-scoped UI** yang tercakup dalam PLAN ini.

Jangan memperluas behavior ini ke module bisnis lain.

---

## 6A.1 Shared UI Principle

`outlet_manager` dan `outlet_staff` menggunakan **struktur UI, visual language, route, dan page composition yang sama** selama keduanya memiliki akses ke resource tersebut.

Perbedaan utama adalah:

- navigation visibility;
- page access;
- action visibility;
- editability;
- mutation availability;
- read-only state;
- authorization error behavior.

Jangan membuat dua dashboard atau dua code path besar yang terpisah hanya karena role berbeda.

Target:

```text
Same Page
   │
   ├── Manager → management controls available
   │
   └── Staff   → read-only / limited controls
```

---

## 6A.2 Outlet Context Indicator

Setiap UI outlet-scoped harus memiliki cara yang jelas untuk menunjukkan outlet yang sedang aktif.

Minimal context:

```text
Outlet A
Manager
```

atau:

```text
Outlet B
Staff
```

Context indicator hanya merupakan informasi UX.

**Jangan menggunakan label role pada UI sebagai sumber authorization.**

Authorization tetap menggunakan:

```text
outletId
+
effective capability
```

Jika repository sudah memiliki outlet selector/header yang relevan, gunakan dan extend existing component. Jangan membuat duplicate outlet-context system tanpa kebutuhan.

---

## 6A.3 UI Behavior Matrix

Matrix berikut menjadi kontrak target untuk Merchant Operations.

| Area                     | `outlet_manager`                                  | `outlet_staff`                                          | Authorization basis                            |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| View outlet              | Tampilkan                                         | Tampilkan                                               | `merchant.operations.outlets.view`             |
| Update outlet            | Action/form tersedia                              | Read-only; action update tidak ditampilkan              | `merchant.operations.outlets.update`           |
| View outlet status       | Tampilkan                                         | Tampilkan                                               | outlet view capability                         |
| Update outlet status     | Action tersedia                                   | Action tidak ditampilkan                                | `merchant.operations.outlets.status.update`    |
| View employees           | Tampilkan jika capability tersedia                | Tampilkan hanya jika API contract memberikan capability | `merchant.operations.outlet_users.view`        |
| Assign employee          | Tersedia                                          | Tidak tersedia                                          | `merchant.operations.outlet_users.assign`      |
| Remove employee          | Tersedia                                          | Tidak tersedia                                          | `merchant.operations.outlet_users.remove`      |
| Change employee role     | Tersedia                                          | Tidak tersedia                                          | `merchant.operations.outlet_users.role.update` |
| View operating hours     | Tampilkan                                         | Tampilkan                                               | `merchant.operations.hours.view`               |
| Update operating hours   | Form/action tersedia                              | Read-only; edit action tidak ditampilkan                | `merchant.operations.hours.update`             |
| View service area        | Tampilkan                                         | Tampilkan                                               | `merchant.operations.service_area.view`        |
| Update service area      | Form/action tersedia                              | Read-only; edit action tidak ditampilkan                | `merchant.operations.service_area.update`      |
| View availability        | Tampilkan                                         | Tampilkan                                               | `merchant.operations.availability.view`        |
| Update availability      | Hanya jika capability/API contract final tersedia | Hanya jika capability/API contract final tersedia       | Final API contract                             |
| Create outlet            | Hanya jika global/API capability mengizinkan      | Hanya jika global/API capability mengizinkan            | Final API contract                             |
| Merchant/global settings | Sesuai global capability                          | Sesuai global capability                                | Global authorization                           |

**Penting:**

1. Matrix di atas tidak boleh digunakan untuk mengarang capability baru.
2. Jika capability belum ada dalam final API contract, UI tidak boleh mengasumsikan akses.
3. `outlet_manager` tidak otomatis berarti memiliki seluruh global merchant permission.
4. `outlet_staff` tidak otomatis berarti memiliki seluruh outlet view permission.
5. Untuk `outlet_users.view`, gunakan final API contract sebagai source of truth. Jika final contract tidak memberikan capability kepada staff, navigation/page harus tidak tersedia untuk staff.

---

## 6A.4 Navigation Rules

Navigation harus merepresentasikan **discoverability**, bukan security.

Untuk outlet-scoped navigation:

```text
capability.view
    ↓
menu/section visible
```

Jika user tidak mempunyai capability view:

```text
menu/section hidden
```

Jangan menampilkan outlet feature yang pasti tidak dapat diakses hanya untuk kemudian mengandalkan 403.

Namun, API tetap wajib melakukan authorization.

### Target Outlet Navigation

Manager dapat melihat section yang capability-nya tersedia, misalnya:

```text
Overview
Operating Hours
Service Area
Availability
Employees
```

Staff hanya melihat section yang capability view-nya tersedia.

Jangan hardcode:

```tsx
role === "outlet_manager"
```

untuk menentukan visibility.

---

## 6A.5 Page Rules

Jika user memiliki `view` capability:

```text
→ page accessible
```

Jika user tidak memiliki `view` capability:

```text
→ authorization guard
→ 403
```

Jangan mengubah authorization failure menjadi 404 kecuali resource memang tidak ditemukan atau contract routing memang menetapkannya.

---

## 6A.6 Action Rules

Untuk action mutation:

```text
capability.update
    ↓
action visible/enabled
```

Jika tidak memiliki capability mutation:

```text
action hidden
```

Untuk action yang merupakan bagian intrinsik dari read-only UI, page tetap boleh menampilkan data tanpa control mutation.

Contoh staff pada operating hours:

```text
Monday   08:00 — 22:00
Tuesday  08:00 — 22:00
```

Tanpa:

```text
[Edit]
```

Jangan membuat form edit lalu hanya men-disable semua field jika action memang tidak diperlukan untuk UX.

### Disabled vs Hidden

Default rule:

- **Navigation** → hidden jika tidak accessible.
- **Mutation/action** → hidden jika user memang tidak memiliki capability.
- **Read-only data** → tetap visible jika view capability tersedia.
- **Disabled state** hanya digunakan jika ada alasan UX yang jelas dan konsisten, misalnya action tersedia untuk discovery tetapi belum dapat dilakukan karena state resource, bukan karena authorization.

---

## 6A.7 Outlet Detail UI

Target page:

```text
app/modules/merchant-operations/pages/outlet-detail-page.tsx
```

Manager:

```text
Outlet A
● Active

[ Edit Outlet ]
[ Change Status ]

Overview
Operating Hours
Service Area
Availability
Employees
```

Staff:

```text
Outlet B
● Active

Overview
Operating Hours
Service Area
Availability
```

Jika staff memiliki view capability untuk suatu section, section tetap dapat dibuka tetapi mutation control tidak boleh muncul tanpa capability update.

Jangan membuat page alternatif khusus staff kecuali repository existing architecture benar-benar membutuhkan.

---

## 6A.8 Outlet Status UI

Manager dengan:

```text
merchant.operations.outlets.status.update
```

mendapatkan action:

```text
[ Change Status ]
```

Staff tanpa capability tersebut hanya melihat current status.

Staff tidak boleh mendapatkan dialog/form perubahan status.

Jika API menolak mutation dengan 403 walaupun action sempat terlihat karena stale state:

```text
→ tampilkan authorization error
→ jangan logout
→ jangan menganggap mutation berhasil
```

---

## 6A.9 Employee UI

Target:

```text
outlet-employees-page.tsx
```

Manager:

```text
Employees

[ + Add Employee ]

Employee
Role

[•••]
  View
  Change Role
  Remove
```

Action visibility berdasarkan capability masing-masing.

Staff:

- employee page hanya tersedia jika `outlet_users.view` tersedia pada final API contract;
- tidak mendapatkan assign/remove/change-role mutation;
- jangan menampilkan management controls lalu disable semuanya tanpa kebutuhan UX.

Untuk staff tanpa `outlet_users.view`:

```text
Employees
```

tidak ditampilkan pada outlet navigation dan direct access menghasilkan authorization behavior yang telah ditetapkan.

---

## 6A.10 Operating Hours UI

Manager:

```text
Operating Hours

Monday    08:00 — 22:00
Tuesday   08:00 — 22:00
...

[ Edit ]
```

Staff:

```text
Operating Hours

Monday    08:00 — 22:00
Tuesday   08:00 — 22:00
...

Read-only
```

Jangan membuat staff dapat membuka mutation form.

Capability:

```text
hours.view
hours.update
```

---

## 6A.11 Service Area UI

Manager:

```text
Service Area

[ Map ]

Radius: 5 km

[ Edit Service Area ]
```

Staff:

```text
Service Area

[ Map ]

Radius: 5 km

Read-only
```

Map boleh digunakan untuk viewing jika komponen existing mendukungnya, tetapi mutation seperti mengubah radius/polygon harus membutuhkan:

```text
merchant.operations.service_area.update
```

Jangan membuat mutation baru jika API/frontend contract belum mendukungnya.

---

## 6A.12 Availability UI

Availability harus mengikuti final API capability contract.

Jika hanya `view` yang tersedia:

```text
Manager → view
Staff   → view
```

Jangan membuat update control hanya karena role manager secara konseptual dianggap lebih tinggi.

Jika API contract kemudian menyediakan mutation capability, implementasikan berdasarkan capability tersebut melalui resolver.

---

## 6A.13 Outlet List UI

Outlet list harus tetap satu UI.

Jika repository memiliki role information yang tersedia dari `outlet_assignments`, outlet card dapat menunjukkan context:

```text
Outlet A
Manager

[ Manage Outlet ]
```

dan:

```text
Outlet B
Staff

[ View Outlet ]
```

Label `Manager` / `Staff` hanya untuk orientasi user.

Action tetap ditentukan oleh capability.

Jangan mengasumsikan:

```text
Manager → semua action outlet
Staff → semua action read-only
```

di luar capability matrix.

---

## 6A.14 Outlet Creation UI

`Create Outlet` adalah **merchant/global authorization concern** kecuali final API contract secara eksplisit mendefinisikannya sebagai outlet-role capability.

Karena itu:

- jangan memberikan `Create Outlet` kepada manager hanya karena role-nya `outlet_manager`;
- jangan memberikan `Create Outlet` kepada staff hanya karena user dapat melihat outlet;
- gunakan final API contract untuk menentukan visibility.

Jika tidak ada capability contract yang jelas:

```text
→ jangan invent permission
→ jangan implement role assumption
→ tandai sebagai dependency
```

---

## 6A.15 Quick Actions UI

Quick actions wajib dipisahkan berdasarkan scope:

```text
Global
Merchant-scoped
Outlet-scoped
```

Contoh existing:

```text
Tambah Produk
Tambah Promo
Tambah Outlet
```

harus diaudit satu per satu.

Untuk outlet-scoped quick action:

```text
active outlet
+
capability
→ action visibility
```

Jangan membuat quick action outlet-scoped berdasarkan global role.

Jika contract belum jelas:

```text
→ jangan invent authorization rule
```

---

## 6A.16 Settings UI

Settings harus dibagi secara konseptual:

```text
Global
Merchant
Outlet
```

Menu global/merchant mengikuti global capability.

Menu outlet mengikuti outlet context + capability.

Jangan menggunakan:

```text
merchant role
```

sebagai alasan otomatis untuk menampilkan seluruh settings.

---

## 6A.17 Direct URL dan 403

UI hiding bukan security.

User dapat mencoba:

```text
/outlets/B/hours/edit
```

secara langsung.

Jika authorization resolver mengetahui user tidak memiliki required capability:

```text
→ 403
```

Jika API tetap menerima route tetapi mutation kemudian ditolak:

```text
→ API 403 handling
```

Jangan mengandalkan hidden navigation sebagai satu-satunya protection.

---

## 6A.18 Multi-Outlet UI Acceptance

Skenario wajib:

```text
Budi

Outlet A → outlet_manager
Outlet B → outlet_staff
```

Saat Outlet A aktif:

```text
Edit Outlet        visible
Change Status      visible
Edit Hours         visible
Edit Service Area  visible
Employee Management visible sesuai contract
```

Saat Outlet B aktif:

```text
Edit Outlet        hidden
Change Status      hidden
Edit Hours         hidden
Edit Service Area  hidden
Employee Management hidden jika view capability tidak tersedia
```

Data view yang memang authorized tetap visible.

Saat:

```text
A → B
```

authorization dan UI action harus berubah.

Saat:

```text
B → A
```

authorization dan UI action harus kembali sesuai Outlet A.

Tidak boleh ada stale action dari outlet sebelumnya.

---

## 6A.19 UI State Matrix

Setiap outlet-scoped page harus mempertimbangkan minimal:

```text
Loading authorization
Loading resource
Authorized view
Unauthorized page
Authorized read-only
Authorized mutation
Mutation pending
Mutation success
Mutation 403
Mutation validation error
Resource not found
Session expired
```

Namun jangan membuat state yang tidak relevan terhadap page.

### Contoh staff read-only

```text
Loading
   ↓
Authorized view
   ↓
Read-only content
```

### Contoh manager mutation

```text
Loading
   ↓
Authorized edit
   ↓
Mutation pending
   ↓
Success
```

Jika mutation menghasilkan 403:

```text
Mutation
   ↓
API 403
   ↓
Authorization error
```

Jangan logout otomatis.

---

## 6A.20 Anti-Hallucination Rules untuk UI

AI agent yang mengerjakan phase setelah ini **WAJIB mengikuti rules berikut**:

1. Jangan membuat permission/capability baru yang tidak ada pada API contract.
2. Jangan membuat role baru.
3. Jangan mengubah arti `outlet_manager` atau `outlet_staff`.
4. Jangan menganggap `outlet_manager` sebagai global merchant owner.
5. Jangan menganggap `outlet_staff` tidak boleh melihat data jika API memberikan `view`.
6. Jangan menggunakan `user.permissions` global untuk outlet authorization.
7. Jangan menggunakan `role === "outlet_manager"` sebagai authorization mechanism.
8. Jangan membuat duplicate authorization resolver.
9. Jangan membuat dashboard/page tree terpisah hanya berdasarkan role jika shared UI cukup.
10. Jangan mengubah visual design di luar perubahan yang diperlukan untuk authorization behavior.
11. Jangan membuat backend/API changes dalam repository frontend.
12. Jika API contract tidak cukup untuk menentukan behavior, **stop pada dependency yang terdokumentasi dan jangan mengarang behavior**.
13. API tetap menjadi final security boundary.
14. Setiap action harus dapat ditelusuri:

```text
UI
↓
capability
↓
outletId
↓
resolver
↓
API endpoint
```

15. Setiap query/mutation outlet harus mempertahankan `outletId` yang benar.
16. Jangan menggunakan stale outlet context.
17. Jangan memperkenalkan permission string baru hanya untuk mempermudah UI.
18. Jangan mengubah scope PLAN ke module bisnis lain.

---

## 6A.21 Required UI Test Matrix

Minimal test matrix:

| Scenario                |                  Manager |                    Staff |
| ----------------------- | -----------------------: | -----------------------: |
| View outlet             |                    Allow |                    Allow |
| Update outlet           |                    Allow |                Hide/deny |
| Change outlet status    |                    Allow |                Hide/deny |
| View hours              |                    Allow |                    Allow |
| Update hours            |                    Allow |                Hide/deny |
| View service area       |                    Allow |                    Allow |
| Update service area     |                    Allow |                Hide/deny |
| View availability       |                    Allow |                    Allow |
| Employee view           |       Contract-dependent |       Contract-dependent |
| Assign employee         |                    Allow |                Hide/deny |
| Remove employee         |                    Allow |                Hide/deny |
| Change employee role    |                    Allow |                Hide/deny |
| Direct unauthorized URL |    403 when unauthorized |    403 when unauthorized |
| API mutation 403        | Show authorization error | Show authorization error |

Matrix final wajib diselaraskan dengan final API contract pada Phase 1.

---

## 6A.22 Acceptance Criteria

Phase ini dianggap selesai jika:

- [ ] UI role behavior untuk manager/staff terdokumentasi.
- [ ] Semua outlet-scoped UI menggunakan capability, bukan role literal.
- [ ] Manager dan staff menggunakan shared page structure jika resource sama-sama accessible.
- [ ] Mutation controls hanya muncul jika capability tersedia.
- [ ] Read-only data tetap dapat dilihat jika view capability tersedia.
- [ ] Navigation menggunakan capability.
- [ ] Direct URL tetap dilindungi route authorization.
- [ ] Outlet context indicator tidak menjadi authorization source.
- [ ] Quick actions dibedakan berdasarkan scope.
- [ ] Settings dibedakan berdasarkan global/merchant/outlet scope.
- [ ] Multi-outlet switching mengubah UI action state.
- [ ] Tidak ada capability/role/permission baru yang dibuat tanpa API contract.
- [ ] Tidak ada backend change dalam frontend implementation.
- [ ] Required UI test matrix tersedia.

---

# 13. Phase 7 — Establish Outlet Context

## Tujuan

Memastikan setiap outlet page mengetahui outlet yang sedang digunakan untuk authorization.

## Existing Foundation

`OutletScopedPage` sudah menerima:

```text
outletId
```

## Tasks

- Tetapkan sumber outlet context.
- Prefer route `outletId` sebagai resource context.
- Jangan mengandalkan state global yang dapat berbeda dari URL.
- Pastikan child pages menerima authorization context yang benar.

Target:

```text
/outlets/:outletId
        │
        ▼
     outletId
        │
        ▼
Authorization Resolver
```

## Acceptance Criteria

- Tidak ada outlet page yang menghitung authorization tanpa outlet ID.
- Switching outlet menghasilkan authorization context baru.

---

# 14. Phase 8 — Route Authorization

## Current

`ProtectedRoute` hanya memeriksa authentication.

## Target

Pisahkan:

```text
Authentication Guard
Authorization Guard
```

Authentication:

```text
belum login → /login
```

Authorization:

```text
sudah login
+
tidak punya capability
→ /403
```

Untuk outlet route:

```text
/outlets/:outletId/hours
```

guard harus mengevaluasi:

```text
canForOutlet(
  outletId,
  "merchant.operations.hours.view"
)
```

## Acceptance Criteria

- Unauthenticated → login.
- Authenticated but unauthorized → 403.
- Authorized → page.
- Tidak ada redirect loop.

---

# 15. Phase 9 — 403 Forbidden UX

Buat halaman/route khusus:

```text
403 Forbidden
```

Isi minimal:

- user tidak memiliki akses;
- action kembali;
- kembali ke halaman yang aman.

Jangan menyamarkan authorization failure sebagai:

```text
404
```

kecuali route/resource memang tidak ditemukan.

## Acceptance Criteria

- 403 API dapat ditampilkan dengan UX yang konsisten.
- Route guard menggunakan 403 untuk authorization failure.

---

# 16. Phase 10 — Navigation Authorization

## Target Areas

```text
app/components/layouts/app-shell/
```

Audit:

- bottom navigation;
- sidebar jika ada;
- quick actions;
- menu Merchant Operations.

Navigation harus menggunakan authorization resolver.

Contoh:

```text
Tambah Outlet
```

hanya muncul jika user mempunyai capability yang sesuai.

Jangan mengandalkan:

```ts
if (user.roles.includes("merchant"))
```

untuk action yang sebenarnya outlet-scoped.

## Acceptance Criteria

- Navigation tidak menampilkan fitur yang tidak accessible.
- Navigation tetap usable untuk manager dan staff.
- Tidak ada hardcoded role-based visibility yang bypass resolver.

---

# 17. Phase 11 — Quick Actions

Audit quick actions seperti:

```text
Tambah Produk
Tambah Promo
Tambah Outlet
```

Tentukan mana yang:

- global;
- merchant-scoped;
- outlet-scoped.

Untuk outlet-scoped action, authorization harus menerima outlet context.

Jika action belum memiliki contract API authorization yang jelas, jangan membuat asumsi baru. Tandai sebagai dependency.

---

# 18. Phase 12 — Settings Authorization

Audit:

```text
app/modules/settings/pages/settings-home-page.tsx
```

Untuk setiap item tentukan:

```text
global
merchant
outlet
```

Item yang tidak accessible harus:

- disembunyikan jika memang menu discovery;
- atau tetap terlihat tetapi disabled jika UX membutuhkan discoverability.

Keputusan UX harus konsisten untuk seluruh settings.

---

# 19. Phase 13 — Outlet Detail Authorization

Target:

```text
app/modules/merchant-operations/pages/outlet-detail-page.tsx
```

Refactor:

- update outlet;
- update status;
- section navigation.

Semua menggunakan:

```text
outletId + capability
```

Pastikan `OutletSectionNav` menerima capability yang sudah dihitung untuk outlet tersebut.

## Acceptance Criteria

Manager dapat melakukan action yang sesuai.

Staff tidak mendapatkan control update yang bukan capability-nya.

---

# 20. Phase 14 — Outlet Employee Authorization

Target:

```text
outlet-employees-page.tsx
```

Authorization:

```text
view employees
assign employee
remove employee
change employee role
```

Mapping:

```text
outlet_manager
├── view
├── assign
├── remove
└── role.update

outlet_staff
└── tidak mendapatkan employee-management mutation
```

Frontend tidak boleh menganggap user manager hanya karena global role.

## Important

API tetap harus menolak mutation unauthorized walaupun button tersembunyi.

---

# 21. Phase 15 — Operating Hours

Target:

```text
outlet-hours-page.tsx
```

Pisahkan:

```text
hours.view
hours.update
```

Behavior:

```text
manager
├── view ✓
└── update ✓

staff
├── view ✓
└── update ✗
```

Untuk staff:

- halaman dapat tetap dibuka jika `view` tersedia;
- form/action update tidak ditampilkan atau dibuat read-only.

---

# 22. Phase 16 — Service Area

Target:

```text
outlet-service-area-page.tsx
```

Gunakan:

```text
service_area.view
service_area.update
```

Behavior mengikuti authorization resolver.

---

# 23. Phase 17 — Availability

Target:

```text
outlet-availability-page.tsx
```

Audit capability yang tersedia dari API contract.

Saat ini halaman lebih berfokus pada loading availability.

Jika belum ada mutation frontend, jangan membuat UI mutation baru hanya karena backend memiliki capability.

## Acceptance Criteria

- View authorization diterapkan.
- Mutation hanya diimplementasikan jika API/frontend contract memang tersedia.

---

# 24. Phase 18 — Outlet List & Outlet Creation

Audit:

```text
outlet list
new outlet
```

Tentukan capability:

```text
outlets.view
outlets.create
```

Jika backend tidak memberikan `outlets.create` dalam outlet-role capability, jangan mengasumsikan manager/staff boleh create outlet.

Gunakan contract final API sebagai source.

---

# 25. Phase 19 — Outlet Edit

Target:

```text
outlet edit
```

Authorization:

```text
outlets.update
```

Pastikan:

```text
edit outlet A
```

tidak memakai authorization outlet B karena stale route state.

---

# 26. Phase 20 — API 401/403 Handling

Central Axios/API error handling harus membedakan:

```text
401
→ authentication/session problem

403
→ authorization problem
```

Behavior:

```text
401 → session handling/login
403 → authorization error
```

Jangan otomatis logout user pada setiap 403.

## Acceptance Criteria

- 403 tidak menghapus session.
- User dapat kembali ke page yang authorized.
- Mutation 403 menampilkan feedback yang sesuai.

---

# 27. Phase 21 — Query Behavior

Authorization tidak hanya mengatur UI.

Audit TanStack Query:

- apakah query dijalankan jika user tidak punya view capability?
- apakah query memakai outlet ID?
- apakah cache key memasukkan outlet ID?

Target cache:

```text
["outlet", outletId, "hours"]
```

bukan cache global yang dapat tercampur antar outlet.

## Acceptance Criteria

- Data Outlet A tidak dipakai sebagai data Outlet B.
- Query disabled jika capability view tidak tersedia.
- Cache key memiliki resource/outlet context jika diperlukan.

---

# 28. Phase 22 — Mutation Behavior

Audit seluruh mutation outlet.

Sebelum mutation:

```text
canForOutlet(outletId, capability)
```

Tetapi check frontend bukan pengganti backend authorization.

Jika API mengembalikan:

```text
403
```

maka:

- tampilkan authorization error;
- invalidate/update UI state jika diperlukan;
- jangan menganggap mutation berhasil.

---

# 29. Phase 23 — Session & Authorization Cache

Setelah:

- login;
- logout;
- `/auth/me` refresh;
- employee role change;
- employee assignment;
- employee removal;

authorization context harus tetap konsisten.

Jika role Budi berubah:

```text
Outlet A manager → staff
```

maka capability lama tidak boleh tetap tersimpan di cache.

## Acceptance Criteria

- Session refresh menghasilkan authorization baru.
- Tidak ada stale permission setelah role change.
- Logout membersihkan authorization context.

---

# 30. Phase 24 — Multi-Outlet Switching

Skenario wajib:

```text
Budi
├── Outlet A → manager
└── Outlet B → staff
```

Test:

```text
A:
hours.update       ✓
employee.assign    ✓
service_area.update ✓

B:
hours.view         ✓
hours.update       ✗
employee.assign    ✗
service_area.update ✗
```

Pastikan:

```text
switch A → B
```

langsung mengubah effective authorization.

---

# 31. Phase 25 — Owner / Global Merchant

Jika API mendefinisikan merchant owner sebagai user yang memiliki akses lintas outlet, frontend harus mengikuti contract tersebut.

Frontend tidak boleh membuat asumsi:

```text
merchant
→ outlet_manager semua outlet
```

Sebaliknya:

```text
API authorization contract
→ effective access
→ frontend representation
```

Jika owner memiliki bypass backend, resolver frontend harus memiliki representasi yang eksplisit dan konsisten.

---

# 32. Phase 26 — Component Authorization Rules

Tetapkan rule:

### Navigation

```text
hide unavailable feature
```

### Page

```text
route guard
```

### Action

```text
hide/disable unavailable mutation
```

### API

```text
backend authorization
```

Jangan memasukkan authorization logic kompleks langsung ke component.

Bad:

```tsx
if (
  user.roles.includes("merchant") &&
  user.permissions.includes(...) &&
  ...
)
```

Good:

```tsx
if (permissions.canUpdateHours) {
  ...
}
```

---

# 33. Phase 27 — Centralize Authorization Public API

Module authorization sebaiknya memiliki public API yang jelas.

Conceptual:

```text
authorization/
├── types
├── resolver
├── hooks
├── guards
└── index
```

Consumer tidak boleh mengakses struktur session internal secara langsung hanya untuk memeriksa permission.

Target:

```text
useAuthorization()
useOutletAuthorization(outletId)
useOperationsPermissions(outletId)
```

Gunakan hanya abstraction yang benar-benar dibutuhkan repository.

---

# 34. Phase 28 — Unit Tests

Minimum test:

### Resolver

```text
manager + hours.view → true
manager + hours.update → true
staff + hours.view → true
staff + hours.update → false
```

### Outlet assignment

```text
A manager
B staff
```

Pastikan resolver tidak mencampurkan assignment.

### Unknown outlet

```text
outlet C → no assignment
```

Expected:

```text
false
```

### Invalid role

Expected:

```text
deny
```

---

# 35. Phase 29 — Component Tests

Test minimal:

- Outlet section nav;
- employee action buttons;
- hours update form;
- service area mutation;
- outlet edit;
- navigation;
- quick actions;
- 403 page.

Test kedua role:

```text
manager
staff
```

---

# 36. Phase 30 — Route Tests

Test:

```text
manager → manager page → allow
staff → staff page → allow
staff → manager-only page → 403
unauthenticated → login
```

Untuk outlet-specific route:

```text
/outlets/A/...
/outlets/B/...
```

pastikan context tidak tertukar.

---

# 37. Phase 31 — Integration Test API ↔ Merchant

Setelah API dan frontend selesai, lakukan integration test.

Scenario:

```text
User Budi

Outlet A → manager
Outlet B → staff
```

Test actual API:

```text
A.hours.update → 2xx
B.hours.update → 403
```

Frontend:

```text
A → update UI visible
B → update UI hidden/disabled
```

Ini membuktikan:

```text
Frontend authorization
        +
Backend authorization
```

konsisten.

---

# 38. Phase 32 — Legacy Authorization Cleanup

Search seluruh frontend untuk:

```text
outlet_manager
outlet_staff
merchant.operations.*
user.permissions
hasPermission
```

Tujuannya bukan menghapus semua penggunaan.

Tujuannya mengidentifikasi penggunaan yang:

```text
masih valid sebagai global
```

vs:

```text
seharusnya outlet-scoped
```

Hapus asumsi lama seperti:

```text
global permission = outlet permission
```

---

# 39. Phase 33 — Over-Authorization Audit

Cari kondisi:

```text
frontend menampilkan action
```

padahal:

```text
API akan 403
```

Ini biasanya terjadi karena frontend masih menggunakan global permission.

Setiap action harus dapat ditelusuri:

```text
UI action
↓
capability
↓
outletId
↓
authorization resolver
↓
API endpoint
```

---

# 40. Phase 34 — Under-Authorization Audit

Cari kondisi sebaliknya:

```text
API mengizinkan
```

tetapi:

```text
frontend menyembunyikan feature
```

karena resolver frontend salah.

Fokus terutama pada:

- manager;
- owner;
- multi-outlet user.

---

# 41. Phase 35 — Performance Audit

Authorization resolver tidak boleh:

- melakukan network request setiap render;
- melakukan query API berulang;
- menghitung mapping secara mahal.

Ideal:

```text
auth/me
    ↓
session memory/cache
    ↓
synchronous resolver
```

Jika memakai memoization, pastikan dependency mencakup:

```text
user
outletId
assignments
```

---

# 42. Phase 36 — UX Consistency

Pastikan seluruh module menggunakan pola yang konsisten:

```text
No access to page
→ 403

No access to action
→ hidden/disabled

Session expired
→ login/session handling

API 403 after mutation
→ authorization error
```

Jangan membuat setiap page memiliki behavior berbeda.

---

# 43. Phase 37 — Documentation

Dokumentasikan:

## Global Authorization

```text
user
↓
global roles/permissions
```

## Outlet Authorization

```text
user
↓
outlet assignment
↓
outlet role
↓
capability
```

## Developer Rule

Setiap membuat fitur outlet:

```text
1. Resolve outletId.
2. Tentukan capability.
3. Gunakan centralized authorization hook.
4. Guard page/action.
5. Tetap biarkan API melakukan enforcement.
```

---

# 44. Phase 38 — Final Regression

Jalankan:

```text
lint
typecheck
test
build
```

Kemudian manual verification:

### Manager

```text
Outlet A → manager
```

Pastikan seluruh manager capability tersedia.

### Staff

```text
Outlet B → staff
```

Pastikan hanya capability staff tersedia.

### Multi-outlet

```text
A → manager
B → staff
```

Switch:

```text
A → B → A
```

dan pastikan authorization berubah sesuai context.

### Unauthorized

Direct URL:

```text
/outlets/B/manager-only-feature
```

harus menghasilkan:

```text
403
```

atau behavior route authorization yang telah ditetapkan.

---

# 45. Definition of Done

## API Contract

- [ ] `/auth/me` contract final.
- [ ] `outlet_assignments` tersedia.
- [ ] Global permission dan outlet capability terpisah.
- [ ] `OutletUserRole` konsisten.

## Authorization Core

- [ ] Central authorization resolver tersedia.
- [ ] Outlet authorization menerima `outletId`.
- [ ] Tidak ada authorization outlet berbasis global permission.
- [ ] Role-to-capability mapping terpusat.

## Role-Based UI

- [ ] Manager/staff UI contract implemented.
- [ ] Shared page structure digunakan bila resource accessible untuk kedua role.
- [ ] Navigation menggunakan effective capability.
- [ ] Mutation controls menggunakan effective capability.
- [ ] Staff read-only state diterapkan pada resource yang dapat dilihat tetapi tidak dapat diubah.
- [ ] Outlet context indicator konsisten.
- [ ] Direct unauthorized access menghasilkan 403 behavior.
- [ ] Multi-outlet switching memperbarui seluruh UI authorization state.
- [ ] Tidak ada ad-hoc `role === ...` authorization di component.

## Merchant Operations

- [ ] `useOperationsPermissions()` outlet-aware.
- [ ] Outlet detail authorization.
- [ ] Employee authorization.
- [ ] Operating hours authorization.
- [ ] Service area authorization.
- [ ] Availability authorization.
- [ ] Outlet edit authorization.
- [ ] Outlet creation authorization sesuai contract.

## Navigation

- [ ] Sidebar/menu authorization.
- [ ] Bottom navigation authorization bila diperlukan.
- [ ] Quick action authorization.
- [ ] Settings authorization.

## Routes

- [ ] Authentication guard.
- [ ] Authorization guard.
- [ ] Outlet-aware route guard.
- [ ] 403 page.

## API Errors

- [ ] 401 ditangani sebagai authentication issue.
- [ ] 403 ditangani sebagai authorization issue.
- [ ] 403 tidak menyebabkan logout otomatis.

## Data/Cache

- [ ] Query memiliki outlet context.
- [ ] Cache tidak mencampur outlet.
- [ ] Authorization state tidak stale setelah session refresh.
- [ ] Role/assignment changes direfleksikan setelah refresh.

## Testing

- [ ] Resolver tests.
- [ ] Manager tests.
- [ ] Staff tests.
- [ ] Multi-outlet tests.
- [ ] Route guard tests.
- [ ] Component authorization tests.
- [ ] 401/403 tests.
- [ ] API integration tests.
- [ ] Full regression pass.

---

# 46. Critical Acceptance Scenario

Scenario ini menjadi acceptance test utama:

```text
User: Budi

Outlet A
role = outlet_manager

Outlet B
role = outlet_staff
```

Saat berada di Outlet A:

```text
View outlet             ✓
Update outlet            ✓
Update outlet status     ✓
View employees           ✓
Assign employee          ✓
Remove employee          ✓
Change employee role     ✓
View hours               ✓
Update hours             ✓
View service area        ✓
Update service area      ✓
View availability        ✓
```

Saat berada di Outlet B:

```text
View outlet             ✓
Update outlet            ✗
Update outlet status     ✗
View employees           ✓/✗ sesuai API contract final
Assign employee          ✗
Remove employee          ✗
Change employee role     ✗
View hours               ✓
Update hours             ✗
View service area        ✓
Update service area      ✗
View availability        ✓
```

Matrix final harus mengikuti capability contract API yang sudah dibekukan.

---

# 47. Migration / Implementation Order

Urutan frontend:

```text
Phase 0  — Baseline
    ↓
Phase 1  — Freeze API contract
    ↓
Phase 2  — Auth user model
    ↓
Phase 3  — Normalize /auth/me
    ↓
Phase 4  — Central authorization resolver
    ↓
Phase 5  — Separate global/outlet authorization
    ↓
Phase 6  — Refactor useOperationsPermissions
    ↓
Phase 6A — Role-based UI/UX contract
    ↓
Phase 7  — Establish outlet context
    ↓
Phase 8  — Route authorization
    ↓
Phase 9  — 403 UX
    ↓
Phase 10 — Navigation
    ↓
Phase 11 — Quick actions
    ↓
Phase 12 — Settings
    ↓
Phase 13 — Outlet detail
    ↓
Phase 14 — Employees
    ↓
Phase 15 — Operating hours
    ↓
Phase 16 — Service area
    ↓
Phase 17 — Availability
    ↓
Phase 18 — Outlet list/create
    ↓
Phase 19 — Outlet edit
    ↓
Phase 20 — 401/403 API handling
    ↓
Phase 21 — Query behavior
    ↓
Phase 22 — Mutation behavior
    ↓
Phase 23 — Session/cache consistency
    ↓
Phase 24 — Multi-outlet switching
    ↓
Phase 25 — Owner/global merchant
    ↓
Phase 26 — Component rules
    ↓
Phase 27 — Central public API
    ↓
Phase 28 — Unit tests
    ↓
Phase 29 — Component tests
    ↓
Phase 30 — Route tests
    ↓
Phase 31 — API ↔ Merchant integration
    ↓
Phase 32 — Legacy cleanup
    ↓
Phase 33 — Over-authorization audit
    ↓
Phase 34 — Under-authorization audit
    ↓
Phase 35 — Performance
    ↓
Phase 36 — UX consistency
    ↓
Phase 37 — Documentation
    ↓
Phase 38 — Final regression
    ↓
Frontend Authorization Sign-off
```

---

# 48. Final Architecture

```text
                    /auth/me
                       │
                       ▼
              ┌─────────────────┐
              │  Auth Session   │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
 Global Authorization       Outlet Assignments
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                         Outlet A          Outlet B
                         manager            staff
                              │               │
                              └───────┬───────┘
                                      ▼
                         Authorization Resolver
                                      │
                              outletId + action
                                      │
                    ┌─────────────────┼────────────────┐
                    ▼                 ▼                ▼
               Navigation          Routes           Actions
                    │                 │                │
                    └─────────────────┼────────────────┘
                                      ▼
                                  API Request
                                      │
                                      ▼
                              Backend Authorization
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                            ALLOW            403
```

## Final Principle

Frontend authorization bukan pengganti API authorization.

Frontend bertugas:

```text
discoverability
navigation
route UX
action visibility
403 UX
```

API bertugas:

```text
security
resource authorization
outlet context enforcement
capability enforcement
```

Target akhirnya:

```text
jualantar-api
    │
    │ authorization contract
    ▼
jualantar-merchant
    │
    ├── global authorization
    └── outlet authorization
            │
            ├── navigation
            ├── route guards
            ├── page actions
            └── mutation UX
```

Dengan demikian `jualantar-merchant` tidak lagi menganggap permission outlet sebagai permission global user, dan skenario multi-outlet seperti:

```text
Budi
├── Outlet A → manager
└── Outlet B → staff
```

dapat direpresentasikan secara benar di seluruh frontend.
