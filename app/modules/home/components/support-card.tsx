import { ChevronRightIcon, LifeBuoyIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { SETTINGS_PATHS } from "~/modules/settings"

export function SupportCard() {
    return (
        <section aria-label="Bantuan" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                Bantuan
            </Text>

            <Card>
                <CardContent>
                    <Link
                        to={SETTINGS_PATHS.help}
                        className="flex min-h-11 items-center gap-3 rounded-xl transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/60"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <LifeBuoyIcon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col text-left">
                            <Text as="span" variant="sm" weight="medium">
                                Butuh bantuan?
                            </Text>
                            <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                Hubungi tim JualAntar kapan saja
                            </Text>
                        </span>
                        <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                </CardContent>
            </Card>
        </section>
    )
}
