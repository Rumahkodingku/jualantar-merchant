# PLAN.md — Catalog Product UI Redesign

## 1. Document Information

- **Project:** JualAntar Merchant
- **Module:** `app/modules/catalogs`
- **Scope:** Product listing / product management UI
- **Primary target:** Merchant-facing product catalog management
- **Implementation approach:** Incremental UI/UX revision on top of the existing Catalog architecture
- **Status:** Planning
- **Source basis:** Analysis of the current `jualantar-merchant` codebase, especially the Product Listing flow under `app/modules/catalogs`

---

# 2. Objective

Redesign the Product Catalog UI so merchants can:

1. Scan products faster.
2. Identify product status immediately.
3. Understand product type, pricing, variants, customization, and media at a glance.
4. Perform frequent product actions with fewer interaction steps.
5. Search and filter the catalog efficiently.
6. Reorder products without losing the existing `display_order` functionality.
7. Manage large catalogs with a more compact and information-efficient layout.
8. Preserve the existing Catalog business logic, API integration, mutations, and domain model wherever possible.

The redesign is primarily a **presentation and interaction revision**, not a rewrite of the Catalog module.

---

# 3. Current Architecture Summary

The current product listing flow is:

```text
CatalogsPage
    │
    ├── useProducts()
    ├── useCategories()
    ├── ProductFilters
    │
    └── ProductList
            │
            └── ProductCard
                    │
                    ├── ProductMediaThumbnail
                    ├── StatusBadge
                    └── ProductActionsMenu
```

Supporting layers:

```text
CatalogsPage
    ↓
services/products/product.queries.ts
services/products/product.mutations.ts
    ↓
catalog repository / API
```

Product data is represented through `catalog.types.ts`.

The current implementation already supports:

- Product fetching
- Category fetching
- Search
- Debounced search
- URL-based filtering
- Status filtering
- Category filtering
- Product type filtering
- Product sorting
- `display_order`
- Drag-and-drop product reorder
- Product detail
- Product edit
- Variants
- Customization
- Media
- Outlet assignment
- Product activation/deactivation
- Product deletion
- Product image fallback
- Signed media URL refresh
- Loading state
- Error state
- Empty state

The redesign should preserve these capabilities.

---

# 4. Design Principles

## 4.1 Management-first, not storefront-first

The product list is primarily a **merchant management interface**.

The UI should prioritize:

```text
Recognition
    ↓
Status
    ↓
Price
    ↓
Configuration
    ↓
Action
```

rather than maximizing image size.

---

## 4.2 Compact but not dense

The redesign should reduce unnecessary vertical space while maintaining comfortable touch targets.

Avoid:

- Excessive card height
- Repeated labels
- Overly large media
- Too many decorative elements

Preserve:

- Clear hierarchy
- Adequate spacing
- Readable product name
- Clear price
- Clear status
- Accessible actions

---

## 4.3 Progressive disclosure

The listing should expose the most important information immediately.

Secondary management information should be available through:

- Action menu
- Product detail
- Dedicated management sections
- Reorder mode

Do not attempt to place every product property into the card.

---

## 4.4 Reuse existing domain behavior

Do not duplicate:

- Product mutations
- Query logic
- Product types
- Filter state logic
- Status mutation logic
- Reorder mutation logic
- Existing detail/edit routes

The UI should consume the existing domain/service layer.

---

# 5. Scope

## 5.1 In Scope

### Product Listing

- Product card redesign
- Product list layout redesign
- Product information hierarchy
- Product status presentation
- Product action presentation
- Product metadata presentation
- Product media presentation
- Responsive behavior
- Loading state
- Empty state
- Error state
- No-result state

### Catalog Controls

- Search UI
- Status filter UI
- Category filter UI
- Product type filter UI
- Filter state presentation
- Active filter indication
- Reset filter interaction
- Add Product CTA
- Reorder mode entry/exit

### Product Management Interaction

- Existing action menu presentation
- Status interaction
- Existing product mutation feedback
- Reorder mode presentation
- Drag-and-drop visual treatment

---

# 6. Out of Scope

