import { useFormContext } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select"
import { useDistricts, useProvinces, useRegencies, useVillages } from "~/modules/geography"

function toNumber(value: string): number | "" {
    return value === "" ? "" : Number(value)
}

export function GeographyFields({ disabled = false }: { disabled?: boolean }) {
    const { watch, setValue, formState } = useFormContext()
    const errors = formState.errors

    const provinceId = watch("province_id") as number | "" | undefined
    const regencyId = watch("regency_id") as number | "" | undefined
    const districtId = watch("district_id") as number | "" | undefined
    const villageId = watch("village_id") as number | "" | undefined

    const provinces = useProvinces()
    const regencies = useRegencies(typeof provinceId === "number" ? provinceId : undefined)
    const districts = useDistricts(typeof regencyId === "number" ? regencyId : undefined)
    const villages = useVillages(typeof districtId === "number" ? districtId : undefined)

    function update(name: string, value: number | "") {
        void setValue(name, value, { shouldDirty: true, shouldValidate: true })
    }

    return (
        <div className="flex flex-col gap-4">
            <Field>
                <FieldLabel htmlFor="province_id">Provinsi</FieldLabel>
                <NativeSelect
                    id="province_id"
                    className="w-full"
                    disabled={disabled || provinces.isPending}
                    value={provinceId === undefined ? "" : String(provinceId)}
                    aria-invalid={errors.province_id !== undefined}
                    onChange={(event) => {
                        update("province_id", toNumber(event.target.value))
                        update("regency_id", "")
                        update("district_id", "")
                        update("village_id", "")
                    }}
                >
                    <NativeSelectOption value="">Pilih provinsi</NativeSelectOption>
                    {provinces.data?.map((province) => (
                        <NativeSelectOption key={province.id} value={province.id}>
                            {province.name}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <FieldError errors={errors.province_id ? [errors.province_id] : undefined} />
            </Field>

            <Field>
                <FieldLabel htmlFor="regency_id">Kabupaten / Kota</FieldLabel>
                <NativeSelect
                    id="regency_id"
                    className="w-full"
                    disabled={typeof provinceId !== "number" || regencies.isPending}
                    value={regencyId === undefined ? "" : String(regencyId)}
                    aria-invalid={errors.regency_id !== undefined}
                    onChange={(event) => {
                        update("regency_id", toNumber(event.target.value))
                        update("district_id", "")
                        update("village_id", "")
                    }}
                >
                    <NativeSelectOption value="">Pilih kabupaten/kota</NativeSelectOption>
                    {regencies.data?.map((regency) => (
                        <NativeSelectOption key={regency.id} value={regency.id}>
                            {regency.name}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <FieldError errors={errors.regency_id ? [errors.regency_id] : undefined} />
            </Field>

            <Field>
                <FieldLabel htmlFor="district_id">Kecamatan</FieldLabel>
                <NativeSelect
                    id="district_id"
                    className="w-full"
                    disabled={typeof regencyId !== "number" || districts.isPending}
                    value={districtId === undefined ? "" : String(districtId)}
                    aria-invalid={errors.district_id !== undefined}
                    onChange={(event) => {
                        update("district_id", toNumber(event.target.value))
                        update("village_id", "")
                    }}
                >
                    <NativeSelectOption value="">Pilih kecamatan</NativeSelectOption>
                    {districts.data?.map((district) => (
                        <NativeSelectOption key={district.id} value={district.id}>
                            {district.name}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <FieldError errors={errors.district_id ? [errors.district_id] : undefined} />
            </Field>

            <Field>
                <FieldLabel htmlFor="village_id">Desa / Kelurahan</FieldLabel>
                <NativeSelect
                    id="village_id"
                    className="w-full"
                    disabled={typeof districtId !== "number" || villages.isPending}
                    value={villageId === undefined ? "" : String(villageId)}
                    aria-invalid={errors.village_id !== undefined}
                    onChange={(event) => update("village_id", toNumber(event.target.value))}
                >
                    <NativeSelectOption value="">Pilih desa/kelurahan</NativeSelectOption>
                    {villages.data?.map((village) => (
                        <NativeSelectOption key={village.id} value={village.id}>
                            {village.name}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <FieldError errors={errors.village_id ? [errors.village_id] : undefined} />
            </Field>
        </div>
    )
}
