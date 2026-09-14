import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
    index("routes/home.tsx"),
    route("offline", "routes/offline.tsx"),
    route("login", "modules/auth/routes/login.tsx"),
    route("merchant/register", "modules/auth/routes/register.tsx"),
    route("merchant/check-email", "modules/auth/routes/check-email.tsx"),
    route("merchant/verify-email", "modules/auth/routes/verify-email.tsx"),
    // layout("modules/auth/routes/protected-layout.tsx", [
    //     route("merchant/registration", "modules/merchant-registration/routes/registration-layout.tsx", [
    //         index("modules/merchant-registration/routes/index.tsx"),
    //         route("business", "modules/merchant-registration/routes/business.tsx"),
    //         route("identity", "modules/merchant-registration/routes/identity.tsx"),
    //         route("legal-entity", "modules/merchant-registration/routes/legal-entity.tsx"),
    //         route("service", "modules/merchant-registration/routes/service.tsx"),
    //         route("categories", "modules/merchant-registration/routes/categories.tsx"),
    //         route("outlets", "modules/merchant-registration/routes/outlets.tsx"),
    //         route("documents", "modules/merchant-registration/routes/documents.tsx"),
    //         route("payout", "modules/merchant-registration/routes/payout.tsx"),
    //         route("review", "modules/merchant-registration/routes/review.tsx"),
    //     ]),
    // ]),
    route("merchant/registration", "modules/merchant-registration/routes/registration-layout.tsx", [
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
] satisfies RouteConfig
