# PRD — Merchant Self-Onboarding (Full)

## 1. Identitas

- **Project:** JualAntar Merchant
- **Repositori:** `@jualantar-merchant` (frontend), `@jualantar-api` (backend)
- **Feature:** Self-onboarding merchant penuh (daftar akun → verifikasi email → wizard registrasi → submit → kelola status, termasuk perbaikan saat ditolak)
- **Stack:** React Router 7 Framework Mode + SSR, React 19, TS, Tailwind v4, shadcn/ui, TanStack Query v5, React Hook Form, Zod, Zustand, Axios, PWA (frontend). Laravel + Sanctum (backend).
- **Target:** Mobile-first PWA.

---

## 2. Kondisi Saat Ini (Analisis Codebase)

### Backend (`@jualantar-api`)

- **Sudah ada:** `POST /api/v1/customers/register` sebagai template self-onboarding (email, phone, username, full_name, password+confirmed → `provisionCustomer` assign role `customer` → kirim email verifikasi). Login menolak user belum verifikasi (`hasVerifiedEmail`). Role `merchant` sudah ada di `RbacSeeder` (permission `merchant.view/update`, `products.*`, `orders.view`).
- **Gap yang harus ditutup:**
  1. Belum ada `provisionMerchant` (assign role `merchant`).
  2. Belum ada endpoint signup merchant.
  3. Email verifikasi bawaan menautkan ke URL API (JSON), bukan halaman frontend PWA.
  4. Belum ada endpoint `rejected → draft` (reopen) dan `rejection_stage`/`rejection_reason` belum diekspos di `MerchantRegistrationResource`.

### Frontend (`@jualantar-merchant`)

- **Sudah ada:** `modules/auth` (login, token bearer, `useSession`, protected route), `modules/merchant-registration` (wizard 9 langkah, draft lazy, status screen pending/active/suspended/rejected), `modules/service-catalog`, `geography`, `bank-directory`, mobile shell (`MobileScreen`, `ScreenHeader`, `ActionBar`), `app/lib/api.ts` (normalisasi RFC 9457).
- **Gap:** belum ada halaman signup, check-email, verify-email; belum ada aksi reopen untuk rejected.

---

## 3. Tujuan

1. Merchant mendaftar akun sendiri dari nol tanpa intervensi admin.
2. Email diverifikasi sebelum dapat masuk.
3. Setelah masuk, wizard registrasi berjalan seperti sekarang (draft lazy, resume, submit → pending).
4. Merchant menangani seluruh lifecycle: daftar → verifikasi → isi data → submit → **perbaiki bila ditolak → kirim ulang**.
5. Tidak ada business state registration di Zustand; TanStack Query tetap source of truth.

---

## 4. Scope

### In Scope

- Signup akun merchant (email, phone, full_name, password).
- Checkbox syarat & ketentuan (wajib centang, tanpa catatan backend).
- Alur verifikasi email dengan deep-link ke frontend.
- Kirim ulang email verifikasi.
- Halaman masuk diperbarui dengan CTA daftar.
- Alur rejected → re-edit → re-submit (termasuk routing ke langkah yang ditolak).
- Validasi, error handling, loading, rate-limit UX.
- Test service/component/page.

### Out of Scope

- Produk/katalog, dashboard merchant, driver, order, payment, settlement, wallet, KYC provider.
- Onboarding customer/partner lain.
- Persetujuan admin (review dashboard).
- Migrasi user customer → merchant.

---

## 5. User Flow

```text
Daftar (merchant/register)
  ├─ email + phone + nama + password + syarat
  ↓
Sukses → Cek email (check-email)
  ├─ resend bila perlu
  ↓
Klik link verifikasi di email (frontend /merchant/verify-email)
  ↓
Verifikasi sukses → Masuk (login)
  ↓
Wizard registrasi merchant (existing flow)
  ↓
Submit → Pending
  ↓
[Rejected] → Status screen + "Perbaiki & kirim ulang"
  → reopen → kembali ke langkah terkait → submit ulang
```

---

## 6. Backend Changes (`@jualantar-api`)

### 6.1 `UserProvisioning::provisionMerchant()`

- Tambah method pada contract + `EloquentUserProvisioning`; membuat user lalu `assignRole('merchant')`. DTO yang sama (`UserData`).

### 6.2 Endpoint signup merchant

```http
POST /api/v1/merchants/register     (throttle: merchant.register, mis. 5/menit)
```

