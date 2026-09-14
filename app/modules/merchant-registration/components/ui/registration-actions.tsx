import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"

export function RegistrationActions({
    onBack,
    onSubmit,
    submitLabel = "Simpan & lanjut",
    isSubmitting = false,
    disabled = false,
    type = "submit",
    form,
}: {
    onBack?: () => void
    onSubmit?: () => void
    submitLabel?: string
    isSubmitting?: boolean
    disabled?: boolean
    type?: "submit" | "button"
    form?: string
}) {
    return (
        <div className="mt-auto flex w-auto gap-2 pt-6">
            {onBack !== undefined ? (
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full flex-1 text-sm font-semibold"
                    onClick={onBack}
                    disabled={isSubmitting}
                >
                    Kembali
                </Button>
            ) : null}
            <Button
                type={type}
                form={form}
                size="lg"
                className="h-11 w-full flex-1 text-sm font-semibold"
                disabled={disabled || isSubmitting}
                onClick={type === "button" ? onSubmit : undefined}
            >
                {isSubmitting ? (
                    <>
                        <Spinner /> Menyimpan…
                    </>
                ) : (
                    submitLabel
                )}
            </Button>
        </div>
    )
}
