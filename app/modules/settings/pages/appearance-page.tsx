import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ThemeSwitcher } from "../components/theme-switcher"
import { SETTINGS_PATHS } from "../utils/paths"

export function AppearancePage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Tampilan"
                description="Pilih mode terang, gelap, atau mengikuti sistem."
                backTo={SETTINGS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Mode tampilan</CardTitle>
                    <CardDescription>Mode sistem mengikuti tema smartphone Anda.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <ThemeSwitcher />
                </CardContent>
            </Card>
        </div>
    )
}
