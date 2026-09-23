import { GraduationCapIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Text } from "~/components/ui/text"

const ARTICLES = [
    {
        title: "Foto produk yang bikin lapar",
        description: "Tips pencahayaan dan angle untuk katalog outlet.",
    },
    {
        title: "Atur jam operasional anti bocor",
        description: "Pastikan outlet terlihat buka di jam yang tepat.",
    },
]

export function AcademyBanner() {
    return (
        <section aria-label="JualAntar Academy" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                JualAntar Academy
            </Text>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <GraduationCapIcon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                            <CardTitle>Belajar kelola usaha</CardTitle>
                            <CardDescription>Materi singkat untuk pemilik outlet.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {ARTICLES.map((article) => (
                        <div key={article.title} className="rounded-xl border bg-card p-3">
                            <Text as="p" variant="sm" weight="medium">
                                {article.title}
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                {article.description}
                            </Text>
                        </div>
                    ))}
                    <Text variant="xs" className="text-muted-foreground">
                        Materi pembelajaran lengkap segera hadir.
                    </Text>
                </CardContent>
            </Card>
        </section>
    )
}
