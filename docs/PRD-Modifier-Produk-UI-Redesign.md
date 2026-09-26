# PRD — Revisi UI Modifier Produk

**Project:** JualAntar — Merchant Catalog  
**Module:** Product Catalog / Modifier  
**Dokumen:** Product Requirements Document  
**Status:** Draft  
**Fokus:** Revisi UI/UX halaman pengelolaan Modifier Produk  
**Referensi visual:** UI redesign yang disepakati pada percakapan ini

---

## 1. Ringkasan

Dokumen ini mendefinisikan kebutuhan revisi UI/UX pada halaman **Modifier Produk** di aplikasi merchant JualAntar.

Revisi difokuskan pada perubahan presentasi dan interaction design agar halaman:

- lebih modern dan premium;
- lebih compact;
- lebih mudah dipindai oleh merchant;
- memiliki hierarchy yang jelas antara **Modifier Group** dan **Modifier Option**;
- mengurangi penggunaan nested card dan border yang berlebihan;
- tetap nyaman digunakan ketika sebuah produk memiliki banyak modifier group dan option.

Perubahan ini **tidak mengubah konsep bisnis modifier** yang sudah ada. Fokus utama adalah penyusunan ulang struktur visual dan interaksi pada halaman.

---

# 2. Latar Belakang

UI saat ini menampilkan Modifier Group sebagai card yang berisi card/row terpisah untuk setiap modifier option. Setiap option juga memiliki tombol edit dan delete secara langsung.

Struktur tersebut menyebabkan beberapa masalah UX:

1. Terlalu banyak border dan visual container.
2. Hierarchy antara group dan option kurang kuat.
3. Tombol aksi edit/delete terlalu banyak dan membuat interface terlihat ramai.
4. Istilah teknis seperti `Single` dan `1 pilihan` kurang natural untuk merchant.
5. Tombol `Tambah Modifier` pada level option berpotensi membingungkan karena yang ditambahkan sebenarnya adalah modifier option.
6. Halaman menjadi semakin panjang ketika jumlah modifier bertambah.
7. Belum ada affordance yang jelas untuk mengatur urutan option.

---

# 3. Tujuan

## 3.1 Primary Goal

Mendesain ulang halaman Modifier Produk menjadi interface yang:

- clean;
- modern;
- compact;
- mudah dipahami merchant;
- scalable untuk banyak modifier group;
- memiliki hierarchy visual yang jelas.

## 3.2 Secondary Goals

- Mengurangi visual noise.
- Memperjelas perbedaan antara Modifier Group dan Modifier Option.
- Menjadikan action utama lebih mudah ditemukan.
- Menyiapkan UI untuk penggunaan drag & drop ordering.
- Mendukung collapse/expand Modifier Group.
- Mempertahankan pola visual JualAntar dengan primary color merah.

---

# 4. Scope

## 4.1 In Scope

Revisi mencakup:

- Header halaman Modifier Produk.
- Modifier Group card/section.
- Modifier Group metadata.
- Modifier Option list.
- Modifier Option action menu.
- Drag handle.
- Collapse/expand group.
- Tombol `Tambah pilihan`.
- Tombol `Tambah modifier group`.
- Bottom action navigation.
- Responsive/mobile presentation.
- Empty state pada modifier group.
- Visual hierarchy, typography, spacing, border, radius, dan color treatment.

## 4.2 Out of Scope

Tidak termasuk dalam PRD ini:

- Perubahan database schema.
- Perubahan API contract.
- Perubahan business rules modifier.
- Perubahan mekanisme pricing.
- Integrasi modifier dengan order/checkout.
- Perubahan customer-facing product page.
- Pembuatan module modifier baru dari sisi backend.
- Perubahan flow katalog di luar halaman Modifier Produk.
- Perubahan permission/authorization.

Jika implementasi membutuhkan perubahan data atau API untuk mendukung drag & drop ordering, perubahan tersebut harus diperlakukan sebagai technical follow-up terpisah.

---

# 5. Terminologi

