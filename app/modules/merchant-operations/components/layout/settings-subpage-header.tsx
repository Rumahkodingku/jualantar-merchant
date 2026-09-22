import { ChevronLeftIcon } from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

export function SettingsSubpageHeader({
    title,
    description,
    backTo,
}: {
    title: string
    description?: string
    backTo?: string
}) {
    const navigate = useNavigate()

    function goBack() {
        if (backTo !== undefined) {
            void navigate(backTo)
            return
        }

        void navigate(-1)
    }

    return (
        <div className="flex items-start gap-2">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Kembali"
                className="-ml-2 shrink-0"
                onClick={goBack}
            >
                <ChevronLeftIcon />
            </Button>

            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                <Text as="h1" variant="xl" weight="semibold" truncate className="tracking-tight">
                    {title}
                </Text>
                {description !== undefined ? (
                    <Text variant="xs" className="leading-relaxed text-muted-foreground">
                        {description}
                    </Text>
                ) : null}
            </div>
        </div>
    )
}
