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
        <div className="mt-auto flex gap-2 pt-6">
            {onBack !== undefined ? (
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 flex-1"
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
                className="h-11 flex-[2] text-sm"
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