| Istilah             | Definisi                                                         |
| ------------------- | ---------------------------------------------------------------- |
| Modifier Group      | Kelompok pilihan yang dapat dipilih customer untuk sebuah produk |
| Modifier Option     | Pilihan individual di dalam Modifier Group                       |
| Required / Wajib    | Customer harus memilih sesuai minimum selection                  |
| Optional / Opsional | Customer tidak wajib memilih option                              |
| Single              | Maksimal satu option dapat dipilih                               |
| Multiple            | Lebih dari satu option dapat dipilih                             |
| Drag Handle         | Area untuk melakukan drag & drop pada group atau option          |
| Context Menu        | Menu `⋮` yang berisi action seperti Edit, Duplikat, dan Hapus    |

---

# 6. Prinsip UX

## 6.1 Group > Option Hierarchy

Hierarchy harus terlihat jelas:

```text
Modifier Produk
  ├── Modifier Group
  │     ├── Modifier Option
  │     ├── Modifier Option
  │     └── Modifier Option
  │
  └── Modifier Group
        ├── Modifier Option
        └── Modifier Option
```

Modifier Group menjadi container utama.

Modifier Option menjadi flat list di dalam group.

---

## 6.2 Reduce Visual Noise

Hindari:

- card di dalam card;
- terlalu banyak shadow;
- terlalu banyak icon action;
- border berat;
- tombol edit/delete permanen pada setiap row.

Gunakan:

- subtle border;
- spacing konsisten;
- divider;
- typography hierarchy;
- contextual menu.

---

## 6.3 Merchant-Friendly Language

Gunakan bahasa yang mudah dipahami merchant.

Contoh:

### Hindari

```text
Wajib • Single • 1 pilihan
```

### Gunakan

```text
Wajib • Pilih 1
```

Untuk group multiple:

```text
Opsional • Pilih beberapa
```

atau jika batas maksimum tersedia:

```text
Opsional • Pilih hingga 4
```

---

# 7. Target UI

## 7.1 Page Header

Halaman harus memiliki header:

```text
← Kembali

Modifier Produk

Atur pilihan tambahan untuk produk ini.
Pelanggan akan melihat pilihan ini saat memesan produk.
```

### Requirements

- Tampilkan navigation back.
- Judul menggunakan typography utama.
- Deskripsi menggunakan warna secondary text.
- Header tidak menggunakan card.
- Spacing antara title dan description harus compact.

---

# 8. Modifier Group

Modifier Group ditampilkan sebagai white card dengan:

- rounded corner;
- subtle border;
- minimal/no shadow;
- internal spacing yang konsisten.

Contoh struktur:

```text
┌─────────────────────────────────────────┐
│ ⠿  🌶  Level Pedas                 ⋮  │
│       Pilih tingkat kepedasan...       │
│                                         │
│       [Wajib] [Pilih 1] [4 pilihan]    │
│─────────────────────────────────────────│
│                                         │
│ ⠿  Tidak Pedas                    Rp 0 │
│ ⠿  Sedang                         Rp 0 │
│ ⠿  Pedas                          Rp 0 │
│ ⠿  Extra Pedas                    Rp 0 │
│                                         │
│ + Tambah pilihan                        │
└─────────────────────────────────────────┘
```

---

# 9. Modifier Group Header

Header group harus terdiri dari:

### 9.1 Drag Handle

Gunakan drag handle di sisi kiri jika group dapat diurutkan.

Contoh:

```text
⠿
```

Drag handle tidak boleh terlihat seperti button utama.

---

### 9.2 Optional Group Icon

Group dapat memiliki visual identifier/icon.

Contoh:

- Level Pedas → icon chili
- Tambahan → icon topping
- Pilihan Nasi → icon rice
- Pilihan Minuman → icon drink

Icon bersifat visual enhancement dan bukan field wajib.

---

### 9.3 Group Name

Contoh:

```text
Level Pedas
Tambahan
Pilihan Nasi
```

Nama group harus memiliki typography yang lebih kuat daripada option.

---

### 9.4 Group Description

Jika description tersedia, tampilkan di bawah nama.

Contoh:

```text
Level Pedas
Pilih tingkat kepedasan sesuai selera pelanggan.
```

Description bersifat secondary.

---

### 9.5 Group Metadata

Gunakan compact badges/chips.

Contoh:

