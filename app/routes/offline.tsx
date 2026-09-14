import { Link } from "react-router"
import { WifiOffIcon } from "lucide-react"
import { Brand } from "~/components/brand"
import { buttonVariants } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

export function meta() {
    return [{ title: "Anda sedang offline — JualAntar Merchant" }]
}

export default function OfflineRoute() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
            <Brand size={36} />

            <div className="flex max-w-sm flex-col items-center gap-2">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <WifiOffIcon className="size-6" aria-hidden="true" />
                </span>
                <Text as="h1" variant="2xl" weight="semibold">
                    Anda sedang offline
                </Text>
                <Text variant="sm" className="text-muted-foreground">
                    Koneksi internet tidak tersedia. Halaman yang pernah Anda buka mungkin masih bisa diakses.
                </Text>
            </div>

            <Link to="/" className={buttonVariants({ size: "lg" })}>
                Coba lagi
            </Link>
        </div>
    )
}
