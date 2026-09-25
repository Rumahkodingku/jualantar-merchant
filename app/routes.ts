import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
    route("offline", "routes/offline.tsx"),
    route("login", "modules/auth/routes/login.tsx"),
    route("merchant/register", "modules/auth/routes/register.tsx"),
    route("merchant/check-email", "modules/auth/routes/check-email.tsx"),
    route("merchant/verify-email", "modules/auth/routes/verify-email.tsx"),
    route("", "modules/auth/routes/protected-layout-route.tsx", [
        layout("components/layouts/app-shell/routes/app-shell-route.tsx", [
            index("modules/home/routes/home-route.tsx"),

            route("403", "modules/authorization/routes/forbidden.tsx"),

            route("", "modules/merchant-registration/routes/approved-guard-route.tsx", [
                route("orders", "modules/orders/routes/index.tsx"),
                route("finances", "modules/finances/routes/index.tsx"),
                route("catalogs", "modules/catalogs/routes/catalogs-layout.tsx", [
                    index("modules/catalogs/routes/index.tsx"),
                    route("categories", "modules/catalogs/routes/categories.tsx"),
                    route("modifiers", "modules/catalogs/routes/modifiers.tsx"),
                ]),
                route("catalogs/new", "modules/catalogs/routes/new.tsx"),
                route("catalogs/products/:productId", "modules/catalogs/routes/product-detail.tsx"),
                route("catalogs/products/:productId/edit", "modules/catalogs/routes/product-edit.tsx"),
                route("promotions", "modules/promotions/routes/index.tsx"),
                route("promotions/new", "modules/promotions/routes/new.tsx"),

                route("settings", "modules/settings/routes/index.tsx"),
                route("settings/account", "modules/settings/routes/account.tsx"),
                route("settings/appearance", "modules/settings/routes/appearance.tsx"),
                route("settings/notifications", "modules/settings/routes/notifications.tsx"),
                route("settings/help", "modules/settings/routes/help.tsx"),
                route("settings/about", "modules/settings/routes/about.tsx"),
                route("settings/profile", "modules/merchant-operations/routes/profile.tsx"),
                route("settings/status", "modules/merchant-operations/routes/status.tsx"),

                route("settings/outlets", "modules/merchant-operations/routes/outlets.tsx"),
                route("settings/outlets/new", "modules/merchant-operations/routes/outlet-new.tsx"),
                route("settings/outlets/:outlet", "modules/merchant-operations/routes/outlet-detail.tsx"),
                route("settings/outlets/:outlet/edit", "modules/merchant-operations/routes/outlet-edit.tsx"),
                route("settings/outlets/:outlet/hours", "modules/merchant-operations/routes/outlet-hours.tsx"),
                route(
                    "settings/outlets/:outlet/service-area",
                    "modules/merchant-operations/routes/outlet-service-area.tsx"
                ),
                route("settings/outlets/:outlet/employees", "modules/merchant-operations/routes/outlet-employees.tsx"),
                route(
                    "settings/outlets/:outlet/availability",
                    "modules/merchant-operations/routes/outlet-availability.tsx"
                ),
            ]),
        ]),
        route("registration", "modules/merchant-registration/routes/registration-layout.tsx", [
            index("modules/merchant-registration/routes/index.tsx"),
            route("business", "modules/merchant-registration/routes/business.tsx"),
            route("identity", "modules/merchant-registration/routes/identity.tsx"),
            route("legal-entity", "modules/merchant-registration/routes/legal-entity.tsx"),
            route("service", "modules/merchant-registration/routes/service.tsx"),
            route("categories", "modules/merchant-registration/routes/categories.tsx"),
            route("outlets", "modules/merchant-registration/routes/outlets.tsx"),
            route("documents", "modules/merchant-registration/routes/documents.tsx"),
            route("payout", "modules/merchant-registration/routes/payout.tsx"),
            route("review", "modules/merchant-registration/routes/review.tsx"),
        ]),
    ]),
] satisfies RouteConfig