```text
[● Wajib] [☷ Pilih 1] [⌁ 4 pilihan]
```

Untuk optional:

```text
[● Opsional] [☷ Pilih beberapa] [⌁ 4 pilihan]
```

Metadata harus lebih kecil daripada group title.

---

### 9.6 Collapse / Expand

Modifier Group harus dapat di-collapse.

Expanded:

```text
⌃ Level Pedas
```

Collapsed:

```text
⌄ Level Pedas
```

Saat collapsed:

- option list tidak ditampilkan;
- metadata group tetap terlihat;
- group header tetap dapat diakses.

Tujuannya agar merchant dapat mengelola banyak modifier group tanpa halaman menjadi terlalu panjang.

---

### 9.7 Context Menu

Gunakan `⋮` di sisi kanan group.

Menu minimal:

```text
Edit
Duplikat
Hapus
```

Action `Hapus` harus menggunakan confirmation dialog sebelum data dihapus.

---

# 10. Modifier Option List

Modifier option tidak lagi menggunakan nested card yang berat.

Gunakan compact list row.

Contoh:

```text
⠿  Tidak Pedas                         Rp 0   ⋮
⠿  Sedang                              Rp 0   ⋮
⠿  Pedas                               Rp 0   ⋮
⠿  Extra Pedas                         Rp 0   ⋮
```

---

## 10.1 Option Row

Setiap row memiliki:

1. Drag handle.
2. Nama option.
3. Harga tambahan.
4. Context menu.

Contoh:

```text
⠿  Telur                         Rp 5.000  ⋮
```

---

## 10.2 Harga

Format harga:

```text
Rp 0
Rp 2.000
Rp 5.000
Rp 20.000
```

Harga ditempatkan di sisi kanan dan menggunakan secondary/neutral text.

Harga `Rp 0` tetap ditampilkan agar informasi pricing konsisten.

---

## 10.3 Option Context Menu

Gunakan menu `⋮`.

Minimum action:

```text
Edit
Duplikat
Hapus
```

Jika sistem membutuhkan action tambahan di masa depan, dapat ditambahkan ke menu tanpa mengubah struktur row.

---

# 11. Drag & Drop

UI harus menyediakan visual affordance untuk ordering.

## 11.1 Modifier Group

Group dapat memiliki drag handle:

```text
⠿ Level Pedas
```

## 11.2 Modifier Option

Option dapat memiliki drag handle:

```text
⠿ Tidak Pedas
⠿ Sedang
⠿ Pedas
⠿ Extra Pedas
```

## 11.3 Behavior

Ketika drag dilakukan:

- item yang dipindahkan mendapatkan visual state;
- posisi drop harus terlihat jelas;
- list melakukan reordering;
- urutan baru dipertahankan setelah save/submit sesuai kemampuan data layer yang tersedia.

Jika persistence ordering belum didukung backend, implementasi UI dapat dibatasi pada visual interaction dan perubahan data lokal sampai API ordering tersedia.

---

# 12. Tambah Pilihan

Di setiap Modifier Group gunakan:

```text
+ Tambah pilihan
```

Bukan:

```text
+ Tambah Modifier
```

Alasannya:

- Group adalah modifier group.
- Item di dalam group adalah modifier option.
- Terminologi harus mencerminkan hierarchy tersebut.

Tombol dapat menggunakan subtle red background/border sebagai CTA sekunder.

---

# 13. Tambah Modifier Group

Di bawah seluruh Modifier Group:

```text
+ Tambah modifier group
```

Button menggunakan style outlined/dashed atau subtle CTA.

Tujuannya agar secara visual berbeda dengan `Tambah pilihan`.

Hierarchy:

```text
Modifier Group
    └── + Tambah pilihan

Modifier Group
    └── + Tambah pilihan

+ Tambah modifier group
```

---

# 14. Empty State Modifier Group

Jika group belum memiliki option:

```text
Level Pedas
Wajib · Pilih 1

Belum ada pilihan

+ Tambah pilihan
```

Empty state harus sederhana dan tidak mengambil terlalu banyak ruang.

---

# 15. Bottom Navigation / Action Area

Gunakan sticky action area di bagian bawah halaman.

