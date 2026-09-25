import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import { useNotificationStore } from "../hooks/use-notification-store"

import { SETTINGS_PATHS } from "../utils/paths"

type PermissionState = "granted" | "denied" | "default"

function readPermission(): PermissionState {
    if (typeof Notification === "undefined") {
        return "default"
    }

    return Notification.permission
}

const PERMISSION_LABEL: Record<PermissionState, string> = {
    granted: "Aktif — perangkat ini akan menerima notifikasi.",
    denied: "Diblokir — aktifkan kembali lewat pengaturan browser Anda.",
    default: "Belum diminta — izinkan agar tidak ketinggalan pesanan baru.",
}

export function NotificationsPage() {
    const [permission, setPermission] = useState<PermissionState>(readPermission)
    const orderUpdates = useNotificationStore((state) => state.orderUpdates)
    const promotions = useNotificationStore((state) => state.promotions)
    const setOrderUpdates = useNotificationStore((state) => state.setOrderUpdates)
    const setPromotions = useNotificationStore((state) => state.setPromotions)

    const canCustomize = permission === "granted"

    async function requestPermission() {
        if (typeof Notification === "undefined") {
            return
        }

        setPermission(await Notification.requestPermission())
    }

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Notifikasi"
                description="Atur izin dan jenis notifikasi yang Anda terima."
                backTo={SETTINGS_PATHS.home}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Notifikasi push</CardTitle>
                    <CardDescription>{PERMISSION_LABEL[permission]}</CardDescription>
                </CardHeader>
                {permission === "granted" ? null : (
                    <CardContent>
                        <Button
                            type="button"
                            size="lg"
                            className="h-11 w-full text-sm"
                            onClick={() => void requestPermission()}
                        >
                            Minta izin notifikasi
                        </Button>
                    </CardContent>
                )}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferensi</CardTitle>
                    <CardDescription>
                        {canCustomize
                            ? "Pilih jenis notifikasi yang ingin diterima."
                            : "Aktifkan izin notifikasi untuk mengatur preferensi."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    <label className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <Text as="span" id="notif-order-label" variant="sm" weight="medium">
                                Pesanan baru
                            </Text>
                            <Text as="span" variant="xs" className="text-muted-foreground">
                                Beri tahu setiap ada pesanan masuk
                            </Text>
                        </span>
                        <Switch
                            aria-labelledby="notif-order-label"
                            checked={orderUpdates}
                            disabled={!canCustomize}
                            onCheckedChange={setOrderUpdates}
                        />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <Text as="span" id="notif-promo-label" variant="sm" weight="medium">
                                Promo & info
                            </Text>
                            <Text as="span" variant="xs" className="text-muted-foreground">
                                Kabar fitur baru dan tips berjualan
                            </Text>
                        </span>
                        <Switch
                            aria-labelledby="notif-promo-label"
                            checked={promotions}
                            disabled={!canCustomize}
                            onCheckedChange={setPromotions}
                        />
                    </label>
                </CardContent>
            </Card>
        </div>
    )
}