The following should NOT be redesigned as part of this plan unless a later requirement explicitly requests it:

- Product API architecture
- Catalog repository architecture
- Product database schema
- Product creation business logic
- Product detail business logic
- Product edit business logic
- Variant domain logic
- Modifier/customization domain logic
- Media upload architecture
- Outlet assignment domain logic
- Authentication
- Authorization
- Checkout/customer-facing catalog
- Merchant onboarding
- Product/catalog API redesign

The existing Product Detail and Product Edit pages should remain functionally intact unless a later UI revision explicitly covers them.

---

# 7. Target Product Listing Structure

The proposed structure is:

```text
┌───────────────────────────────────────────────┐
│ Catalog                                       │
│                                               │
│ [ Search product...               ] [Tambah] │
│                                               │
│ [Semua] [Aktif] [Nonaktif] [Filter]           │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ [IMG]  Product Name                 [⋮]  │ │
│ │        Category • Simple                  │ │
│ │        Rp 25.000                          │ │
│ │        [status / metadata]                │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ [IMG]  Product Name                 [⋮]  │ │
│ │        Category • Variable                │ │
│ │        Mulai dari Rp 20.000               │ │
│ │        [metadata]                          │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

The exact visual implementation can be refined during implementation, but the information hierarchy should remain consistent.

---

# 8. Product Card Redesign

## 8.1 Primary Objective

Transform the current large visual card into a more efficient **product management card**.

Current conceptual structure:

```text
Large image
    ↓
Status
    ↓
Name
    ↓
Category / Type / Variant
    ↓
Price
```

Target conceptual structure:

```text
Media + Status
      │
      ↓
Product identity
      │
      ↓
Category / Type
      │
      ↓
Price
      │
      ↓
Useful configuration metadata
      │
      ↓
Actions
```

---

## 8.2 Product Image

Continue using:

```text
ProductMediaThumbnail
```

Existing behavior must be preserved:

- Primary media URL
- Alt text
- Lazy loading
- Async decoding
- `object-cover`
- Missing image fallback
- Failed image fallback

Do not introduce a second image-loading mechanism.

### UI direction

The image should become smaller than the current `aspect-video` presentation.

The image must remain large enough to recognize the product.

---

## 8.3 Product Name

Requirements:

- Primary text hierarchy
- Semibold/strong visual weight
- Maximum two lines
- Entire card remains clickable when not in reorder mode
- Existing detail route remains the destination

Preserve:

```text
CATALOGS_PATHS.detail(product.id)
```

---

## 8.4 Category and Product Type

Continue showing:

```text
Category • Product Type
```

Examples:

```text
Makanan • Simple
Minuman • Variable
Tanpa kategori • Simple
```

This is secondary information and must not visually compete with:

- Product name
- Price
- Status

---

## 8.5 Price

### Simple product

Display:

```text
Rp 25.000
```

### Variable product

When `min_price` exists:

```text
Mulai dari Rp 20.000
```

When the variable product has no usable minimum price:

```text
Lihat varian
```

Preserve the current currency formatting utility.

Do not introduce a second currency formatter.

---

# 9. Product Metadata

The current API/domain model supports useful product-level information including:

- `variants_count`
- `modifier_groups_count`
- `media_count`

The redesign should expose selected metadata where it materially helps merchant scanning.

Suggested presentation:

```text
4 varian · 2 customization · 5 foto
```

However, metadata must be conditional.

Do not display meaningless zero-value metadata unless the final design specifically needs it.

Example:

```text
4 varian · 2 customization
```

instead of:

```text
4 varian · 0 customization · 5 foto
```

The final metadata selection should be validated against the actual Product response type used by the frontend.

---

# 10. Product Status

Current status:

```text
active
inactive
```

Current visual representation:

```text
StatusBadge
```

The redesign should make status easier to scan.

Possible visual hierarchy:

```text
● Aktif
● Nonaktif
```

Status should remain semantically clear and accessible.

---

## 10.1 Status Interaction

The codebase already contains:

```text
components/common/entity-status-switch.tsx
```

and product status mutations:

```text
useSetProductStatus()
```

The redesign should evaluate using a direct status control where appropriate.

Potential target:

```text
Aktif
[ ON ]
```

or:

```text
Nonaktif
[ OFF ]
```

The final behavior must preserve:

- Mutation
- Pending state
- Success notification
- Error notification
- Accessibility label

If direct switching is used, destructive/inconvenient state changes must remain understandable.

---

# 11. Product Actions

Existing actions:

```text
Lihat detail
Edit
Kelola variant
Kelola customization
Kelola media
Kelola outlet
Aktifkan / Nonaktifkan
Hapus
```

These actions already work through `ProductActionsMenu`.

The redesign should focus on hierarchy and discoverability rather than reimplementing the actions.

---

## 11.1 Action Hierarchy

Recommended conceptual grouping:

```text
Primary
├── Lihat detail
└── Edit

