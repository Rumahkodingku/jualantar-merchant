import type { ReactNode } from "react"
import { BottomNav, type AppNavItem } from "./bottom-nav"

export function AppShell({ items, children }: { items: AppNavItem[]; children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-muted/40">
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-28 md:max-w-2xl lg:max-w-3xl">
                {children}
            </main>

            <BottomNav items={items} />
        </div>
    )
}
