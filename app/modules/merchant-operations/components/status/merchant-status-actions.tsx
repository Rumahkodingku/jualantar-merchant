import { useState } from "react"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"

import {
    MERCHANT_STATUS_ACTION_LABEL,
    merchantStatusPresentation,
    type MerchantStatusAction,
} from "../../utils/merchant-status"
import type { MerchantStatus } from "../../types/merchant-operations.types"

export function MerchantStatusActions({
    status,
    canUpdate,
    isPending,
    onActivate,
    onSuspend,
    onReactivate,
}: {
    status: MerchantStatus
    canUpdate: boolean
    isPending: boolean
    onActivate: () => void
    onSuspend: () => void
    onReactivate: () => void
}) {
    const [confirmOpen, setConfirmOpen] = useState(false)

    if (!canUpdate) {
        return null
    }

    const run = (action: MerchantStatusAction) => {
        if (action === "activate") {
            onActivate()
            return
        }

        if (action === "reactivate") {
            onReactivate()
            return
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {merchantStatusPresentation(status).actions.map((action) => {
                if (action === "suspend") {
                    return (
                        <AlertDialog key={action} open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <AlertDialogTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="lg"
                                        className="h-11 w-full text-sm font-semibold"
                                        disabled={isPending}
                                    />
                                }
                            >
                                {MERCHANT_STATUS_ACTION_LABEL.suspend}
                            </AlertDialogTrigger>

                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Suspend merchant ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Seluruh outlet akan berhenti menerima pesanan sampai merchant diaktifkan
                                        kembali. Customer tidak dapat membuat pesanan baru selama merchant ditangguhkan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={isPending}
                                        onClick={() => {
                                            setConfirmOpen(false)
                                            onSuspend()
                                        }}
                                    >
                                        {isPending ? (
                                            <>
                                                <Spinner /> Memproses…
                                            </>
                                        ) : (
                                            "Ya, suspend"
                                        )}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )
                }

                return (
                    <Button
                        key={action}
                        type="button"
                        size="lg"
                        className="h-11 w-full text-sm font-semibold"
                        disabled={isPending}
                        onClick={() => run(action)}
                    >
                        {isPending ? (
                            <>
                                <Spinner /> Memproses…
                            </>
                        ) : (
                            MERCHANT_STATUS_ACTION_LABEL[action]
                        )}
                    </Button>
                )
            })}
        </div>
    )
}