Request:

```json
{
  "email": "merchant@usaha.id",
  "phone": "081234567890",
  "full_name": "Nama Pemilik",
  "password": "rahasia123",
  "password_confirmation": "rahasia123",
  "terms_accepted": true
}
```

Response `201`:

```json
{ "data": { "id": "uuid", "email": "...", "phone": "...", "email_verified": false } }
```

Validasi (mirror `RegisterCustomerRequest`):

- email: required, email, max 100, unique `users.email`
- phone: required, normalize via `Phone`, max 30, unique `users.phone`
- full_name: required, max 150
- password: required, confirmed, min 8, harus ada huruf & angka
- terms_accepted: required, boolean, harus `true`
- Duplicate → 422 `validation_error`; rate limit → 429.

### 6.3 Link verifikasi ke frontend

- Ubah notifikasi verifikasi untuk user merchant agar URL menunjuk `{MERCHANT_APP_URL}/merchant/verify-email?id={id}&hash={hash}&expires={expires}&signature={signature}` (pakai signed URL yang sama, hanya base-nya diganti).
- Config baru: `merchant_app_url` / env `MERCHANT_APP_URL`. Implementasi: custom notification/Mailable untuk merchant (role merchant).
- Endpoint API yang dipanggil frontend tetap existing `GET /api/v1/auth/email/verify/{id}/{hash}` (signed, return 204). `POST /api/v1/auth/email/verification-notification` dipakai untuk resend (sudah ada, throttle).

### 6.4 Rejected → re-edit

```http
POST /api/v1/merchants/registration/reopen
```

- Tanpa payload. Hanya valid saat `status === rejected` → transisi ke `draft`. Guard ownership (user pemilik). Response `200`:

```json
{ "data": { "merchant_id": "uuid", "status": "draft" } }
```

- Error: 404 `merchant_registration_not_found`, 409 `invalid_registration_state` bila bukan rejected.
- Ekspos `rejection_stage`, `rejection_reason` di `MerchantRegistrationResource` (sebelumnya sudah diminta).

### 6.5 Catatan

- Backend tetap authority untuk kelayakan submit (`registration_incomplete`).
- Tidak menambah field `terms_accepted` di tabel (MVP sesuai keputusan).

---

## 7. Frontend Changes

### 7.1 Route baru (publik, di luar protected layout)

```text
/merchant/register         → modules/auth/routes/register.tsx
/merchant/check-email      → modules/auth/routes/check-email.tsx
/merchant/verify-email     → modules/auth/routes/verify-email.tsx
```

`app/routes.ts` tetap thin registry. `/login` mendapat CTA "Belum punya akun? Daftar merchant".

### 7.2 `modules/auth` additions

- **types:** `RegisterMerchantInput`, `RegisteredMerchant`, `VerifyParams`.
- **schemas:** `register.schema.ts` (email, phone Indonesia, full_name, password + confirmed, terms checkbox), `password` policy sama dengan backend.
- **services:** `auth.api.ts` tambah `registerMerchant()`, `resendVerification()`, `verifyEmail()`; query keys terkait.
- **components:**
  - `register-form.tsx` — RHF + Zod; map error 422 ke field (`applyApiFieldErrors`), show alert untuk error umum/rate-limit; tombol disabled saat submit.
  - `check-email-screen.tsx` — info "cek email", email prefilled dari query param, tombol resend (debounce/cooldown), link ke login.
  - `verify-email-page.tsx` — baca query `id, hash, expires, signature`; panggil `GET /auth/email/verify/{id}/{hash}?expires=&signature=`; state loading/success/error; CTA masuk; jika signature expired/invalid tampilkan tombol resend.

### 7.3 Rejected re-edit di `modules/merchant-registration`

- **services:** `merchant-registration.api.ts` tambah `reopenRegistration()`; mutation `useReopenRegistration()` (invalidate detail).
- **`RegistrationStatusScreen`:** saat `status === rejected`, tambah tombol **"Perbaiki & kirim ulang"** → mutate reopen → on success invalidate (layout otomatis pindah ke wizard draft).
- **Routing langkah ditolak:** map `rejection_stage` → langkah:
  - `merchant` → `business`
  - `identity` → `identity`
  - `legal_entity` → `legal-entity`
  - `outlet` → `outlets`
  - `document` → `documents`
  - `payout` → `payout`
  - fallback → `firstIncompleteStep`
  - (Bila `rejection_stage` null/absent, pakai `firstIncompleteStep`.)
