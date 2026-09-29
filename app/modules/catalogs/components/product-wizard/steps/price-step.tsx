import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

import { VariantDraftEditor } from "../variant-draft-editor"
import { WizardStepShell } from "../wizard-step-shell"
import type { VariantDraft } from "../../../types/product-draft.types"

/**
 * A simple product has one price; a variable one gets its price from its
 * variants, so this step is really "the price, or the list of prices".
 *
 * The two are mutually exclusive, which is why they share a step: the choice
 * was made in the previous step and the merchant should not have to walk back
 * to change how a price is entered.
 */
export function PriceStep({
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
                    : "Tambahkan minimal satu variant sebelum melanjutkan."
            }
        >
            {isSimple ? (
                <Field>
                    <FieldLabel htmlFor="product-price">Harga (Rp)</FieldLabel>
                    <Input
                        id="product-price"
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
                <VariantDraftEditor variants={variants} onChange={onVariantsChange} />
            )}
        </WizardStepShell>
    )
}
