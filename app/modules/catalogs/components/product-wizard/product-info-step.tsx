import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { PRODUCT_TYPE_FORM_LABEL } from "../../utils/labels"
import type { ProductType } from "../../types/catalog.types"
import type { ProductInfoFormValues } from "../../schemas/catalog.schema"

export function ProductInfoStep({
    values,
    errors,
    categories,
    onChange,
}: {
    values: ProductInfoFormValues
    errors: Record<string, string>
    categories: Array<{ id: string; name: string }>
    onChange: (patch: Partial<ProductInfoFormValues>) => void
}) {
    const categoryItems = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }))

    return (
        <div className="flex flex-col gap-4">
            <Field>
                <FieldLabel htmlFor="product-name">
                    Nama Produk <span className="text-red-600">*</span>
                </FieldLabel>
                <Input
                    id="product-name"
                    value={values.name}
                    onChange={(event) => onChange({ name: event.target.value })}
                    placeholder="cth. Ayam Geprek"
                    aria-invalid={errors.name !== undefined}
                    className="h-11"
                />
                {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <Field>
                <FieldLabel htmlFor="product-category">
                    Kategori Produk<span className="text-red-600">*</span>
                </FieldLabel>
                <Select
                    items={categoryItems}
                    value={values.category_id === "" ? "" : values.category_id}
                    onValueChange={(value) => onChange({ category_id: value ?? "" })}
                >
                    <SelectTrigger
                        id="product-category"
                        className="h-11 w-full"
                        aria-invalid={errors.category_id !== undefined}
                    >
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="p-3">
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category_id !== undefined ? <FieldError>{errors.category_id}</FieldError> : null}
            </Field>

            <Field>
                <FieldLabel htmlFor="product-description">Deskripsi</FieldLabel>
                <Textarea
                    id="product-description"
                    value={values.description ?? ""}
                    onChange={(event) => onChange({ description: event.target.value })}
                    placeholder="cth. Ayam goreng crispy dengan sambal khas JualAntar."
                    rows={3}
                    aria-invalid={errors.description !== undefined}
                />
                {errors.description !== undefined ? <FieldError>{errors.description}</FieldError> : null}
            </Field>

            <div className="flex flex-col gap-2">
                <FieldLabel id="product-type-label">
                    Tipe Produk <span className="text-red-600">*</span>
                </FieldLabel>
                <RadioGroup
                    value={values.product_type}
                    onValueChange={(value) => onChange({ product_type: value as ProductType })}
                    aria-labelledby="product-type-label"
                    className="gap-2"
                >
                    {(["simple", "variable"] as const).map((type) => (
                        <label
                            key={type}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50",
                                values.product_type === type && "border-primary bg-primary/5"
                            )}
                        >
                            <RadioGroupItem value={type} id={`product-type-${type}`} />
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <Text variant="sm" weight="semibold">
                                    {PRODUCT_TYPE_FORM_LABEL[type]}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {type === "simple" ? "Satu harga untuk seluruh produk" : "Harga per variant"}
                                </Text>
                            </span>
                        </label>
                    ))}
                </RadioGroup>
                {errors.product_type !== undefined ? <FieldError>{errors.product_type}</FieldError> : null}
            </div>
        </div>
    )
}