- Wizard kembali editable karena status sudah `draft`; semua guard `requireDraft` backend aktif normal.

### 7.4 Reused infra

- `app/lib/api.ts` (interceptor bearer, 401 handling, error normalization), `useSession`, protected route, mobile shell — tidak berubah signifikan.

---

## 8. State & Form Architecture

- Signup: React Hook Form + Zod + mutation TanStack Query. Form state lokal per halaman.
- Verify email: TanStack Query mutation, bukan form.
- Registration: tetap seperti sekarang (TanStack Query, tidak ada Zustand untuk business state).

---

## 9. Error Handling

- 422 field errors → ke field (email/phone/full_name/password).
- 403 `invalid_verification` / signature expired di halaman verify → state error + CTA resend.
- 429 → pesan rate-limit + cooldown.
- 409 `invalid_registration_state` (reopen) → alert.
- Network → pesan koneksi + retry.

---

## 10. UX (Mobile-first)

- Halaman register satu kolom, header brand, tombol submit sticky (`ActionBar`).
- Checkbox terms dengan link (placeholder) — required.
- Check-email: ikon email, tombol resend dengan cooldown countdown.
- Verify: state sukses → CTA "Masuk"; gagal → CTA "Kirim ulang email".
- Rejected: alasan ditampilkan (dari `rejection_reason`), CTA jelas ke langkah terkait.

---

## 11. Testing

- **Service:** `registerMerchant`, `resendVerification`, `verifyEmail`, `reopenRegistration` (URL, method, payload, mapping, error normalization).
- **Component:** validasi register (terms wajib, password policy, format phone), resend cooldown, verify sukses/expired, status rejected dengan CTA reopen.
- **Page:** render register, check-email, verify.
- **Schema:** register.schema (terms, phone, password).
- Backend tests (tanggung jawab `@jualantar-api`): register → role merchant + verifikasi email + link frontend; reopen hanya dari rejected; rejection fields di resource.

---

## 12. Phases

1. **Backend prerequisites** (`@jualantar-api`): `provisionMerchant`, `POST /merchants/register`, custom verification link, `POST /merchants/registration/reopen`, ekspos rejection fields. *(Blocker untuk integrasi nyata; frontend pakai typed boundary + fixture sampai tersedia.)*
2. **Auth signup:** route, schema, form, check-email, resend.
3. **Verify email page.**
4. **Login entry polish** (CTA daftar) + guard.
5. **Rejected re-edit:** reopen mutation, stage→step mapping, status screen CTA.
6. **Quality:** typecheck, test:run, format.

Verifikasi:

```bash
bun run typecheck
bun run test:run
bun run format
```

---

## 13. Acceptance Criteria

- [ ] Merchant daftar akun sendiri tanpa admin.
- [ ] Email + phone unik divalidasi; password sesuai policy.
- [ ] Terms wajib dicentang.
- [ ] Email verifikasi menautkan ke halaman frontend.
- [ ] User tanpa verifikasi tidak bisa login.
- [ ] Resend email verifikasi berfungsi (dengan cooldown).
- [ ] Setelah verifikasi, login → wizard registrasi berjalan.
- [ ] Draft dibuat sekali (lazy), bisa resume.
- [ ] Rejected: alasan tampil, "Perbaiki & kirim ulang" → reopen → kembali ke langkah terkait → submit ulang → pending.
- [ ] Tidak ada HTTP langsung dari component; TanStack Query owns server state; Zod owns validation.
- [ ] Typecheck, test, format lulus.

---

## 14. Definition of Done

- Seluruh flow di atas dapat dipakai dari daftar akun sampai submit ulang.
- Backend contract baru sudah terintegrasi dan diuji.
- Backend tests (register, verify link, reopen, rejection fields) lulus di `@jualantar-api`.
- Frontend: `bun run typecheck`, `bun run test:run`, `bun run format` lulus.

---

## 15. Risiko / Catatan

- **Backend dependency pertama:** verifikasi link + reopen harus rilis di `@jualantar-api` sebelum integrasi nyata bisa diuji end-to-end.
- **Email template** Laravel default di-override khusus merchant (role check) agar tidak mengubah alur customer.
- **Edge case:** email sudah terdaftar sebagai customer → tidak bisa daftar merchant dengan email sama (unique global). Ditandai sebagai batasan; solusi (upgrade role) di luar scope.