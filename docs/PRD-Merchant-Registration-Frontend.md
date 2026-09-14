# PRD --- Merchant Registration Frontend

## 1. Identitas

- **Project:** JualAntar Merchant
- **Repository:** `@jualantar-merchant`
- **Backend:** `@jualantar-api`
- **Feature:** Merchant Registration
- **Frontend stack:** React Router 7.15.1 Framework Mode + SSR, React
  19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query v5, React
  Hook Form, Zod, Zustand, Axios, PWA.
- **Package manager:** Bun.
- **Target:** Mobile-first PWA untuk merchant.

---

## 2. Hasil Analisis Codebase

### Frontend saat ini

Struktur aktual masih berupa application shell dan belum memiliki module
business feature:

```text
app/
├── components/
├── hooks/
├── lib/
├── pwa/
├── routes/
│   ├── home.tsx
│   └── offline.tsx
├── root.tsx
└── routes.ts
```

`app/routes.ts` saat ini hanya mendaftarkan `home` dan `offline`.

Konvensi yang harus dipakai:

```text
app/modules/<module>/
├── components/
├── hooks/
├── pages/
├── routes/
├── services/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Aturan penting:

- API menggunakan satu Axios instance `app/lib/api.ts`.
- Server state menggunakan TanStack Query.
- Mutation menggunakan TanStack Query mutation.
- React Router loader/action bukan pola default.
- Zod untuk runtime validation.
- Zustand hanya untuk global UI/client state.
- Route file default export; komponen/service/page menggunakan named
  export.
- Shared layer tidak boleh berisi business logic Merchant.
- Test menggunakan Vitest + Testing Library dan co-located test.
- Import alias adalah `~/`.
- Package manager adalah Bun.

Catatan: `docs/ARCHITECTURE.md` masih memiliki referensi v8/Data Mode,
tetapi `AGENTS.md`, `package.json`, dan setup aktual menggunakan React
Router 7.15.1 Framework Mode. Implementasi mengikuti setup aktual.

### Backend saat ini

Backend sudah menyediakan Merchant Registration sebagai bagian dari
module `Merchant`.

Base endpoint:

```text
/api/v1/merchants/registration
```

Semua endpoint registration menggunakan:

```text
auth:sanctum
```

Endpoint yang tersedia:

```http
POST   /api/v1/merchants/registration
GET    /api/v1/merchants/registration
PATCH  /api/v1/merchants/registration

PUT    /api/v1/merchants/registration/identity
PUT    /api/v1/merchants/registration/legal-entity
PUT    /api/v1/merchants/registration/service
PUT    /api/v1/merchants/registration/categories

POST   /api/v1/merchants/registration/outlets
PATCH  /api/v1/merchants/registration/outlets/{outlet}
DELETE /api/v1/merchants/registration/outlets/{outlet}

POST   /api/v1/merchants/registration/uploads
POST   /api/v1/merchants/registration/documents

PUT    /api/v1/merchants/registration/payout-account

GET    /api/v1/merchants/registration/review
POST   /api/v1/merchants/registration/submit
```

Backend juga sudah menangani:

- draft merchant;
- identity;
- legal entity;
- service;
- categories;
- outlets;
- presigned upload;
- documents;
- payout account;
- review;
- submit;
- temporary URL untuk file private;
- ownership berdasarkan authenticated user.

---

## 3. Tujuan

Membangun alur Merchant Registration pada frontend yang:

1.  Mobile-first.
2.  Dapat dikerjakan bertahap melalui wizard.
3.  Dapat ditinggalkan dan dilanjutkan kembali.
4.  Menyimpan setiap step ke backend.
5.  Tidak menyimpan business state registration utama di Zustand.
6.  Menggunakan TanStack Query sebagai server-state source of truth.
7.  Mendukung upload langsung ke object storage melalui presigned URL.
8.  Menampilkan review sebelum submit.
9.  Menangani status draft, pending, rejected, dan active dengan benar.

---

## 4. Scope

### In Scope

- Merchant Registration module.
- Wizard registration.
- Draft/resume.
- Business type.
- Business profile.
- Merchant identity.
- Legal entity untuk business type `company`.
- Service selection.
- Category selection maksimal 3.
- Outlet management.
- Geography selection.
- Operating hours.
- Logo upload.
- Optional document upload.
- Payout account.
- Review.
- Submit.
- Validation.
- API error handling.
- Loading/error states.
- Upload progress.
- Responsive/mobile UX.
- Unit/component/service tests.

### Out of Scope

- Product/catalog.
- Merchant approval dashboard.
- Driver.
- Order.
- Payment.
- Settlement.
- Wallet.
- KYC provider.
- Real-time tracking.
- Merchant analytics.

---

## 5. User Flow

```text
Login
  ↓
