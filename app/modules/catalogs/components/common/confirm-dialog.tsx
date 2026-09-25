import type { ReactNode } from "react"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Hapus",
    pendingLabel = "Menghapus…",
    variant = "destructive",
    isPending = false,
    onConfirm,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: ReactNode
    confirmLabel?: string
    pendingLabel?: string
    variant?: "default" | "destructive"
    isPending?: boolean
    onConfirm: () => void
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <Button type="button" variant={variant} disabled={isPending} onClick={onConfirm}>
                        {isPending ? (
                            <>
                                <Spinner /> {pendingLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
