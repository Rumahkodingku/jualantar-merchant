import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { SETTINGS_PATHS } from "../utils/paths"

const CONTACT = {
    phone: import.meta.env.VITE_SUPPORT_PHONE?.trim() || null,
    email: import.meta.env.VITE_SUPPORT_EMAIL?.trim() || null,
} as const

const FAQS = [
    {
        id: "outlet",
        question: "Bagaimana cara menambah outlet baru?",
        answer: "Buka Pengaturan → Outlet, pilih Tambah outlet, lalu lengkapi alamat, jam operasional, dan area layanan.",
    },
    {
        id: "status",
        question: "Mengapa usaha saya tidak menerima pesanan?",
        answer: "Periksa Pengaturan → Status usaha dan pastikan statusnya Aktif. Lalu periksa jam operasional dan status setiap outlet.",
    },
    {
        id: "employee",
        question: "Bagaimana cara menambah karyawan outlet?",
        answer: "Buka Pengaturan → Outlet → pilih outlet → Karyawan, lalu tambahkan akun karyawan dengan peran yang sesuai.",
    },
    {
        id: "payout",
        question: "Kapan saldo hasil penjualan dicairkan?",
        answer: "Jadwal pencairan mengikuti ketentuan JualAntar. Pastikan rekening pencairan Anda sudah terdaftar dan aktif.",
    },
] as const

export function HelpPage() {
    const hasPhone = CONTACT.phone !== null
    const hasEmail = CONTACT.email !== null

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Bantuan & dukungan"
                description="Jawaban cepat dan cara menghubungi tim kami."
                backTo={SETTINGS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Hubungi kami</CardTitle>
                    <CardDescription as="p">Informasi kontak resmi akan ditampilkan di sini.</CardDescription>
                </CardHeader>
                <CardContent>
                    {hasPhone || hasEmail ? (
                        <dl className="flex flex-col gap-3">
                            {hasPhone ? (
                                <div className="flex items-center justify-between gap-4">
                                    <Text as="dt" variant="sm" className="shrink-0 text-muted-foreground">
                                        Telepon / WhatsApp
                                    </Text>
                                    <Text
                                        as="dd"
                                        variant="sm"
                                        weight="medium"
                                        className="min-w-0 text-right break-words"
                                    >
                                        <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
                                    </Text>
                                </div>
                            ) : null}
                            {hasEmail ? (
                                <div className="flex items-center justify-between gap-4">
                                    <Text as="dt" variant="sm" className="shrink-0 text-muted-foreground">
                                        Email
                                    </Text>
                                    <Text
                                        as="dd"
                                        variant="sm"
                                        weight="medium"
                                        className="min-w-0 text-right break-words"
                                    >
                                        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                                    </Text>
                                </div>
                            ) : null}
                        </dl>
                    ) : (
                        <Text variant="sm" className="leading-relaxed text-muted-foreground">
                            Kontak resmi belum tersedia. Silakan kembali lagi setelah informasi layanan dipublikasikan.
                        </Text>
                    )}
                </CardContent>
            </Card>

            <section className="flex flex-col gap-2">
                <Text as="h2" variant="sm" weight="semibold">
                    Pertanyaan umum
                </Text>
                <Accordion defaultValue={["outlet"]} className="rounded-2xl border bg-card px-4">
                    {FAQS.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                <Text as="p" variant="sm" className="leading-relaxed text-muted-foreground">
                                    {faq.answer}
                                </Text>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </div>
    )
}
