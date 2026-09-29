import { ProductInfoStep } from "../../product-wizard/product-info-step"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import type { ProductInfoFormValues } from "../../../schemas"
import type { ProductType } from "../../../types"

/**
 * The first step of an edit, over a product that already has a type.
 *
 * Everything here is the create wizard's step with one thing withheld: the
 * choice of type. The API will not change a product's type, so offering it would
 * be offering something that fails on save. The settled type is shown instead,
 * which also tells the merchant which of the two price shapes they are looking
 * at on the next step.
 */
export function EditInfoStep({
    values,
    errors,
    categories,
    productType,
    onChange,
}: {
    values: ProductInfoFormValues
    errors: Record<string, string>
    categories: Array<{ id: string; name: string }>
    productType: ProductType
    onChange: (patch: Partial<ProductInfoFormValues>) => void
}) {
    return (
        <WizardStepShell title="Informasi produk" description="Nama, kategori, dan tipe produk.">
            <ProductInfoStep
                values={values}
                errors={errors}
                categories={categories}
                onChange={onChange}
                readOnlyProductType={productType}
            />
        </WizardStepShell>
    )
}
