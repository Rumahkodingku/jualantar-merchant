import { MapPinIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

import type { MerchantOutlet } from "../types/merchant-registration.types"

function areaLabel(outlet: MerchantOutlet): string {
    if (outlet.service_area_type === "radius") {
        return `Radius ${outlet.service_radius_km ?? "-"} km`
    }

    return `Area ${outlet.service_area_type}`
}

export function OutletList({
    outlets,
    onAdd,
    onEdit,
    onDelete,
    deletingId,
}: {
    outlets: MerchantOutlet[]
    onAdd: () => void
    onEdit: (outlet: MerchantOutlet) => void
    onDelete: (outlet: MerchantOutlet) => void
    deletingId: string | null
}) {
    const [confirmingId, setConfirmingId] = useState<string | null>(null)

    return (
        <div className="flex flex-col gap-3">
            {outlets.map((outlet) => {
                const confirming = confirmingId === outlet.id

                return (
                    <div key={outlet.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate text-sm font-semibold">{outlet.name}</h3>
                                    <Badge variant={outlet.status === "active" ? "default" : "secondary"}>
                                        {outlet.status === "active" ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </div>
                                <p className="mt-1 flex items-start gap-1 text-xs leading-relaxed text-muted-foreground">
                                    <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                                    <span>
                                        {outlet.address}
                                        {outlet.geography?.village ? `, ${outlet.geography.village}` : ""}
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">{areaLabel(outlet)}</p>
                            </div>
                        </div>

                        {confirming ? (
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-destructive/5 px-3 py-2">
                                <span className="text-xs text-destructive">Hapus outlet ini?</span>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirmingId(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        disabled={deletingId === outlet.id}
                                        onClick={() => {
                                            onDelete(outlet)
                                            setConfirmingId(null)
                                        }}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(outlet)}>
                                    <PencilIcon /> Ubah
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setConfirmingId(outlet.id)}
                                >
                                    <Trash2Icon /> Hapus
                                </Button>
                            </div>
                        )}
                    </div>
                )
            })}

            <Button type="button" variant="outline" size="lg" className="h-11 w-full border-dashed" onClick={onAdd}>
                <PlusIcon /> Tambah outlet
            </Button>
        </div>
    )
}
