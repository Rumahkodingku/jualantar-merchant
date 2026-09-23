import { PlusIcon, StoreIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { SETTINGS_PATHS } from "~/modules/settings"

const STEPS = ["Tambahkan outlet pertama Anda", "Atur jam operasional", "Tambahkan produk", "Mulai menerima pesanan"]

export function ZeroOutletState() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <StoreIcon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                        <CardTitle>Belum ada outlet</CardTitle>
                        <CardDescription>
                            Tambahkan outlet pertama Anda agar dapat mulai menerima pesanan.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <ol className="flex flex-col gap-2">
                    {STEPS.map((step, index) => (
                        <li key={step} className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                            >
                                {index + 1}
                            </span>
                            <Text variant="sm">{step}</Text>
                        </li>
                    ))}
                </ol>

                <Button render={<Link to={SETTINGS_PATHS.outletNew} />} size="lg" className="h-11 w-full text-sm">
                    <PlusIcon aria-hidden="true" />
                    Tambah Outlet
                </Button>
            </CardContent>
        </Card>
    )
}
