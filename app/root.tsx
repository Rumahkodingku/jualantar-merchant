import { useEffect } from "react"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useNavigate } from "react-router"

import type { Route } from "./+types/root"
import { InstallPrompt } from "~/components/install-prompt"
import { OfflineBanner } from "~/components/offline-banner"
import { Providers } from "~/components/providers"
import { Toaster } from "~/components/ui/toast"
import { Text } from "~/components/ui/text"
import { useServiceWorker } from "~/hooks/use-service-worker"
import { setUnauthorizedHandler } from "~/lib/auth-token"
import "./app.css"

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#E90B22" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="JualAntar Merchant" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export default function App() {
    useServiceWorker()
    const navigate = useNavigate()

    useEffect(() => {
        setUnauthorizedHandler(() => {
            navigate("/login", { replace: true })
        })

        return () => setUnauthorizedHandler(null)
    }, [navigate])

    return (
        <Providers>
            <OfflineBanner />
            <Outlet />
            <InstallPrompt />
            <Toaster />
        </Providers>
    )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error"
        details = error.status === 404 ? "The requested page could not be found." : error.statusText || details
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message
        stack = error.stack
    }

    return (
        <main className="container mx-auto p-4 pt-16">
            <Text as="h1" variant="2xl" weight="semibold">
                {message}
            </Text>
            <Text variant="sm" className="text-muted-foreground">
                {details}
            </Text>
            {stack && (
                <pre className="w-full overflow-x-auto p-4">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    )
}
