import { CheckIcon, ChevronDownIcon, StoreIcon } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"
import { cn } from "~/lib/utils"
import { outletStatusLabel, type OperationalOutlet } from "~/modules/merchant-operations"
import { SETTINGS_PATHS } from "~/modules/settings"

export function OutletSelector({
    outlets,
    outletTotal,
    selectedId,
    hasMore,
    isPending,
    isError,
    error,
    onRetry,
    onSelect,
}: {
    outlets: OperationalOutlet[]
    outletTotal: number
    selectedId: string | null
    hasMore: boolean
    isPending: boolean
    isError: boolean
    error: unknown
    onRetry: () => void
    onSelect: (outletId: string | null) => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const selected = outlets.find((outlet) => outlet.id === selectedId) ?? null
    const triggerLabel = selected === null ? `Semua Outlet (${outletTotal})` : selected.name

    function handleSelect(outletId: string | null) {
        setIsOpen(false)
        onSelect(outletId)
    }

    return (
        <section
            aria-label="Pilih outlet"
            className="flex flex-col gap-2"
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    setIsOpen(false)
                }
            }}
        >
            <Text as="h2" variant="sm" weight="semibold">
                Outlet
            </Text>

            <Card>
                <CardContent className="flex flex-col gap-1">
                    <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        aria-label={`Outlet terpilih: ${triggerLabel}. Ketuk untuk mengubah.`}
                        onClick={() => setIsOpen((value) => !value)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl text-left transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/60"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <StoreIcon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                            <Text as="span" variant="sm" weight="semibold" truncate>
                                {triggerLabel}
                            </Text>
                            <Text as="span" variant="xs" className="text-muted-foreground">
                                {selected === null ? "Ringkasan gabungan" : "Ringkasan outlet ini"}
                            </Text>
                        </span>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className={cn(
                                "size-5 shrink-0 text-muted-foreground transition-transform",
                                isOpen && "rotate-180"
                            )}
                        />
                    </button>

                    {isOpen ? (
                        <div className="flex flex-col gap-1 pt-1">
                            {isPending ? (
                                <div className="flex flex-col gap-2 py-1" aria-label="Memuat daftar outlet">
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </div>
                            ) : isError ? (
                                <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
                                    <Text variant="sm">Gagal memuat daftar outlet.</Text>
                                    <Text variant="xs" className="text-muted-foreground">
                                        {getApiErrorMessage(error)}
                                    </Text>
                                    <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                                        Coba lagi
                                    </Button>
                                </div>
                            ) : (
                                <ul role="listbox" aria-label="Daftar outlet" className="flex flex-col gap-1">
                                    <li>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={selectedId === null}
                                            onClick={() => handleSelect(null)}
                                            className={cn(
                                                "flex min-h-11 w-full items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60",
                                                selectedId === null && "bg-muted/60"
                                            )}
                                        >
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <Text as="span" variant="sm" weight="medium" truncate>
                                                    Semua Outlet ({outletTotal})
                                                </Text>
                                                <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                                    Ringkasan gabungan seluruh outlet
                                                </Text>
                                            </span>
                                            {selectedId === null ? (
                                                <CheckIcon
                                                    className="size-4 shrink-0 text-primary"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                        </button>
                                    </li>

                                    {outlets.map((outlet) => (
                                        <li key={outlet.id}>
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={outlet.id === selectedId}
                                                onClick={() => handleSelect(outlet.id)}
                                                className={cn(
                                                    "flex min-h-11 w-full items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60",
                                                    outlet.id === selectedId && "bg-muted/60"
                                                )}
                                            >
                                                <span className="flex min-w-0 flex-1 flex-col">
                                                    <Text as="span" variant="sm" weight="medium" truncate>
                                                        {outlet.name}
                                                    </Text>
                                                    <Text
                                                        as="span"
                                                        variant="xs"
                                                        className="truncate text-muted-foreground"
                                                    >
                                                        {outletStatusLabel(outlet.status)} • {outlet.address}
                                                    </Text>
                                                </span>
                                                {outlet.id === selectedId ? (
                                                    <CheckIcon
                                                        className="size-4 shrink-0 text-primary"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {hasMore ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    render={<Link to={SETTINGS_PATHS.outlets} />}
                                    className="mt-1 w-full"
                                >
                                    Lihat semua outlet
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </section>
    )
}
