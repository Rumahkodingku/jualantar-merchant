import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { VariantDraftEditor } from "../../product-wizard/variant-draft-editor"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import type { VariantDraft } from "../../../types"

export function EditPriceStep({
    isSimple,
    priceRaw,
    priceError,
    variants,
    onPriceChange,
    onVariantsChange,
}: {
    isSimple: boolean
    priceRaw: string
    priceError: string | undefined
    variants: VariantDraft[]
    onPriceChange: (value: string) => void
    onVariantsChange: (variants: VariantDraft[]) => void
}) {
    return (
        <WizardStepShell
            title={isSimple ? "Harga" : "Variant"}
            description={
                isSimple
                    ? "Produk simple menggunakan satu harga."
                    : "Ubah variant yang sudah ada, atau tambahkan variant baru."
            }
        >
            {isSimple ? (
                <Field>
                    <FieldLabel htmlFor="edit-price">Harga (Rp)</FieldLabel>
                    <Input
                        id="edit-price"
                        inputMode="numeric"
                        value={priceRaw}
                        onChange={(event) => onPriceChange(event.target.value)}
                        placeholder="cth. 18000"
                        aria-invalid={priceError !== undefined}
                        className="h-11"
                    />
                    {priceError !== undefined ? <FieldError>{priceError}</FieldError> : null}
                </Field>
            ) : (
                <VariantDraftEditor variants={variants} onChange={onVariantsChange} mode="edit" />
            )}
        </WizardStepShell>
    )
}
