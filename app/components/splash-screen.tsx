import { Brand } from "./brand"
import { Spinner } from "./ui/spinner"
import { Text } from "./ui/text"

export function SplashScreen({ label = "Memuat..." }: { label?: string }) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
            <Brand size={36} />
            <Text as="span" variant="sm" className="flex items-center gap-2">
                <Spinner className="size-4" />
                {label}
            </Text>
        </div>
    )
}
