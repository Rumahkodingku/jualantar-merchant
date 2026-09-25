import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

import type { ProductFilterValues } from "../../utils/product-filters"
import type { CatalogCategory, ProductType } from "../../types/catalog.types"

const ALL = "all"

export function ProductFilterFields({
    values,
    categories,
    onChange,
}: {
    values: ProductFilterValues
    categories: CatalogCategory[]
    onChange: (patch: Partial<ProductFilterValues>) => void
}) {
    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-category">Kategori</Label>
                <Select
                    value={values.category_id === "" ? ALL : values.category_id}
                    onValueChange={(value) => onChange({ category_id: value === ALL || value == null ? "" : value })}
                >
                    <SelectTrigger id="filter-category" className="w-full">
                        <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Semua kategori</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-type">Tipe produk</Label>
                <Select
                    value={values.product_type === "" ? ALL : values.product_type}
                    onValueChange={(value) =>
                        onChange({ product_type: value === ALL || value == null ? "" : (value as ProductType) })
                    }
                >
                    <SelectTrigger id="filter-type" className="w-full">
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Semua tipe</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}
