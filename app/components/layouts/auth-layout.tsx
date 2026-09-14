import type { ReactNode } from "react"
import { Brand } from "~/components/brand"
import { Text } from "~/components/ui/text"

type AuthLayoutProps = {
    title: string
    description?: ReactNode
    children: ReactNode
    footer?: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col bg-muted/40">
            <header className="px-6 pt-8">
                <Brand />
            </header>
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
                <div className="mb-6 space-y-2">
                    <Text as="h1" variant="2xl" weight="bold" className="tracking-tight text-balance">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="sm" className="leading-relaxed text-pretty text-muted-foreground">
                            {description}
                        </Text>
                    ) : null}
                </div>
                {children}
            </main>
            {footer ? (
                <Text variant="sm" align="center" className="px-6 pb-8 text-muted-foreground">
                    {footer}
                </Text>
            ) : null}
        </div>
    )
}