Management
├── Kelola variant
├── Kelola customization
├── Kelola media
└── Kelola outlet

Status
└── Aktifkan / Nonaktifkan

Danger
└── Hapus
```

The action menu should visually separate destructive actions from regular management actions.

---

# 12. Product List Layout

## 12.1 Normal Mode

The current implementation uses:

```text
grid-cols-1
md:grid-cols-2
```

The redesign should prioritize information density and responsiveness.

The exact breakpoint and number of columns should be validated against the final card dimensions.

Possible target:

```text
Mobile
1 column

Tablet / Desktop
2+ columns depending on available width
```

The implementation should avoid creating cards that become too narrow to comfortably read.

---

# 13. Reorder Mode

The existing implementation already uses:

- `DndContext`
- `SortableContext`
- `useSortable`
- `arrayMove`
- `display_order`

This behavior should be retained.

---

## 13.1 Reorder Mode UI

When reorder mode is enabled:

- Hide unnecessary action controls
- Make drag handle prominent
- Make draggable area obvious
- Preserve product identity
- Preserve product price/type information
- Provide clear drag feedback

Conceptual layout:

```text
┌──────────────────────────────────────────────┐
│ ☰  Product Name                         │
│    Category • Simple                    │
│    Rp 25.000                            │
└──────────────────────────────────────────────┘
```

During dragging:

- Elevate the active item
- Show clear visual feedback
- Prevent accidental ambiguity between click and drag

---

## 13.2 Reorder Restrictions

Current behavior only allows reorder when no filters are active.

This restriction should remain unless a later product requirement explicitly changes it.

Reason:

`display_order` represents the full product ordering, while filtered lists do not necessarily represent the complete ordering set.

---

# 14. Search

Current implementation:

- Search field
- 300ms debounce
- URL parameter `q`
- Search reset button

Preserve these behaviors.

Target UI:

```text
[ 🔍 Cari produk...                         × ]
```

Requirements:

- Search remains immediately visible
- Clear button appears only when search has a value
- Debounce remains 300ms unless testing shows a need to change it
- Search state remains URL-persisted
- Back/forward browser behavior remains functional

---

# 15. Status Filter

Current chips:

```text
Semua
Aktif
Nonaktif
```

Preserve these options.

Target behavior:

- Clear active state
- Horizontal scrolling where necessary
- Accessible selected state
- No unnecessary modal interaction for status
- Active filter visible at a glance

---

# 16. Additional Filters

Existing filters:

```text
Category
Product Type
```

These should remain available through the existing filter sheet.

The filter trigger should show the number of active facets where appropriate.

Example:

```text
[ Filter 2 ]
```

The redesign should not duplicate the same filter controls in multiple locations.

---

# 17. Add Product CTA

Current CTA:

```text
Tambah Produk
```

Keep it prominent.

Desktop:

```text
[ + Tambah Produk ]
```

Mobile:

```text
[ + Tambah ]
```

The CTA must continue routing to:

```text
CATALOGS_PATHS.new
```

---

# 18. Empty States

There are currently two distinct empty conditions.

## 18.1 No products

Message:

```text
Belum ada produk
```

The primary action:

```text
Tambah Produk
```

This state should remain action-oriented.

---

## 18.2 Search/filter result empty

Message:

```text
Produk tidak ditemukan
```

Action:

```text
Reset filter
```

These states must not be visually conflated.

---

# 19. Loading State

Current implementation uses:

```text
ListSkeleton
```

The redesign should update the skeleton so that it mirrors the final ProductCard structure.

Do not use a generic rectangle skeleton if the final card has:

```text
thumbnail
name
metadata
price
actions
```

Skeleton layout should approximate the real component.

---

# 20. Error State

Current implementation uses:

```text
ErrorState
```

Preserve this behavior.

The redesign should ensure:

- Clear error message
- Retry action
- Layout consistency with the catalog page
- No broken/empty card remnants

---

# 21. Responsive Requirements

## Mobile

Prioritize:

1. Product name
2. Price
3. Status
4. Image
5. Main action
6. Secondary metadata

Avoid:

- Overly wide filter controls
- Tiny action targets
- Text collisions
- Excessive horizontal content

---

## Tablet/Desktop

Use available horizontal space to:

- Increase information density
- Show more metadata
- Provide comfortable spacing
- Maintain clear action placement

Do not simply scale the mobile layout upward.

---

# 22. Accessibility Requirements

All redesigned components must preserve:

- Keyboard accessibility
- Focus-visible states
- Semantic buttons
- Accessible action labels
- Accessible status controls
- Drag handle labels
- Image alt text
- Selected filter state
- Tab/interactive semantics where applicable

Existing patterns such as:

```text
aria-label
aria-pressed
focus-visible:ring
```

should be retained.

---

# 23. Interaction Requirements

## Product Card

Normal mode:

```text
Click card/product name
    ↓
