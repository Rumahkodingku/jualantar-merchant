import { Outlet } from "react-router"
import { AppShell } from "../components/app-shell"

export default function AppShellRoute() {
    return (
        <AppShell>
            <Outlet />
        </AppShell>
    )
}