Merchant Registration
  ↓
Create / Resume Draft
  ↓
01 Jenis Usaha
  ↓
02 Data Usaha
  ↓
03 Identitas
  ↓
04 Legal Entity (company only)
  ↓
05 Layanan
  ↓
06 Kategori
  ↓
07 Outlet & Lokasi
  ↓
08 Logo & Dokumen
  ↓
09 Rekening Payout
  ↓
10 Review
  ↓
Submit
  ↓
Status: Pending
```

User dapat kembali ke step sebelumnya tanpa kehilangan data yang sudah
tersimpan.

---

## 6. Route Frontend

Module:

```text
app/modules/merchant-registration/
```

Route hierarchy:

```text
/merchant/registration
/merchant/registration/business
/merchant/registration/identity
/merchant/registration/legal-entity
/merchant/registration/service
/merchant/registration/categories
/merchant/registration/outlets
/merchant/registration/documents
/merchant/registration/payout
/merchant/registration/review
```

Recommended route structure:

```text
modules/merchant-registration/routes/
├── registration-layout.tsx
├── index.tsx
├── business.tsx
├── identity.tsx
├── legal-entity.tsx
├── service.tsx
├── categories.tsx
├── outlets.tsx
├── documents.tsx
├── payout.tsx
└── review.tsx
```

`app/routes.ts` hanya menjadi registry:

```text
app/routes.ts
        ↓
