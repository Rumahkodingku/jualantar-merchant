import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ThemeSwitcher } from "../components/theme-switcher"
import { SETTINGS_PATHS } from "../utils/paths"

export function AppearancePage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Tampilan"
                description="Pilih mode terang, gelap, atau ikuti sistem."
                backTo={SETTINGS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Mode tampilan</CardTitle>
                    <CardDescription as="p">
                        Pilih tampilan yang nyaman. Mode sistem mengikuti preferensi perangkat Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <ThemeSwitcher />
                </CardContent>
            </Card>
        </div>
    )
}
