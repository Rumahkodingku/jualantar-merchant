import { useState } from "react"

import { Alert, AlertDescription } from "~/components/ui/alert"

import { OutletForm } from "../components/outlet-form"
import { OutletList } from "../components/outlet-list"
import { RegistrationActions } from "../components/registration-actions"
import { useRegistrationContext } from "../components/registration-context"
import { useDeleteOutlet } from "../services/merchant-registration.mutations"
import type { MerchantOutlet } from "../types/merchant-registration.types"

export function OutletsPage() {
    const { registration, navigation } = useRegistrationContext()
    const deleteMutation = useDeleteOutlet()
    const [editing, setEditing] = useState<MerchantOutlet | null>(null)
    const [mode, setMode] = useState<"list" | "form">("list")

    const outlets = registration.outlets
    const hasActiveOutlet = outlets.some((outlet) => outlet.status === "active")

    if (mode === "form") {
        return (
            <OutletForm
                outlet={editing}
                onSaved={() => {
                    setEditing(null)
                    setMode("list")
                }}
                onCancel={() => {
                    setEditing(null)
                    setMode("list")
                }}
            />
        )
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-4 px-4 py-5">
                {outlets.length === 0 ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Belum ada outlet. Tambahkan minimal satu outlet aktif agar merchant Anda dapat menerima pesanan.
                    </p>
                ) : null}

                <OutletList
                    outlets={outlets}
                    deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
                    onAdd={() => {
                        setEditing(null)
                        setMode("form")
                    }}
                    onEdit={(outlet) => {
                        setEditing(outlet)
                        setMode("form")
                    }}
                    onDelete={(outlet) => deleteMutation.mutate(outlet.id)}
                />

                {outlets.length > 0 && !hasActiveOutlet ? (
                    <Alert>
                        <AlertDescription>
                            Minimal satu outlet harus berstatus aktif sebelum pendaftaran dikirim.
                        </AlertDescription>
                    </Alert>
                ) : null}
            </div>

            <RegistrationActions
                type="button"
                submitLabel="Simpan & lanjut"
                disabled={!hasActiveOutlet}
                onBack={navigation.goBack}
                onSubmit={navigation.goNext}
            />
        </div>
    )
}
