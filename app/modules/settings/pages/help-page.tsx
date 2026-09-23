import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { SETTINGS_PATHS } from "../utils/paths"

const FAQS = [
    {
        question: "Bagaimana cara menambah outlet baru?",
        answer: "Buka Pengaturan → Outlet, lalu ketuk Tambah outlet dan lengkapi data alamat, jam operasional, serta area layanan.",
    },
    {
        question: "Mengapa merchant saya tidak menerima pesanan?",
        answer: "Periksa Pengaturan → Status merchant dan pastikan status Aktif. Lalu periksa jam operasional dan status tiap outlet.",
    },
    {
        question: "Bagaimana cara menambah karyawan outlet?",
        answer: "Buka Pengaturan → Outlet → pilih outlet → Karyawan, lalu tambahkan akun karyawan dengan peran yang sesuai.",
    },
    {
        question: "Kapan saldo hasil penjualan dicairkan?",
        answer: "Jadwal pencairan mengikuti ketentuan JualAntar. Pastikan rekening pencairan Anda sudah terdaftar dan aktif.",
    },
] as const

export function HelpPage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Bantuan & dukungan"
                description="Jawaban cepat dan cara menghubungi tim kami."
                backTo={SETTINGS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    {/* TODO: ganti dengan kontak CS resmi sebelum rilis. */}
                    <CardTitle>Hubungi kami</CardTitle>
                    <CardDescription>Senin–Sabtu, 08.00–21.00 WIB.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <Text as="dt" variant="sm" className="text-muted-foreground">
                                Telepon / WhatsApp
                            </Text>
                            <Text as="dd" variant="sm" weight="medium">
                                0800-000-0000
                            </Text>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <Text as="dt" variant="sm" className="text-muted-foreground">
                                Email
                            </Text>
                            <Text as="dd" variant="sm" weight="medium">
                                cs@jualantar.example
                            </Text>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <section className="flex flex-col gap-2">
                <Text as="h2" variant="sm" weight="semibold">
                    Pertanyaan umum
                </Text>
                <div className="flex flex-col gap-3">
                    {FAQS.map((faq) => (
                        <Card key={faq.question}>
                            <CardHeader>
                                <CardTitle className="text-sm">{faq.question}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Text variant="sm" className="leading-relaxed text-muted-foreground">
                                    {faq.answer}
                                </Text>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
