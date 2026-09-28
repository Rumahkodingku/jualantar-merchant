import { BellIcon } from "lucide-react"
import { Link } from "react-router"
import { Text } from "~/components/ui/text"
import { SETTINGS_PATHS } from "~/modules/settings"

export function HomeHeader({
    businessName,
}: {
    businessName: string
    description: string
    merchantStatus: { label: string; tone: "positive" | "neutral" | "negative" } | null
}) {
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <section className="flex flex-col gap-1">
                    <Text variant="xs" className="text-muted-foreground">
                        Selamat datang,
                    </Text>
                    <Text as="h1" variant="xl" weight="black" truncate className="tracking-tight">
                        {businessName} 👋
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        {today}
                    </Text>
                </section>

                <div className="flex items-center gap-2">
                    <Link
                        to={SETTINGS_PATHS.notifications}
                        aria-label="Notifikasi"
                        className="relative flex size-11 items-center justify-center rounded-full transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
                    >
                        <BellIcon className="size-5" aria-hidden="true" />
                        <span
                            aria-hidden="true"
                            className="absolute top-2 right-2.5 size-2 rounded-full bg-primary ring-2 ring-background"
                        />
                    </Link>
                </div>
            </div>
        </div>
    )
}