Layout desktop/mobile mengikuti viewport yang tersedia.

```text
┌─────────────────────────────────────────────┐
│ ← Kembali              Lanjut →             │
└─────────────────────────────────────────────┘
```

### Button

**Kembali**

- secondary/outline;
- tidak menggunakan primary red.

**Lanjut**

- primary red;
- memiliki arrow;
- menjadi primary CTA halaman.

Contoh:

```text
[ ← Kembali ]        [ Lanjut → ]
```

---

# 16. Responsive Behavior

UI harus tetap nyaman pada mobile.

## Mobile

Prioritas:

- compact spacing;
- option row 48–56px;
- action menu menggunakan `⋮`;
- modifier group dapat collapse;
- bottom action tetap mudah dijangkau.

Contoh:

```text
Level Pedas                         ⋮
Wajib · Pilih 1

⠿ Tidak Pedas                Rp 0  ⋮
⠿ Sedang                     Rp 0  ⋮
⠿ Pedas                      Rp 0  ⋮
⠿ Extra Pedas                Rp 0  ⋮

+ Tambah pilihan
```

## Desktop

Jika viewport lebih besar:

- content dapat menggunakan max-width;
- card tidak boleh melebar berlebihan;
- whitespace horizontal dapat diperbesar;
- option row tetap compact.

---

# 17. Visual Design Specification

## 17.1 Overall Style

Arah visual:

**Clean Minimal + Modern POS / Merchant Dashboard**

Karakter:

- modern;
- clean;
- professional;
- compact;
- friendly;
- low visual noise.

---

## 17.2 Color

Primary:

```text
JualAntar Red
```

Digunakan untuk:

- primary CTA;
- active action;
- add action;
- destructive action;
- selected/required accent.

Neutral:

- white background;
- light gray page background;
- dark gray primary text;
- muted gray secondary text;
- subtle gray border.

Jangan menggunakan red sebagai background seluruh card.

---

## 17.3 Border

Gunakan border yang sangat subtle.

Modifier Group:

```text
1px solid neutral-light
```

Option:

- dapat menggunakan divider;
- jika menggunakan border, gunakan radius dan contrast rendah.

Hindari nested heavy borders.

---

## 17.4 Border Radius

Rekomendasi:

- Group card: `12–16px`
- Button: `10–12px`
- Option row: `10–12px`
- Badge: `8–10px`

Nilai akhir mengikuti design token yang sudah tersedia di project.

---

## 17.5 Shadow

Shadow harus minimal.

Prioritaskan:

```text
border > shadow
```

Gunakan shadow hanya jika dibutuhkan untuk elevation/action state.

---

# 18. Interaction States

UI harus memiliki state berikut.

## 18.1 Default

Normal state.

## 18.2 Hover

Desktop:

- row mendapat subtle background change;
- context menu menjadi lebih visible.

## 18.3 Pressed

Button menunjukkan pressed state.

## 18.4 Focus

Keyboard focus harus terlihat.

## 18.5 Dragging

Item yang sedang dipindahkan memiliki:

- elevation;
- background berbeda;
- visual drop indicator.

## 18.6 Disabled

Button disabled harus tetap terbaca tetapi tidak terlihat sebagai CTA aktif.

## 18.7 Delete Confirmation

Penghapusan group/option harus meminta konfirmasi.

Contoh:

```text
Hapus modifier?

Modifier "Level Pedas" akan dihapus.
Tindakan ini tidak dapat dibatalkan.

[Batal] [Hapus]
```

---

# 19. Content Example

Untuk kebutuhan development dan visual QA, gunakan data contoh berikut:

## Modifier Group 1

```text
Nama:
Level Pedas

Description:
Pilih tingkat kepedasan sesuai selera pelanggan.

Status:
Wajib

Selection:
Single

Minimum:
1

Maximum:
1
```

Options:

```text
Tidak Pedas    Rp 0
Sedang         Rp 0
Pedas          Rp 0
Extra Pedas    Rp 0
```

---

## Modifier Group 2

```text
Nama:
Tambahan

Description:
Topping atau tambahan untuk melengkapi ayam geprek.

Status:
Opsional

Selection:
Multiple
```

Options:

```text
Extra Sambal    Rp 0
Telur           Rp 5.000
Keju            Rp 2.000
Extra Ayam      Rp 20.000
```

---

# 20. Functional Requirements

| ID    | Requirement                                | Priority |
| ----- | ------------------------------------------ | -------- |
| FR-01 | User dapat melihat seluruh Modifier Group  | Must     |
| FR-02 | User dapat melihat seluruh Modifier Option | Must     |
| FR-03 | Modifier Group dapat collapse/expand       | Must     |
| FR-04 | Modifier Group memiliki context menu       | Must     |
| FR-05 | Modifier Option memiliki context menu      | Must     |
| FR-06 | User dapat menambahkan Modifier Option     | Must     |
| FR-07 | User dapat menambahkan Modifier Group      | Must     |
| FR-08 | User dapat mengedit Modifier Group         | Must     |
| FR-09 | User dapat mengedit Modifier Option        | Must     |
| FR-10 | User dapat menghapus Modifier Group        | Must     |
| FR-11 | User dapat menghapus Modifier Option       | Must     |
| FR-12 | UI menyediakan drag handle                 | Should   |
| FR-13 | Modifier Option dapat diurutkan            | Should   |
| FR-14 | Modifier Group dapat diurutkan             | Should   |
| FR-15 | Empty state tersedia                       | Must     |
| FR-16 | Bottom action tersedia                     | Must     |
| FR-17 | UI responsive pada mobile                  | Must     |

---

# 21. Non-Functional Requirements

## Performance

Revisi UI tidak boleh menyebabkan rendering list modifier menjadi berat ketika jumlah option meningkat.

## Accessibility

- Semua interactive element harus dapat menerima keyboard focus.
- Icon button harus memiliki accessible label.
- Context menu harus dapat diakses keyboard.
- Contrast text harus memadai.
- Drag & drop tidak boleh menjadi satu-satunya cara mengubah urutan.

## Responsive

UI harus dapat digunakan pada:

- mobile;
- tablet;
- desktop.

---

# 22. Acceptance Criteria

## Page Header

- [ ] Header menampilkan `Modifier Produk`.
- [ ] Terdapat tombol kembali.
- [ ] Terdapat description.
- [ ] Header tidak dibungkus card.

## Modifier Group

- [ ] Group menggunakan card dengan visual minimal.
- [ ] Group memiliki nama.
- [ ] Group dapat menampilkan description.
- [ ] Metadata menggunakan compact badge/chip.
- [ ] Group dapat collapse/expand.
- [ ] Group memiliki context menu.
- [ ] Nested card tidak digunakan untuk setiap option.

## Modifier Option

- [ ] Option ditampilkan dalam compact list.
- [ ] Option memiliki drag handle.
- [ ] Option menampilkan nama.
- [ ] Option menampilkan harga.
- [ ] Option memiliki context menu.
- [ ] Edit/delete tidak selalu ditampilkan sebagai icon terpisah.

## Add Actions

- [ ] Tersedia `+ Tambah pilihan` pada setiap group.
- [ ] Tersedia `+ Tambah modifier group` setelah seluruh group.
- [ ] Terminologi tidak lagi menggunakan `Tambah Modifier` untuk option.

## Navigation

- [ ] Terdapat tombol `Kembali`.
- [ ] Terdapat primary CTA `Lanjut`.
- [ ] Primary CTA menggunakan brand red.

## Responsive

- [ ] Layout nyaman pada mobile.
- [ ] Option row tidak terlalu tinggi.
- [ ] Context menu tetap mudah digunakan.
- [ ] Group dapat di-collapse untuk mengurangi panjang halaman.

---

# 23. Before vs After

## Before

```text
Modifier Group
└── Card Option
    ├── Edit
    └── Delete

└── Card Option
    ├── Edit
    └── Delete

└── Card Option
    ├── Edit
    └── Delete
```

Masalah:

- visual terlalu ramai;
- banyak border;
- banyak icon;
- hierarchy kurang compact.

## After

```text
Modifier Group                         ⋮
Wajib · Pilih 1

⠿ Option                         Rp 0 ⋮
⠿ Option                         Rp 0 ⋮
⠿ Option                         Rp 0 ⋮
⠿ Option                         Rp 0 ⋮

+ Tambah pilihan
```

