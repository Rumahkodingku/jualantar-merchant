import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "~/components/ui/toast"
import { SettingsSubpageHeader } from "~/modules/merchant-operations"

import { PROMOTIONS_PATHS } from "../utils/paths"

export function PromotionNewPage() {
    const [isPending, setIsPending] = useState(false)

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        window.setTimeout(() => {
            setIsPending(false)
            toast.add({
                title: "Fitur segera hadir",
                description: "Penyimpanan promo akan aktif setelah integrasi backend tersedia.",
                type: "info",
            })
        }, 600)
    }

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SettingsSubpageHeader
                title="Tambah Promo"
                description="Lengkapi detail promo untuk menampilkannya ke pelanggan."
                backTo={PROMOTIONS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Detail promo</CardTitle>
                    <CardDescription>Formulir scaffold — penyimpanan segera hadir.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Field>
                            <FieldLabel htmlFor="promotion-name">Nama promo</FieldLabel>
                            <Input id="promotion-name" placeholder="cth. Diskon 20% Akhir Pekan" className="h-11" />
                            <FieldError />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="promotion-discount">Besaran diskon (%)</FieldLabel>
                            <Input id="promotion-discount" inputMode="numeric" placeholder="cth. 20" className="h-11" />
                            <FieldError />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="promotion-description">Syarat & ketentuan</FieldLabel>
                            <Textarea
                                id="promotion-description"
                                placeholder="cth. Berlaku untuk semua produk setiap Sabtu–Minggu"
                                rows={3}
                            />
                            <FieldError />
                        </Field>

                        <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : (
                                "Simpan promo"
                            )}
                        </Button>

                        <Text variant="xs" className="text-center text-muted-foreground">
                            Tombol simpan saat ini hanya menampilkan pemberitahuan.
                        </Text>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
