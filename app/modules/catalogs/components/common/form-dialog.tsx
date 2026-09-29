import type { ReactNode } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Spinner } from "~/components/ui/spinner"

/**
 * The dialog shell every catalog form shares: title, a form body, and the
 * Batal/Simpan footer with the pending state spelled out.
 *
 * Saving is disabled while a write is in flight, and the label swaps to a
 * spinner so the button that was pressed is visibly the one being waited on.
 */
export function FormDialog({
    title,
    isPending = false,
    submitLabel = "Simpan",
    cancelLabel = "Batal",
    onClose,
    onSubmit,
    children,
}: {
    title: string
    isPending?: boolean
    submitLabel?: string
    cancelLabel?: string
    onClose: () => void
    onSubmit: () => void
    children: ReactNode
}) {
    return (
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        onSubmit()
                    }}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    {children}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {cancelLabel}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Spinner /> Menyimpan…
                                </>
                            ) : (
                                submitLabel
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
