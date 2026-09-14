import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { SearchableSelect, type SearchableSelectOption } from "~/components/ui/searchable-select"
import { useDebouncedValue } from "~/hooks/use-debounced-value"
import { useDistricts, useProvinces, useRegencies, useVillages } from "~/modules/geography"

const toOptions = (data?: { id: number; name: string }[]): SearchableSelectOption[] => {
    return data?.map((item) => ({ value: item.id, label: item.name })) ?? []
}

export function GeographyFields({ disabled = false }: { disabled?: boolean }) {
    const { watch, setValue, formState } = useFormContext()
    const errors = formState.errors

    const provinceId = watch("province_id") as number | "" | undefined
    const regencyId = watch("regency_id") as number | "" | undefined
    const districtId = watch("district_id") as number | "" | undefined
    const villageId = watch("village_id") as number | "" | undefined

    const [provinceSearch, setProvinceSearch] = useState("")
    const [regencySearch, setRegencySearch] = useState("")
    const [districtSearch, setDistrictSearch] = useState("")
    const [villageSearch, setVillageSearch] = useState("")

    const debouncedProvinceSearch = useDebouncedValue(provinceSearch)
    const debouncedRegencySearch = useDebouncedValue(regencySearch)
    const debouncedDistrictSearch = useDebouncedValue(districtSearch)
    const debouncedVillageSearch = useDebouncedValue(villageSearch)

    const provinces = useProvinces(debouncedProvinceSearch)
    const regencies = useRegencies(typeof provinceId === "number" ? provinceId : undefined, debouncedRegencySearch)
    const districts = useDistricts(typeof regencyId === "number" ? regencyId : undefined, debouncedDistrictSearch)
    const villages = useVillages(typeof districtId === "number" ? districtId : undefined, debouncedVillageSearch)

    const provinceOptions = useMemo(() => toOptions(provinces.data), [provinces.data])
    const regencyOptions = useMemo(() => toOptions(regencies.data), [regencies.data])
    const districtOptions = useMemo(() => toOptions(districts.data), [districts.data])
    const villageOptions = useMemo(() => toOptions(villages.data), [villages.data])

    const update = (name: string, value: number | "") => {
        void setValue(name, value, { shouldDirty: true, shouldValidate: true })
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Provinsi */}
            <Field>
                <FieldLabel htmlFor="province_id">
                    Provinsi <span className="text-red-600">*</span>
                </FieldLabel>
                <SearchableSelect
                    id="province_id"
                    value={typeof provinceId === "number" ? provinceId : null}
                    onValueChange={(value) => {
                        update("province_id", value)
                        update("regency_id", "")
                        update("district_id", "")
                        update("village_id", "")
                        setRegencySearch("")
                        setDistrictSearch("")
                        setVillageSearch("")
                    }}
                    options={provinceOptions}
                    disabled={disabled}
                    ariaInvalid={errors.province_id !== undefined}
                    placeholder="Pilih provinsi"
                    searchPlaceholder="Cari provinsi..."
                    search={provinceSearch}
                    onSearchChange={setProvinceSearch}
                    loading={provinces.isPending || provinces.isFetching}
                />
                <FieldError errors={errors.province_id ? [errors.province_id] : undefined} />
            </Field>

            {/* Kabupaten / Kota */}
            <Field>
                <FieldLabel htmlFor="regency_id">
                    Kabupaten / Kota <span className="text-red-600">*</span>
                </FieldLabel>
                <SearchableSelect
                    id="regency_id"
                    value={typeof regencyId === "number" ? regencyId : null}
                    onValueChange={(value) => {
                        update("regency_id", value)
                        update("district_id", "")
                        update("village_id", "")
                        setDistrictSearch("")
                        setVillageSearch("")
                    }}
                    options={regencyOptions}
                    disabled={disabled || typeof provinceId !== "number"}
                    ariaInvalid={errors.regency_id !== undefined}
                    placeholder="Pilih kabupaten/kota"
                    searchPlaceholder="Cari kabupaten/kota..."
                    search={regencySearch}
                    onSearchChange={setRegencySearch}
                    loading={regencies.isPending || regencies.isFetching}
                />
                <FieldError errors={errors.regency_id ? [errors.regency_id] : undefined} />
            </Field>

            {/* Kecamatan */}
            <Field>
                <FieldLabel htmlFor="district_id">
                    Kecamatan <span className="text-red-600">*</span>
                </FieldLabel>
                <SearchableSelect
                    id="district_id"
                    value={typeof districtId === "number" ? districtId : null}
                    onValueChange={(value) => {
                        update("district_id", value)
                        update("village_id", "")
                        setVillageSearch("")
                    }}
                    options={districtOptions}
                    disabled={disabled || typeof regencyId !== "number"}
                    ariaInvalid={errors.district_id !== undefined}
                    placeholder="Pilih kecamatan"
                    searchPlaceholder="Cari kecamatan..."
                    search={districtSearch}
                    onSearchChange={setDistrictSearch}
                    loading={districts.isPending || districts.isFetching}
                />
                <FieldError errors={errors.district_id ? [errors.district_id] : undefined} />
            </Field>

            {/* Desa / Kelurahan */}
            <Field>
                <FieldLabel htmlFor="village_id">
                    Desa / Kelurahan <span className="text-red-600">*</span>
                </FieldLabel>
                <SearchableSelect
                    id="village_id"
                    value={typeof villageId === "number" ? villageId : null}
                    onValueChange={(value) => update("village_id", value)}
                    options={villageOptions}
                    disabled={disabled || typeof districtId !== "number"}
                    ariaInvalid={errors.village_id !== undefined}
                    placeholder="Pilih desa/kelurahan"
                    searchPlaceholder="Cari desa/kelurahan..."
                    search={villageSearch}
                    onSearchChange={setVillageSearch}
                    loading={villages.isPending || villages.isFetching}
                />
                <FieldError errors={errors.village_id ? [errors.village_id] : undefined} />
            </Field>
        </div>
    )
}
