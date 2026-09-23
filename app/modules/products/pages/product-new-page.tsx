import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "~/components/ui/toast"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import { PRODUCTS_PATHS } from "../utils/paths"

export function ProductNewPage() {
    const [isPending, setIsPending] = useState(false)

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        window.setTimeout(() => {
            setIsPending(false)
            toast.add({
                title: "Fitur segera hadir",
                description: "Penyimpanan produk akan aktif setelah integrasi backend tersedia.",
                type: "info",
            })
        }, 600)
    }

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Tambah Produk"
                description="Lengkapi detail produk untuk menampilkannya ke pelanggan."
                backTo={PRODUCTS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Detail produk</CardTitle>
                    <CardDescription>Formulir scaffold — penyimpanan segera hadir.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Field>
                            <FieldLabel htmlFor="product-name">Nama produk</FieldLabel>
                            <Input id="product-name" placeholder="cth. Ayam Goreng + Nasi" className="h-11" />
                            <FieldError />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="product-price">Harga (Rp)</FieldLabel>
                            <Input id="product-price" inputMode="numeric" placeholder="cth. 15000" className="h-11" />
                            <FieldError />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="product-description">Deskripsi</FieldLabel>
                            <Textarea id="product-description" placeholder="Deskripsi singkat produk" rows={3} />
                            <FieldError />
                        </Field>

                        <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : (
                                "Simpan produk"
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
