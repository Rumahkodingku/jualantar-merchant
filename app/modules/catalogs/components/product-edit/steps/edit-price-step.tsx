import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

import { VariantDraftEditor } from "../../product-wizard/variant-draft-editor"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import type { VariantDraft } from "../../../types"

/**
 * The price step of an edit, which is the create wizard's step unchanged.
 *
 * A product that is simple still has one price and a product that is variable
 * still gets its price from a list of variants, and in both cases the rows are
 * the same draft rows the create wizard stages — the only difference is that
 * these ones carry a server id, which is what the save reads to decide between
 * patching a variant and creating one.
 */
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