Product Detail
```

Action menu:

```text
Click ⋮
    ↓
Action menu
```

Status:

```text
Change status
    ↓
Mutation
    ↓
Success / Error feedback
```

---

## Reorder

```text
Enter reorder mode
    ↓
Drag product
    ↓
Drop product
    ↓
Update display_order
    ↓
Invalidate product queries
    ↓
Success feedback
```

Existing mutation behavior should be preserved.

---

# 24. Data/Logic Preservation

The UI redesign must continue using:

```text
useProducts()
useCategories()
useProductDetail()
useSetProductStatus()
useDeleteProduct()
useReorderProducts()
```

Do not duplicate API calls directly inside presentation components.

Do not move repository calls into ProductCard.

---

# 25. File-Level Implementation Plan

## Phase 1 — Product Card

### Primary file

```text
app/modules/catalogs/components/product/product-card.tsx
```

Tasks:

- Redesign card structure
- Reduce excessive image area
- Improve information hierarchy
- Improve status placement
- Improve price presentation
- Add selected product metadata
- Improve action placement
- Preserve detail link behavior
- Preserve reorder compatibility

---

## Phase 2 — Product List

### File

```text
app/modules/catalogs/components/product/product-list.tsx
```

Tasks:

- Rework normal grid/list presentation
- Preserve DnD mode
- Update spacing
- Update sortable wrapper
- Improve dragging state
- Ensure responsive behavior

Do not change the underlying reorder algorithm unless required.

---

## Phase 3 — Product Actions

### File

```text
app/modules/catalogs/components/product/product-actions-menu.tsx
```

Tasks:

- Refine menu hierarchy
- Group related actions
- Improve destructive action separation
- Preserve existing routes
- Preserve confirmation dialogs
- Preserve mutation feedback

---

## Phase 4 — Status UI

### Files

```text
app/modules/catalogs/components/status-badge.tsx
app/modules/catalogs/components/common/entity-status-switch.tsx
```

Tasks:

- Define final status visual language
- Decide whether status remains badge-only or becomes directly interactive
- If interactive, connect existing `EntityStatusSwitch`
- Preserve mutation and notification behavior

---

## Phase 5 — Filters

### Files

```text
app/modules/catalogs/components/product/product-filters.tsx
app/modules/catalogs/components/product/product-filter-fields.tsx
```

Tasks:

- Refine search layout
- Refine status chips
- Refine filter trigger
- Improve active filter indication
- Preserve filter sheet
- Preserve URL state
- Preserve reset behavior

---

## Phase 6 — Catalog Page

### File

```text
app/modules/catalogs/pages/catalogs-page.tsx
```

Tasks:

- Refine page-level spacing
- Refine header/filter arrangement
- Integrate redesigned ProductList
- Verify all loading/error/empty states
- Preserve query and mutation behavior

Avoid moving business logic into this file.

---

## Phase 7 — Skeleton and States

Review:

```text
ListSkeleton
CatalogEmptyState
ErrorState
```

Tasks:

- Match skeleton to new card
- Ensure empty state hierarchy
- Ensure error state hierarchy
- Validate responsive layout

---

# 26. Component Architecture Target

The final architecture should remain close to:

```text
CatalogsPage
│
├── ProductFilters
│   ├── Search
│   ├── StatusChips
│   └── FilterSheet
│       └── ProductFilterFields
│
└── ProductList
    │
    └── ProductCard
        ├── ProductMediaThumbnail
        ├── StatusBadge / EntityStatusSwitch
        └── ProductActionsMenu
