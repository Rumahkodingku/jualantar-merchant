import { Logo } from "~/components/logo"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

export function Brand({ className, size = 28 }: { className?: string; size?: number }) {
    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <Logo size={size} className="text-primary" />
            <Text as="span" variant="lg" weight="semibold" className="tracking-tight text-foreground">
                JualAntar Merchant
            </Text>
        </span>
    )
}
