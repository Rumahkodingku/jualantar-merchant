import { ReceiptTextIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { Text } from "~/components/ui/text"

const SUMMARY_CARDS = [
    { label: "Saldo", value: "Rp0", hint: "segera hadir" },
    { label: "Pemasukan hari ini", value: "Rp0", hint: "segera hadir" },
] as const

export function FinancesPage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <section className="flex flex-col gap-1">
                <Text as="h1" variant="2xl" weight="semibold" className="tracking-tight">
                    Keuangan
                </Text>
                <Text variant="sm" className="text-muted-foreground">
                    Ringkasan saldo dan riwayat transaksi usaha Anda.
                </Text>
            </section>

            <div className="grid grid-cols-2 gap-3">
                {SUMMARY_CARDS.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-0.5">
                            <Text variant="xl" weight="semibold">
                                {card.value}
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                {card.hint}
                            </Text>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <section className="flex flex-col gap-2">
                <Text as="h2" variant="sm" weight="semibold">
                    Riwayat transaksi
                </Text>
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ReceiptTextIcon aria-hidden="true" />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada transaksi</EmptyTitle>
                        <EmptyDescription>
                            Riwayat pencairan dan pemasukan akan tampil di sini setelah integrasi keuangan tersedia.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </section>
        </div>
    )
}