```

Do not create an oversized monolithic `ProductCard`.

If the card becomes complex, split presentation-only concerns into small components.

Possible future components:

```text
ProductCardMedia
ProductCardContent
ProductCardMeta
ProductCardPrice
ProductCardActions
```

These should only be extracted if they improve maintainability.

---

# 27. State Matrix

The redesigned UI must support the following states.

| State                      | Expected UI                           |
| -------------------------- | ------------------------------------- |
| Initial loading            | Product card skeletons                |
| Loaded products            | Redesigned product list               |
| No products                | Empty catalog state + Tambah Produk   |
| Search no result           | No-result state + Reset               |
| Filter no result           | No-result state + Reset               |
| API error                  | ErrorState + Retry                    |
| Product active             | Active status                         |
| Product inactive           | Inactive status                       |
| Simple product             | Single price                          |
| Variable product           | Minimum price / Lihat varian          |
| Product with variants      | Variant metadata                      |
| Product with customization | Customization metadata where selected |
| Product without media      | Media fallback                        |
| Broken media URL           | Media fallback                        |
| Normal mode                | Standard product card                 |
| Reorder mode               | Sortable product card                 |
| Product dragging           | Elevated/dragging visual              |
| Status mutation pending    | Disabled/pending status interaction   |
| Delete pending             | Disabled/pending confirmation         |
| Filter active              | Active filter indication              |

---

# 28. Visual Hierarchy

The final visual priority should be:

```text
1. Product name
2. Price
3. Status
4. Product image
5. Category / product type
6. Important configuration metadata
7. Secondary actions
```

The card should not visually prioritize decorative information over product identity.

---

# 29. UX Rules

### Rule 1

A merchant should understand what the product is within one glance.

### Rule 2

A merchant should understand whether it is active/inactive without opening the detail page.

### Rule 3

A merchant should understand the price without opening the detail page.

### Rule 4

A merchant should be able to reach common product management actions without navigating through the detail page.

### Rule 5

Filtering must not destroy the user's current search/filter state.

### Rule 6

Reordering must only operate on the full unfiltered catalog unless the business requirement changes.

### Rule 7

Destructive actions must remain visually separated and confirmed.

### Rule 8

The redesign must not require API changes unless an actual missing field is discovered during implementation.

---

# 30. Implementation Sequence

Recommended implementation order:

```text
Step 1
Finalize ProductCard visual specification
        ↓
Step 2
Implement ProductCard
        ↓
Step 3
Implement ProductList layout
        ↓
Step 4
Implement status presentation
        ↓
Step 5
Refine action menu
        ↓
Step 6
Refine filters/search
        ↓
Step 7
Refine CatalogsPage composition
        ↓
Step 8
Update loading/empty/error states
        ↓
Step 9
Validate reorder mode
        ↓
Step 10
Responsive + accessibility QA
        ↓
