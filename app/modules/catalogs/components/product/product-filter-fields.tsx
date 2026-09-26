import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import type { ProductFilterValues } from "../../utils/product-filters"
import type { CatalogCategory, ProductType } from "../../types/catalog.types"

const ALL = "all"

const PRODUCT_TYPE_OPTIONS: ReadonlyArray<{ value: ProductType; label: string }> = [
    { value: "simple", label: PRODUCT_TYPE_LABEL.simple },
    { value: "variable", label: PRODUCT_TYPE_LABEL.variable },
]

export function ProductFilterFields({
    values,
    categories,
    onChange,
}: {
    values: ProductFilterValues
    categories: CatalogCategory[]
    onChange: (patch: Partial<ProductFilterValues>) => void
}) {
    const categoryItems = [
        { value: ALL, label: "Semua kategori" },
        ...categories.map((category) => ({ value: category.id, label: category.name })),
    ]

    const productTypeItems = [
        { value: ALL, label: "Semua tipe" },
        ...PRODUCT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    ]

    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-category">Kategori</Label>
                <Select
                    items={categoryItems}
                    value={values.category_id === "" ? ALL : values.category_id}
                    onValueChange={(value) => onChange({ category_id: value === ALL || value == null ? "" : value })}
                >
                    <SelectTrigger id="filter-category" className="w-full">
                        <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryItems.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                                {category.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-type">Tipe produk</Label>
                <Select
                    items={productTypeItems}
                    value={values.product_type === "" ? ALL : values.product_type}
                    onValueChange={(value) =>
                        onChange({ product_type: value === ALL || value == null ? "" : (value as ProductType) })
                    }
                >
                    <SelectTrigger id="filter-type" className="w-full">
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        {productTypeItems.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}
