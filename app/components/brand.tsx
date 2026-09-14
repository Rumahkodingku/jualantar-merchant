import { Logo } from "~/components/logo"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

export function Brand({
    className,
    size = 28,
    label = "JualAntar Merchant",
}: {
    className?: string
    size?: number
    label?: string
}) {
    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <Logo size={size} className="text-primary" />
            <Text as="span" variant="lg" weight="semibold" className="tracking-tight text-foreground">
                {label}
            </Text>
        </span>
    )
}
