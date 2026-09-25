import { ExternalLinkIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { SETTINGS_PATHS } from "../utils/paths"

const APP_VERSION = import.meta.env.VITE_APP_VERSION?.trim() || null
const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL?.trim() || null
const TERMS_URL = import.meta.env.VITE_TERMS_URL?.trim() || null

function isValidExternalUrl(value: string | null): value is string {
    if (value === null) {
        return false
    }

    try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
    } catch {
        return false
    }
}

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
                    <Text as="h2" variant="lg" weight="semibold" className="tracking-tight break-words">
                        JualAntar Merchant
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        {APP_VERSION === null ? "Versi belum ditentukan" : `Versi ${APP_VERSION}`}
                    </Text>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Kebijakan privasi</CardTitle>
                    <CardDescription as="p">Pelajari bagaimana JualAntar menggunakan data usaha Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isValidExternalUrl(PRIVACY_URL) ? (
                        <Button
                            variant="outline"
                            className="h-11 w-full justify-between"
                            render={<a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" />}
                        >
                            Baca kebijakan privasi
                            <ExternalLinkIcon className="size-4" aria-hidden="true" />
                        </Button>
                    ) : (
                        <Text variant="sm" className="leading-relaxed text-muted-foreground">
                            Dokumen kebijakan privasi lengkap belum tersedia.
                        </Text>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Syarat &amp; ketentuan</CardTitle>
                    <CardDescription as="p">Pelajari aturan penggunaan aplikasi merchant.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isValidExternalUrl(TERMS_URL) ? (
                        <Button
                            variant="outline"
                            className="h-11 w-full justify-between"
                            render={<a href={TERMS_URL} target="_blank" rel="noopener noreferrer" />}
                        >
                            Baca syarat &amp; ketentuan
                            <ExternalLinkIcon className="size-4" aria-hidden="true" />
                        </Button>
                    ) : (
                        <Text variant="sm" className="leading-relaxed text-muted-foreground">
                            Dokumen syarat dan ketentuan lengkap belum tersedia.
                        </Text>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
