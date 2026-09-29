import type { ReactNode } from "react"
import { XIcon } from "lucide-react"
import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetFooter,
    BottomSheetHeader,
    BottomSheetTitle,
} from "~/components/ui/bottom-sheet"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"

export function FormDialog({
    title,
    description,
    isPending = false,
    submitLabel = "Simpan",
    cancelLabel = "Batal",
    onClose,
    onSubmit,
    children,
}: {
    title: string
    description: string
    isPending?: boolean
    submitLabel?: string
    cancelLabel?: string
    onClose: () => void
    onSubmit: () => void
    children: ReactNode
}) {
    return (
        <BottomSheet open onOpenChange={(open) => (open ? undefined : onClose())}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle>{title}</BottomSheetTitle>
                    <BottomSheetDescription>{description}</BottomSheetDescription>
                    <BottomSheetClose
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="absolute top-3 right-3 hidden md:inline-flex"
                                aria-label="Tutup"
                            />
                        }
                    >
                        <XIcon aria-hidden="true" />
                    </BottomSheetClose>
                </BottomSheetHeader>
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        onSubmit()
                    }}
                    className="flex min-h-0 flex-1 flex-col"
                    noValidate
                >
                    <BottomSheetBody className="gap-4 px-4">{children}</BottomSheetBody>

                    <BottomSheetFooter className="flex-row">
                        <Button type="button" size="lg" variant="outline" className="flex-1" onClick={onClose}>
                            {cancelLabel}
                        </Button>
                        <Button type="submit" size="lg" className="flex-1" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Spinner /> Menyimpan…
                                </>
                            ) : (
                                submitLabel
                            )}
                        </Button>
                    </BottomSheetFooter>
                </form>
            </BottomSheetContent>
        </BottomSheet>
    )
}
