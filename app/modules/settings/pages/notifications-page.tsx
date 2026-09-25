import { useEffect, useState } from "react"

import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { useNotificationStore } from "../hooks/use-notification-store"
import { SETTINGS_PATHS } from "../utils/paths"

type PermissionState = "granted" | "denied" | "default" | "unsupported"

function readPermission(): PermissionState {
    if (typeof Notification === "undefined") {
        return "unsupported"
    }

    return Notification.permission
}

const PERMISSION_LABEL: Record<PermissionState, string> = {
    granted: "Notifikasi diizinkan untuk perangkat ini.",
    denied: "Notifikasi diblokir. Izinkan notifikasi dari pengaturan browser atau PWA.",
    default: "Notifikasi belum diminta. Izinkan agar tidak ketinggalan pesanan baru.",
    unsupported: "Browser ini tidak mendukung notifikasi perangkat.",
}

export function NotificationsPage() {
    const [permission, setPermission] = useState<PermissionState>("default")
    const [requestError, setRequestError] = useState<string | null>(null)
    const orderUpdates = useNotificationStore((state) => state.orderUpdates)
    const promotions = useNotificationStore((state) => state.promotions)
    const setOrderUpdates = useNotificationStore((state) => state.setOrderUpdates)
    const setPromotions = useNotificationStore((state) => state.setPromotions)

    const canCustomize = permission === "granted"

    useEffect(() => {
        function syncPermission() {
            setPermission(readPermission())
        }

        syncPermission()
        window.addEventListener("focus", syncPermission)
        return () => window.removeEventListener("focus", syncPermission)
    }, [])

    async function requestPermission() {
        if (permission !== "default" || typeof Notification === "undefined") {
            return
        }

        setRequestError(null)

        try {
            setPermission(await Notification.requestPermission())
        } catch {
            setRequestError("Izin notifikasi tidak dapat diminta. Periksa pengaturan browser lalu coba kembali.")
        }
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
                    <CardTitle as="h2">Notifikasi perangkat</CardTitle>
                    <CardDescription as="p" aria-live="polite">
                        {PERMISSION_LABEL[permission]}
                    </CardDescription>
                </CardHeader>
                {permission === "default" ? (
                    <CardContent>
                        {requestError !== null ? (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{requestError}</AlertDescription>
                            </Alert>
                        ) : null}
                        <Button
                            type="button"
                            size="lg"
                            className="h-11 w-full text-sm"
                            onClick={() => void requestPermission()}
                        >
                            Izinkan notifikasi
                        </Button>
                    </CardContent>
                ) : null}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Preferensi notifikasi</CardTitle>
                    <CardDescription as="p">
                        {canCustomize
                            ? "Pilih jenis notifikasi yang ingin diterima. Preferensi ini tersimpan di perangkat ini."
                            : "Izinkan notifikasi terlebih dahulu untuk mengatur preferensi. Preferensi ini akan tersimpan di perangkat ini."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    <label className="flex min-h-11 items-center justify-between gap-3">
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <Text as="span" id="notif-order-label" variant="sm" weight="medium" className="break-words">
                                Pesanan baru
                            </Text>
                            <Text
                                as="span"
                                id="notif-order-description"
                                variant="xs"
                                className="leading-relaxed break-words text-muted-foreground"
                            >
                                Beri tahu setiap ada pesanan masuk.
                            </Text>
                        </span>
                        <Switch
                            aria-labelledby="notif-order-label"
                            aria-describedby="notif-order-description"
                            checked={orderUpdates}
                            disabled={!canCustomize}
                            onCheckedChange={setOrderUpdates}
                        />
                    </label>

                    <label className="flex min-h-11 items-center justify-between gap-3">
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <Text as="span" id="notif-promo-label" variant="sm" weight="medium" className="break-words">
                                Promo & info
                            </Text>
                            <Text
                                as="span"
                                id="notif-promo-description"
                                variant="xs"
                                className="leading-relaxed break-words text-muted-foreground"
                            >
                                Kabar fitur baru dan tips berjualan.
                            </Text>
                        </span>
                        <Switch
                            aria-labelledby="notif-promo-label"
                            aria-describedby="notif-promo-description"
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
