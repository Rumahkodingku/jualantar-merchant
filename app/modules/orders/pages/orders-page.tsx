import { NotebookPenIcon } from "lucide-react"
import { useSearchParams } from "react-router"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

const STATUS_TABS = [
    { value: "all", label: "Semua" },
    { value: "new", label: "Baru" },
    { value: "preparing", label: "Diproses" },
    { value: "ready", label: "Siap" },
    { value: "completed", label: "Selesai" },
] as const

export type OrderStatusFilter = (typeof STATUS_TABS)[number]["value"]

function toStatusFilter(value: string | null): OrderStatusFilter {
    return STATUS_TABS.some((tab) => tab.value === value) ? (value as OrderStatusFilter) : "all"
}

export function OrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const status = toStatusFilter(searchParams.get("status"))

    return (
        <div className="flex flex-1 flex-col gap-5">
            <section className="flex flex-col gap-1">
                <Text as="h1" variant="2xl" weight="semibold" className="tracking-tight">
                    Pesanan
                </Text>
                <Text variant="sm" className="text-muted-foreground">
                    Pesanan pelanggan akan tampil di sini.
                </Text>
            </section>

            <div role="tablist" aria-label="Filter status pesanan" className="no-scrollbar flex gap-2 overflow-x-auto">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={status === tab.value}
                        onClick={() => setSearchParams(status === tab.value ? {} : { status: tab.value })}
                        className={cn(
                            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors outline-none",
                            status === tab.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "bg-card text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <NotebookPenIcon aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>Belum ada pesanan</EmptyTitle>
                    <EmptyDescription>
                        Integrasi pesanan segera hadir. Tab filter di atas sudah mengikuti format URL final.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Text variant="xs" className="text-muted-foreground">
                        Format URL: /orders?status={status}
                    </Text>
                </EmptyContent>
            </Empty>
        </div>
    )
}