merchant-registration/routes/*
```

Protected route harus berada di route boundary. Registration tidak boleh
dapat diakses tanpa authentication.

---

## 7. Module Structure

Target:

```text
app/modules/merchant-registration/
├── components/
│   ├── registration-shell.tsx
│   ├── registration-header.tsx
│   ├── registration-progress.tsx
│   ├── registration-navigation.tsx
│   ├── business-type-form.tsx
│   ├── business-profile-form.tsx
│   ├── identity-form.tsx
│   ├── legal-entity-form.tsx
│   ├── service-selector.tsx
│   ├── category-selector.tsx
│   ├── outlet-form.tsx
│   ├── outlet-list.tsx
│   ├── operating-hours-form.tsx
│   ├── file-upload.tsx
│   ├── document-list.tsx
│   ├── payout-account-form.tsx
│   └── registration-review.tsx
├── hooks/
│   ├── use-registration.ts
│   ├── use-registration-navigation.ts
│   └── use-registration-upload.ts
├── pages/
│   ├── registration-page.tsx
│   ├── business-page.tsx
│   ├── identity-page.tsx
│   ├── legal-entity-page.tsx
│   ├── service-page.tsx
│   ├── categories-page.tsx
│   ├── outlets-page.tsx
│   ├── documents-page.tsx
│   ├── payout-page.tsx
│   └── review-page.tsx
├── routes/
├── services/
│   ├── merchant-registration.api.ts
│   ├── merchant-registration.queries.ts
│   ├── merchant-registration.mutations.ts
│   └── merchant-registration.keys.ts
├── schemas/
│   ├── business.schema.ts
│   ├── identity.schema.ts
│   ├── legal-entity.schema.ts
│   ├── outlet.schema.ts
│   ├── payout.schema.ts
│   └── upload.schema.ts
├── types/
│   └── merchant-registration.types.ts
└── index.ts
```

Folder hanya dibuat bila memang diperlukan; jangan membuat file/folder
kosong sekadar mengikuti template.

---

## 8. Server State

Merchant registration adalah server state.

Gunakan TanStack Query:

```text
GET registration
        ↓
useQuery
        ↓
registration cache
```

Mutation:

```text
Form
 ↓
useMutation
 ↓
API
 ↓
invalidate/update registration query
```

Query key:

```text
merchantRegistrationKeys.detail()
```

Contoh:

```ts
export const merchantRegistrationKeys = {
  all: ["merchant-registration"] as const,
  detail: () => [...merchantRegistrationKeys.all, "detail"] as const,
  review: () => [...merchantRegistrationKeys.all, "review"] as const,
}
```

Jangan menggunakan Zustand untuk menyimpan seluruh data wizard.

Zustand hanya boleh digunakan jika ada kebutuhan global UI, misalnya
preferensi UI tertentu.

---

## 9. API Client

Buat:

```text
app/lib/api.ts
```

Satu Axios instance untuk seluruh frontend.

Module hanya memanggil API melalui service:

```text
Page
 ↓
Hook
 ↓
TanStack Query
 ↓
merchant-registration.api.ts
 ↓
~/lib/api
 ↓
Laravel API
```

Component tidak boleh melakukan:

```ts
axios.get(...)
fetch(...)
```

secara langsung.

---

## 10. API Mapping

### Create Draft

```http
POST /api/v1/merchants/registration
```

Request:

```json
{}
```

Response:

```json
{
    "data": {
        "merchant_id": "uuid",
        "status": "draft"
    }
}
```

Frontend menggunakan endpoint ini saat user mulai registration jika
draft belum ada.

---

### Get Draft

```http
GET /api/v1/merchants/registration
```

Response utama:

```json
{
    "data": {
        "id": "uuid",
        "business_name": null,
        "slug": "...",
        "description": null,
        "type": null,
        "status": "draft",
        "logo": null,
        "logo_url": null,
        "service": null,
        "identity": null,
        "legal_entity": null,
        "categories": [],
        "outlets": [],
        "documents": [],
        "payout_accounts": []
    }
}
```

Response ini menjadi sumber data untuk resume wizard.

---

## 11. Business Profile

Endpoint:

```http
PATCH /api/v1/merchants/registration
```

Payload:

```json
{
    "business_name": "Warung Sentarum",
    "type": "individual",
    "description": "..."
}
```

Field:

- `business_name`
- `type`
- `description`

Type:

```text
individual
company
```

Business type menentukan apakah step Legal Entity ditampilkan.

---

## 12. Identity

Endpoint:

```http
PUT /api/v1/merchants/registration/identity
```

Payload:

```json
{
    "id_type": "ktp",
    "id_number": "6101...",
    "full_name": "Nama Lengkap",
    "birth_date": "1999-01-01"
}
```

Pilihan `id_type`:

```text
ktp
sim
paspor
```

Frontend validation mengikuti backend:

- id type required;
- id number required;
- full name required;
- birth date optional;
- birth date harus tanggal sebelum hari ini.

---

## 13. Legal Entity

Hanya ditampilkan jika:

```text
type === "company"
```

Endpoint:

```http
PUT /api/v1/merchants/registration/legal-entity
```

Payload:

```json
{
    "entity_type": "pt",
    "name": "PT Contoh",
    "nib": "....",
    "npwp": "....",
    "address": "....",
    "province_id": 61,
    "regency_id": 6101,
    "district_id": 610101,
    "village_id": 6101012001,
    "postal_code": "78711"
}
```

Entity type:

```text
pt
cv
ud
koperasi
yayasan
```

Geography selector harus menggunakan data Geography API/module yang
tersedia, bukan hardcoded list.

---

## 14. Service

Endpoint:

```http
PUT /api/v1/merchants/registration/service
```

Payload:

```json
{
    "service_id": "uuid"
}
```

Service list harus diambil dari backend Service domain.

Frontend hanya menyimpan `service_id`; nama/icon/metadata berasal dari
API.

---

## 15. Categories

Endpoint:

```http
PUT /api/v1/merchants/registration/categories
```

Payload:

```json
{
    "category_ids": ["uuid-1", "uuid-2"]
}
```

Rules:

- minimal 1;
- maksimal 3;
- UUID;
- tidak boleh duplicate.

Category list harus difilter berdasarkan selected service.

---

## 16. Outlet

Create:

```http
POST /api/v1/merchants/registration/outlets
```

Update:

```http
PATCH /api/v1/merchants/registration/outlets/{outlet}
```

Delete:

```http
DELETE /api/v1/merchants/registration/outlets/{outlet}
```

Payload utama:

```json
{
    "name": "Outlet Utama",
    "phone": "08...",
    "email": "merchant@example.com",
    "address": "Jl. ...",
    "province_id": 61,
    "regency_id": 6101,
    "district_id": 610101,
    "village_id": 6101012001,
    "postal_code": "78711",
    "latitude": 0.12345678,
    "longitude": 111.12345678,
    "service_area_type": "radius",
    "service_radius_km": 5,
    "operating_hours": {
        "monday": [
            {
                "open": "08:00",
                "close": "17:00"
            }
        ]
    }
}
```

Service area:

```text
radius
province
regency
district
village
```

Frontend harus memvalidasi:

- latitude: -90 sampai 90;
- longitude: -180 sampai 180;
- radius wajib jika `service_area_type = radius`;
- operating hours menggunakan `HH:mm`.

Minimal satu outlet aktif harus tersedia sebelum submit.

---

## 17. Upload Architecture

Frontend tidak mengirim file binary ke Laravel.

Flow:

```text
Frontend
   │
   │ POST /registration/uploads
   │ JSON metadata
   ▼
Laravel
   │
   │ presigned URL
   ▼
Frontend
   │
   │ PUT binary
   ▼
Object Storage
```

Request:

```http
POST /api/v1/merchants/registration/uploads
```

Payload:

```json
{
    "purpose": "logo",
    "file_name": "logo.png",
    "mime_type": "image/png",
    "file_size": 123456
}
```

Purpose:

```text
logo
document
```

Response:

```json
{
    "data": {
        "object_key": "merchants/{merchant_id}/logo/{uuid}.png",
        "upload_url": "https://...",
        "headers": {},
        "expires_at": "..."
    }
}
```

Frontend kemudian:

```ts
await axios.put(upload_url, file, {
  headers,
})
```

Request PUT ke object storage tidak melewati Laravel API.

### Logo

Backend otomatis menyimpan `object_key` logo ketika purpose = `logo`.

Setelah upload berhasil, frontend melakukan refresh/invalidation
registration query agar `logo_url` terbaru tersedia.

### Document

Setelah file berhasil di-upload ke object storage, frontend harus attach
metadata:

```http
POST /api/v1/merchants/registration/documents
```

Payload:

```json
{
    "document_type": "ktp",
    "object_key": "merchants/.../documents/...",
    "file_name": "ktp.jpg",
    "mime_type": "image/jpeg",
    "file_size": 123456
}
```

Document types:

```text
ktp
npwp
nib
siup
akta_pendirian
lainnya
```

Dokumen bersifat optional pada MVP.

---

## 18. Upload UX

Component `file-upload.tsx` harus menangani:

```text
idle
selected
requesting-upload-url
uploading
success
error
```

UX minimum:

- file picker;
- preview untuk image;
- nama file;
- ukuran file;
- progress;
- cancel/reset;
- retry;
- error message;
- disable submit saat upload belum selesai.

Validasi client harus dilakukan sebelum meminta presigned URL:

- MIME type;
- extension;
- ukuran;
- file kosong.

Backend tetap menjadi authority validation.

---

## 19. Payout Account

Endpoint:

```http
PUT /api/v1/merchants/registration/payout-account
```

Payload:

```json
{
    "bank_id": 1,
    "account_number": "123456789",
    "account_name": "Nama Pemilik"
}
```

Frontend membutuhkan bank directory dari backend.

Field:

- bank;
- account number;
- account name.

Payout account tidak boleh dianggap sama dengan Merchant status.

---

## 20. Review

Endpoint:

```http
GET /api/v1/merchants/registration/review
```

Review menampilkan:

- business profile;
- identity;
- legal entity jika company;
- service;
- categories;
- outlets;
- documents;
- payout account;
- logo.

Setiap section memiliki action:

```text
Edit
```

yang mengarahkan user kembali ke step terkait.

---

## 21. Submit

Endpoint:

```http
POST /api/v1/merchants/registration/submit
```

Tidak membutuhkan payload.

Success:

```json
{
    "data": {
        "merchant_id": "uuid",
        "status": "pending"
    }
}
```

Setelah sukses:

```text
Registration
     ↓
Pending Approval
```

Frontend harus mengarahkan user ke status/pending screen.

User tidak boleh kembali mengedit registration sebagai draft setelah
status menjadi `pending`.

---

## 22. Registration State

Frontend harus memahami state backend:

```text
draft
pending
active
suspended
rejected
```

Mapping:

---

Status Frontend behavior

---

draft Wizard editable

pending Registration read-only

active Redirect ke merchant dashboard

suspended Tampilkan status/informasi

rejected Tampilkan alasan/rejection state
dan flow re-edit sesuai backend

unknown Fallback error state
-----------------------------------------------------------------------

Jangan membuat status frontend baru yang tidak ada di backend.

---

## 23. Draft & Resume

Saat user membuka:

```text
/merchant/registration
```

Frontend:

1.  Fetch registration.
2.  Jika 404/not found → create draft.
3.  Jika draft → tentukan step pertama yang belum lengkap.
4.  Jika pending → tampilkan pending state.
5.  Jika active → arahkan dashboard.
6.  Jika rejected → tampilkan rejection state.

Penentuan step dapat dibuat melalui:

```text
useRegistrationNavigation()
```

Tetapi jangan menjadikan frontend sebagai authority terhadap eligibility
submit. Backend tetap menentukan validitas submit.

---

## 24. Form Architecture

Gunakan:

```text
React Hook Form
+
Zod
+
TanStack Query mutation
```

Pattern:

```text
Page
 ↓
Form Component
 ↓
React Hook Form
 ↓
Zod
 ↓
Mutation Hook
 ↓
Service
 ↓
Axios
```

Form state hanya hidup pada step aktif.

Jangan membuat satu form besar untuk seluruh wizard.

---

## 25. Error Handling

API error mengikuti RFC 9457 Problem Details.

`app/lib/api.ts` harus menormalisasi response error menjadi bentuk
konsisten untuk module.

UI harus membedakan:

```text
validation error
authentication error
authorization error
conflict
network error
server error
```

Field validation harus dipetakan kembali ke React Hook Form bila backend
memberikan field errors.

Global toast hanya digunakan untuk feedback yang memang cocok sebagai
toast.

Error yang memerlukan koreksi field harus ditampilkan dekat field.

---

## 26. Loading & Offline

Karena aplikasi adalah PWA:

- gunakan skeleton/loading state;
- disable mutation button ketika pending;
- cegah duplicate submission;
- tampilkan offline banner yang sudah tersedia;
- jangan menganggap registration mutation dapat dilakukan offline;
- file upload harus membutuhkan koneksi aktif.

Draft utama tetap disimpan di backend.

Local persistence untuk draft form hanya boleh ditambahkan jika ada
kebutuhan nyata dan harus dipisahkan dari server state.

---

## 27. Accessibility & Mobile UX

Registration harus mobile-first:

- satu kolom pada mobile;
- touch target minimal nyaman untuk jari;
- sticky navigation untuk Next/Back;
- progress indicator;
- keyboard-friendly form;
- visible validation;
- confirmation sebelum menghapus outlet/document jika diperlukan;
- tidak menggunakan hover sebagai satu-satunya affordance.

Desktop menggunakan layout yang lebih lebar tanpa mengubah flow.

---

## 28. Testing

Testing frontend:

### Service

Test:

- endpoint URL;
- HTTP method;
- request payload;
- response mapping;
- error normalization.

### Query/Mutation

Test:

- fetch registration;
- create draft;
- update profile;
- save identity;
- save legal entity;
- save service;
- save categories;
- outlet CRUD;
- upload URL;
- document attachment;
- payout;
- review;
- submit.

### Components

Test:

- validation;
- conditional legal entity;
- max 3 categories;
- outlet form;
- file upload states;
- review;
- navigation.

### Page

Test:

- route renders;
- draft resume;
- pending state;
- active redirect behavior;
- rejected state.

Test files co-located:

```text
components/
  business-profile-form.tsx
  business-profile-form.test.tsx

services/
  merchant-registration.api.ts
  merchant-registration.api.test.ts
```

---

## 29. Implementation Phases

### Phase 1 --- Frontend Infrastructure

- `app/lib/api.ts`
- API error normalization.
- TanStack Query provider.
- authentication integration prerequisite.
- protected route boundary.

### Phase 2 --- Module Foundation

- `merchant-registration` module.
- route hierarchy.
- registration layout.
- progress/navigation.
- query keys.
- types.

### Phase 3 --- Draft & Business

- create draft.
- get draft.
- business profile.
- resume logic.

### Phase 4 --- Identity & Legal Entity

- identity form.
- conditional legal entity.
- geography selectors.

### Phase 5 --- Service & Category

- service query.
- service selection.
- category query/filter.
- max 3 categories.

### Phase 6 --- Outlet

- outlet CRUD.
- geography.
- coordinates.
- operating hours.
- outlet list.

### Phase 7 --- Storage

- upload URL request.
- direct PUT upload.
- logo.
- document attachment.
- preview/error/retry.

Development can initially use backend's local storage implementation;
frontend must not depend on Cloudflare R2 directly. The upload contract
remains the same.

### Phase 8 --- Payout

- bank list.
- payout form.
- saved payout state.

### Phase 9 --- Review & Submit

- review page.
- edit links.
- submit mutation.
- pending state.

### Phase 10 --- Quality

- unit tests.
- component tests.
- integration tests.
- typecheck.
- test run.
- formatting.

Verification:

```bash
bun run typecheck
bun run test:run
bun run format
```

---

## 30. Acceptance Criteria

### Registration

- [ ] Authenticated merchant can start registration.
- [ ] Draft is created exactly once.
- [ ] Draft can be resumed.
- [ ] Each step persists to backend.
- [ ] Browser refresh does not lose saved registration data.

### Business

- [ ] Individual/company selection works.
- [ ] Legal entity only appears for company.
- [ ] Business validation matches backend.

### Identity

- [ ] Identity can be saved and resumed.
- [ ] Invalid birth date is rejected.

### Service/Category

- [ ] Service list comes from API.
- [ ] Category list follows selected service.
- [ ] Maximum 3 categories enforced.

### Outlet

- [ ] Multiple outlets supported.
- [ ] Create/update/delete works.
- [ ] Coordinates validated.
- [ ] Operating hours supported.
- [ ] Radius required for radius service area.

### Storage

- [ ] Frontend requests presigned URL.
- [ ] File is uploaded directly to object storage.
- [ ] Binary file never passes through Laravel API.
- [ ] Logo preview works.
- [ ] Document attachment stores returned object key.
- [ ] Upload errors can be retried.

### Payout

- [ ] Bank can be selected.
- [ ] Account data saved successfully.

### Review/Submit

- [ ] Review shows complete registration data.
- [ ] User can edit each section.
- [ ] Submit is disabled while mutation is running.
- [ ] Successful submit results in `pending`.
- [ ] Pending registration becomes read-only.

### Engineering

- [ ] No direct HTTP request from components.
- [ ] TanStack Query owns server state.
- [ ] Zod owns frontend runtime validation.
- [ ] No registration business state in global Zustand.
- [ ] Module boundary follows project architecture.
- [ ] Tests pass.
- [ ] Typecheck passes.
- [ ] Formatting passes.

---

## 31. Architectural Decisions

1.  Merchant Registration adalah **frontend feature module**, bukan
    global feature.
2.  Server state menggunakan **TanStack Query**.
3.  Form state menggunakan **React Hook Form**.
4.  Runtime validation menggunakan **Zod**.
5.  Global UI state menggunakan **Zustand hanya bila diperlukan**.
6.  Semua HTTP request melalui `app/lib/api.ts`.
7.  Route hierarchy dimiliki module.
8.  Backend tetap menjadi source of truth untuk registration state dan
    submit eligibility.
9.  File binary tidak dikirim ke Laravel; gunakan presigned upload.
10. Frontend tidak perlu mengetahui apakah backend storage menggunakan
    local storage atau Cloudflare R2.
11. Catalog/product tidak masuk Merchant Registration.
12. Payout account tetap dikonsumsi melalui API Merchant Registration;
    frontend tidak mengakses database/domain Payout secara langsung.
13. Cross-module data seperti Service, Geography, dan Bank selalu
    diambil melalui API backend.
14. Tidak membuat `merchant_registrations` state/store/table di
    frontend.
15. Tidak membuat model/domain frontend yang meniru seluruh domain
    Laravel; frontend hanya memiliki DTO/type yang dibutuhkan UI.

---

## 32. Dependency Backend

Frontend Merchant Registration menganggap backend berikut sudah
tersedia:

```text
Merchant Registration API
Service API
Geography API
Bank Directory API
Authentication API
Storage/Presigned Upload API
```

Jika salah satu dependency belum tersedia, implementasi frontend harus
menggunakan typed service boundary dan mock/test fixture, bukan
hardcoded production data.

---

## 33. Definition of Done

Merchant Registration frontend dianggap selesai apabila:

- seluruh wizard dapat digunakan dari awal sampai submit;
- draft dapat di-resume;
- seluruh endpoint registration terintegrasi;
- upload menggunakan presigned URL;
- UI mobile-first;
- status pending ditangani;
- validation frontend dan backend konsisten;
- error API tampil dengan benar;
- tidak ada HTTP call langsung dari component;
- TanStack Query digunakan untuk server state;
- tests utama lulus;
- `bun run typecheck` lulus;
- `bun run test:run` lulus;
- formatting lulus.
