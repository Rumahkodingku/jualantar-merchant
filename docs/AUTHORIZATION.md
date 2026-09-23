# Authorization (Merchant Operations)

This document describes how the merchant frontend decides what a user may see and
do. **The API is the security boundary** — the frontend only controls
discoverability, navigation, route UX, and action visibility.

## Two kinds of authorization

```
/auth/me
  ├── global roles        ["merchant", …]
  ├── global permissions  ["merchant.operations.view", …]
  └── outlet_assignments  [{ outlet_id, role: outlet_manager|outlet_staff }, …]
```

- **Global authorization** decides account-level abilities. Only the **merchant
  owner** (global role `merchant`) holds the full `merchant.operations.*` set
  globally, and the API exempts owners from per-outlet checks (`isOwner`).
- **Outlet authorization** decides what a user may do on **one outlet**, via the
  role from `outlet_assignments` for that `outlet_id`.

```
Global authorization   ≠   Outlet authorization
```

Global `permissions` must **never** be used to infer outlet access (except the
explicit owner bypass, which mirrors the API).

## Single source of truth

`app/modules/authorization/` is the only place that maps role → capability and
answers authorization questions.

```
role → capability → action          (correct)
role literal → UI decision          (forbidden)
```

- `utils/capabilities.ts` — `CAP` constants and `OUTLET_ROLE_CAPABILITIES`.
  This is a **mirror** of the API's `OutletRoleCapabilityResolver::permissionsFor()`.
  The API does not expose per-outlet capabilities, so keep the two in sync.
- `utils/resolver.ts` — pure functions: `can`, `canForOutlet`, `roleForOutlet`,
  `isMerchantOwner`, `canViewOutletList`.
- `hooks/use-authorization.ts` / `hooks/use-outlet-authorization.ts` —
  memoized React access to the resolver.
- `useOperationsPermissions(outletId?)` (merchant-operations) — the ergonomic
  boolean bag used by the screens; outlet flags are computed for `outletId`.

`canForOutlet` evaluates in the same order as the API: an explicit owner/global
grant wins, otherwise the assignment role's capability. Unknown outlet or
missing/invalid assignment → **deny** (fail-closed).

## Rules

| Surface    | Behaviour                                      |
| ---------- | ---------------------------------------------- |
| Navigation | hide the feature when the capability is absent |
| Page       | route guard → `/403` or inline forbidden state |
| Action     | hide/disable the mutation when not permitted   |
| API        | backend authorization (final authority)        |

- Never compare role literals in components (`role === "outlet_manager"`).
- Never read `user.permissions` directly — go through the resolver.
- Session shape: `/auth/me` is validated and normalized in
  `app/modules/auth/schemas/auth-user.schema.ts` (`outlet_assignments` →
  `outletAssignments`); invalid roles are dropped (denied).
- `401` → session handling/login. `403` → authorization error; **never** logs the
  user out and **never** counts as success.

## Adding an outlet feature

1. Resolve `outletId` from the route param (`:outlet`).
2. Pick the capability from `CAP`.
3. Use `useOperationsPermissions(outletId)` or `useOutletAuthorization(outletId)`.
4. Guard the page/action.
5. Let the API enforce it.

## Known gaps / dependencies

- Products and promotions quick actions / home shortcuts have no authorization
  contract yet; they are intentionally left ungated rather than inventing a rule.
- The role→capability map is mirrored from the API; if the backend mapping
  changes, update `OUTLET_ROLE_CAPABILITIES`.

## Manual verification (requires the API running)

With a user `Budi` assigned `outlet_manager` on outlet A and `outlet_staff` on B:

| Check                                                           | Expected                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| Outlet A open                                                   | edit/status/hours-edit/service-area-edit/employees visible   |
| Outlet B open                                                   | those controls hidden; view data still visible               |
| Switch A → B → A                                                | UI authorization follows the active outlet, no stale action  |
| Direct `/settings/outlets/B/employees` (no `outlet_users.view`) | forbidden (403) UX, not 404                                  |
| `A` `PUT .../operating-hours`                                   | 2xx                                                          |
| `B` `PUT .../operating-hours`                                   | 403 → authorization error toast, no logout, no false success |

Owner (global role `merchant`) keeps full access on every outlet and sees the
merchant-level settings menus.

> Note: DOM-based component/route tests in this repo cannot execute in the
> current environment because the installed `react` build does not expose
> `React.act` (every Testing Library render throws). The pure authorization
> unit tests (resolver, schema, error mapping) run green.