Keuntungan:

- lebih clean;
- lebih scalable;
- lebih mudah dipindai;
- action tersedia saat dibutuhkan;
- lebih cocok untuk merchant dashboard.

---

# 24. Recommended Component Structure

Struktur component yang direkomendasikan:

```text
ModifierProductPage
│
├── ModifierPageHeader
│
├── ModifierGroupList
│   │
│   ├── ModifierGroupCard
│   │   ├── ModifierGroupHeader
│   │   │   ├── DragHandle
│   │   │   ├── GroupIcon
│   │   │   ├── GroupInfo
│   │   │   ├── GroupMetadata
│   │   │   ├── CollapseButton
│   │   │   └── ContextMenu
│   │   │
│   │   ├── ModifierOptionList
│   │   │   └── ModifierOptionRow
│   │   │       ├── DragHandle
│   │   │       ├── OptionName
│   │   │       ├── OptionPrice
│   │   │       └── ContextMenu
│   │   │
│   │   └── AddOptionButton
│   │
│   └── AddModifierGroupButton
│
└── ModifierPageActions
    ├── BackButton
    └── ContinueButton
```

Component names dapat disesuaikan dengan naming convention existing project.

---

# 25. Implementation Guidance

Implementasi harus mengutamakan reuse component yang sudah tersedia di project.

Prioritas:

1. Reuse design tokens.
2. Reuse Button component.
3. Reuse Badge/Chip component jika tersedia.
4. Reuse Dropdown/Context Menu component.
5. Reuse Dialog component.
6. Reuse Icon library yang sudah digunakan project.
7. Hindari membuat primitive baru jika equivalent component sudah tersedia.

UI revision tidak boleh menyebabkan duplikasi design system.

---

# 26. Data & State Consideration

PRD ini tidak mengubah struktur data.

UI hanya perlu membaca state modifier yang sudah tersedia.

State tambahan yang mungkin diperlukan untuk UI:

```text
expandedGroupIds
activeGroupMenu
activeOptionMenu
draggedGroupId
draggedOptionId
```

State tersebut merupakan kebutuhan presentation/interaction dan tidak otomatis berarti perubahan backend.

---

# 27. Migration Strategy

Implementasi dapat dilakukan bertahap:

### Phase 1 — Visual Refactor

- Page header.
- Group card.
- Option list.
- Typography.
- Spacing.
- Button.
- Badge.

### Phase 2 — Interaction Refactor

- Context menu.
- Collapse/expand.
- Empty state.
- Delete confirmation.

### Phase 3 — Ordering

- Drag handle.
- Drag & drop.
- Persistence ordering jika API mendukung.

Dengan pendekatan tersebut, visual redesign dapat selesai tanpa harus menunggu seluruh fitur ordering selesai.

---

# 28. Definition of Done

Revisi dianggap selesai apabila:

1. UI mengikuti direction desain pada referensi visual.
2. Modifier Group tidak lagi menggunakan nested card untuk setiap option.
3. Option menggunakan compact list row.
4. Edit/delete menggunakan contextual menu.
5. Modifier Group dapat collapse/expand.
6. Tersedia `Tambah pilihan`.
7. Tersedia `Tambah modifier group`.
8. Metadata menggunakan bahasa merchant-friendly.
9. Bottom action `Kembali` dan `Lanjut` tersedia.
10. UI responsive.
11. Tidak ada regresi pada fungsi CRUD modifier yang sudah berjalan.
12. Existing design system/component digunakan semaksimal mungkin.
13. Tidak ada perubahan backend/API yang tidak diperlukan untuk UI redesign.

---

# 29. Design Direction Summary

Arah final UI:

> **Clean, compact, modern merchant dashboard dengan hierarchy yang kuat dan visual noise minimal.**

Prioritas desain:

```text
Hierarchy
   ↓
Readability
   ↓
Compactness
   ↓
Contextual Actions
   ↓
Visual Polish
```

Bukan menambahkan lebih banyak elemen visual, tetapi **mengurangi elemen yang tidak diperlukan dan memperkuat struktur informasi**.
