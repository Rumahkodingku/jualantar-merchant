import { ChevronDownIcon, CircleAlertIcon, InfoIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Text } from "~/components/ui/text"

import { SectionStatusBadge } from "./section-status-badge"
import { useRegistrationContext } from "../registration-context"
import { stepMeta, type SectionStatus } from "../../utils/review-section-status"
import type { StepId } from "../../utils/steps"

export function ReviewCollapsible({
    title,
    stepId,
    status,
    hasData,
    children,
}: {
    title: string
    stepId: StepId
    status: SectionStatus
    hasData: boolean
    children: React.ReactNode
}) {
    const { navigation } = useRegistrationContext()
    const description = stepMeta(stepId)?.description
    const incomplete = status === "incomplete"
    const actionLabel = incomplete ? "Lengkapi data" : status === "optional" && !hasData ? "Tambah data" : "Ubah data"

    return (
        <section aria-label={title}>
            <Collapsible defaultOpen className="overflow-hidden rounded-xl border bg-card">
                <CollapsibleTrigger
                    type="button"
                    className="group flex w-full items-center gap-2 p-4 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
                    <SectionStatusBadge status={status} />
                    <ChevronDownIcon
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="border-t">
                        {incomplete && hasData ? (
                            <div className="flex items-start gap-2 border-b bg-amber-500/5 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
                                <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                                <span>Bagian ini belum lengkap. Periksa kembali datanya.</span>
                            </div>
                        ) : null}

                        {!hasData && incomplete ? (
                            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                                <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <CircleAlertIcon className="size-4" aria-hidden="true" />
                                </span>
                                <Text variant="sm" weight="medium">
                                    Belum diisi
                                </Text>
                                {description !== undefined ? (
                                    <Text variant="xs" className="text-muted-foreground">
                                        {description}
                                    </Text>
                                ) : null}
                            </div>
                        ) : !hasData && status === "optional" ? (
                            <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
                                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <InfoIcon className="size-4" aria-hidden="true" />
                                </span>
                                <Text variant="sm" weight="medium">
                                    Belum ada dokumen
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    Bagian ini opsional, Anda bisa menambahkannya nanti.
                                </Text>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y">{children}</div>
                        )}

                        <div className="border-t px-4 py-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => navigation.goToStep(stepId)}
                            >
                                {actionLabel}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    )
}
