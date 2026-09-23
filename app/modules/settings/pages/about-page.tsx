import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { SETTINGS_PATHS } from "../utils/paths"

export function AboutPage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Tentang aplikasi"
                description="Informasi aplikasi JualAntar Merchant."
                backTo={SETTINGS_PATHS.home}
            />

            <section className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <span
                    aria-hidden="true"
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary"
                >
                    J
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                    <Text as="h2" variant="lg" weight="semibold" truncate className="tracking-tight">
                        JualAntar Merchant
                    </Text>
                    {/* TODO: ganti dengan versi rilis yang sebenarnya. */}
                    <Text variant="xs" className="text-muted-foreground">
                        Versi 1.0.0
                    </Text>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>Kebijakan privasi</CardTitle>
                    <CardDescription>Ringkasan cara kami mengelola data Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Text variant="sm" className="leading-relaxed text-muted-foreground">
                        Data usaha, outlet, dan akun Anda digunakan untuk menjalankan layanan pemesanan JualAntar,
                        termasuk menampilkan katalog ke pelanggan dan memproses transaksi. Kami tidak membagikan data
                        Anda ke pihak ketiga di luar kebutuhan operasional layanan. Teks lengkap kebijakan akan
                        diterbitkan sebelum versi produksi.
                    </Text>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Syarat & ketentuan</CardTitle>
                    <CardDescription>Aturan penggunaan aplikasi merchant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Text variant="sm" className="leading-relaxed text-muted-foreground">
                        Dengan menggunakan aplikasi ini, merchant menyetujui untuk menjaga keakuratan data usaha, jam
                        operasional, dan ketersediaan produk, serta memproses pesanan pelanggan sesuai ketentuan layanan
                        JualAntar. Teks lengkap syarat & ketentuan akan diterbitkan sebelum versi produksi.
                    </Text>
                </CardContent>
            </Card>
        </div>
    )
}
