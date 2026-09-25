import { Outlet } from "react-router"

import { APP_NAV_ITEMS } from "~/navigation"

import { AppShell } from "../components/app-shell"

export default function AppShellRoute() {
    return (
        <AppShell items={APP_NAV_ITEMS}>
            <Outlet />
        </AppShell>
    )
}