Step 11
Regression testing
```

---

# 31. Testing Plan

## Functional

Verify:

- Product list loads
- Search works
- Search debounce works
- Search URL state works
- Category filter works
- Status filter works
- Product type filter works
- Reset filter works
- Add Product works
- Product detail navigation works
- Edit navigation works
- Variant navigation works
- Customization navigation works
- Media navigation works
- Outlet navigation works
- Activate works
- Deactivate works
- Delete works
- Reorder works

---

## Visual

Check:

- Product card consistency
- Long product names
- Long category names
- Missing image
- Broken image
- Simple product
- Variable product
- Large price
- No variant
- Many variants
- Inactive product
- Narrow mobile viewport
- Wide desktop viewport

---

## Interaction

Check:

- Keyboard focus
- Keyboard navigation
- Dropdown menu
- Confirmation dialog
- Status control
- Drag handle
- Drag state
- Touch interaction
- Search clear action
- Filter sheet

---

# 32. Regression Safety

Before modifying business logic, verify that:

```text
services/products/
utils/product-filters.ts
types/catalog.types.ts
```

remain unchanged or receive only changes required by the UI.

Any API/type change discovered during implementation must be documented separately rather than silently bundled into the UI redesign.

---

# 33. Definition of Done

The Product Catalog UI redesign is considered complete when:

### Layout

- [ ] Product list uses the new management-oriented card
- [ ] Card is compact without becoming visually crowded
- [ ] Responsive behavior works
- [ ] Desktop and mobile layouts are coherent

### Product Card

- [ ] Product image works
- [ ] Image fallback works
- [ ] Product name works
- [ ] Category works
- [ ] Product type works
- [ ] Price works
- [ ] Variable product pricing works
- [ ] Metadata works where available
- [ ] Status is immediately visible
- [ ] Actions are accessible

### Filters

- [ ] Search works
- [ ] Debounce preserved
- [ ] Status filter works
- [ ] Category filter works
- [ ] Product type filter works
- [ ] Active filters are visible
- [ ] Reset works

### Actions

- [ ] Detail works
- [ ] Edit works
- [ ] Variant management works
- [ ] Customization management works
- [ ] Media management works
- [ ] Outlet management works
- [ ] Status change works
- [ ] Delete works

### Reorder

- [ ] Reorder mode works
- [ ] Drag handle is visible
- [ ] Drag feedback is clear
- [ ] Display order mutation works
- [ ] Reorder restriction with filters remains intact

### States

- [ ] Loading
- [ ] Empty
- [ ] No result
- [ ] Error
- [ ] Image fallback
- [ ] Mutation pending

### Accessibility

- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Accessible labels
- [ ] Accessible status control
- [ ] Accessible drag handle
- [ ] Image alt text

---

# 34. Non-Goals During Implementation

Do not introduce:

- New API endpoints only for visual convenience
- New state-management library
- New product domain abstraction without need
- Duplicate Product API calls
- Duplicate mutation handlers
- Duplicate filter state
- Duplicate currency formatting
- Unrelated Catalog module refactors
- Product Detail redesign as part of this task

---

# 35. Expected Result

The final Catalog Product UI should move from a primarily visual catalog presentation:

```text
Large image
    ↓
Product
    ↓
Metadata
    ↓
Price
```

toward a merchant management interface:

```text
┌──────────────────────────────────────────────┐
│ Product identity                    Actions │
│                                              │
│ Image    Product Name                        │
│          Category • Type                     │
│          Price                               │
│          Configuration metadata              │
│          Status                              │
└──────────────────────────────────────────────┘
```

The merchant should be able to scan, identify, filter, manage, activate/deactivate, and reorder products efficiently without needing to open the Product Detail page for common operations.

---

# 36. Final Implementation Principle

The most important implementation rule is:

> **Redesign the presentation layer aggressively, but preserve the existing Catalog domain/service behavior unless a concrete requirement requires a change.**

The current codebase already contains the majority of the required product-management capabilities. The redesign should therefore focus engineering effort on:

```text
Information hierarchy
        +
Visual hierarchy
        +
Interaction efficiency
        +
Responsive behavior
        +
Accessibility
```

rather than rebuilding existing business functionality.
