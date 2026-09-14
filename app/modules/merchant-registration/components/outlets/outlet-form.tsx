import { zodResolver } from "@hookform/resolvers/zod"
import { CrosshairIcon, Mail, Phone, Store } from "lucide-react"
import { useState } from "react"
import { Controller, FormProvider, useForm, type Resolver } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { ChoiceCards } from "../ui/choice-cards"
import { GeographyFields } from "./geography-fields"
import { OperatingHoursField } from "./operating-hours-field"
import { RegistrationActions } from "../ui/registration-actions"
import {
    hoursToPayload,
    outletSchema,
    SERVICE_AREA_TYPE_OPTIONS,
    type OutletFormValues,
} from "../../schemas/outlet.schema"
import { useCreateOutlet, useUpdateOutlet } from "../../services/merchant-registration.mutations"
import type { MerchantOutlet } from "../../types/merchant-registration.types"
import { applyApiFieldErrors, getApiErrorMessage } from "../../utils/api-error"

const FIELDS = [
    "name",
    "phone",
    "email",
    "address",
    "province_id",
    "regency_id",
    "district_id",
    "village_id",
    "postal_code",
    "latitude",
    "longitude",
    "service_area_type",
    "service_radius_km",
    "operating_hours",
] as const

function defaultHours(outlet: MerchantOutlet | null | undefined): OutletFormValues["hours"] {
    const hours: OutletFormValues["hours"] = {}

    if (outlet?.operating_hours === null || outlet?.operating_hours === undefined) {
        return hours
    }

    for (const [day, slots] of Object.entries(outlet.operating_hours)) {
        if (slots === undefined || slots.length === 0) {
            continue
        }

        hours[day] = slots.map((slot) => ({ open: slot.open, close: slot.close }))
    }

    return hours
}

export function OutletForm({
    outlet,
    onSaved,
    onCancel,
}: {
    outlet?: MerchantOutlet | null
    onSaved: () => void
    onCancel: () => void
}) {
    const createMutation = useCreateOutlet()
    const updateMutation = useUpdateOutlet()
    const isEditing = outlet !== null && outlet !== undefined
    const mutation = isEditing ? updateMutation : createMutation
    const [geoError, setGeoError] = useState<string | null>(null)

    const form = useForm<OutletFormValues>({
        resolver: zodResolver(outletSchema) as unknown as Resolver<OutletFormValues>,
        defaultValues: {
            name: outlet?.name ?? "",
            phone: outlet?.phone ?? "",
            email: outlet?.email ?? "",
            address: outlet?.address ?? "",
            province_id: (outlet?.province_id ?? "") as unknown as number,
            regency_id: (outlet?.regency_id ?? "") as unknown as number,
            district_id: (outlet?.district_id ?? "") as unknown as number,
            village_id: (outlet?.village_id ?? "") as unknown as number,
            postal_code: outlet?.postal_code ?? "",
            latitude: (outlet?.latitude ?? "") as unknown as number,
            longitude: (outlet?.longitude ?? "") as unknown as number,
            service_area_type: outlet?.service_area_type ?? "radius",
            service_radius_km: (outlet?.service_radius_km ?? undefined) as unknown as number,
            hours: defaultHours(outlet),
        },
    })

    const serviceAreaType = form.watch("service_area_type")

    function useCurrentLocation() {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setGeoError("Perangkat tidak mendukung deteksi lokasi.")
            return
        }

        setGeoError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                void form.setValue("latitude", position.coords.latitude, {
                    shouldDirty: true,
                    shouldValidate: true,
                })
                void form.setValue("longitude", position.coords.longitude, {
                    shouldDirty: true,
                    shouldValidate: true,
                })
            },
            () => setGeoError("Gagal mengambil lokasi. Isi koordinat manual."),
            { enableHighAccuracy: true, timeout: 10_000 }
        )
    }

    const onSubmit = form.handleSubmit((values) => {
        const payload = {
            name: values.name,
            phone: values.phone === "" ? null : (values.phone ?? null),
            email: values.email === "" ? null : (values.email ?? null),
            address: values.address,
            province_id: values.province_id,
            regency_id: values.regency_id,
            district_id: values.district_id,
            village_id: values.village_id,
            postal_code: values.postal_code,
            latitude: values.latitude,
            longitude: values.longitude,
            service_area_type: values.service_area_type,
            service_radius_km: values.service_area_type === "radius" ? (values.service_radius_km ?? null) : null,
            operating_hours: hoursToPayload(values.hours),
        }

        const onError = (error: unknown) => {
            const applied = applyApiFieldErrors(error, form.setError, FIELDS)

            if (!applied) {
                form.setError("root", { message: getApiErrorMessage(error) })
            }
        }

        if (isEditing && outlet !== null && outlet !== undefined) {
            updateMutation.mutate({ outletId: outlet.id, values: payload }, { onSuccess: onSaved, onError })
        } else {
            createMutation.mutate(payload, { onSuccess: onSaved, onError })
        }
    })

    return (
        <FormProvider {...form}>
            <form id="outlet-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
                <div className="flex flex-1 flex-col gap-5">
                    {form.formState.errors.root?.message !== undefined ? (
                        <Alert variant="destructive">
                            <AlertTitle>Gagal menyimpan outlet</AlertTitle>
                            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    {/* Nama Outlet */}
                    <Field>
                        <FieldLabel htmlFor="outlet-name">
                            Nama outlet <span className="text-red-600">*</span>
                        </FieldLabel>
                        <div className="relative">
                            <Store
                                aria-hidden="true"
                                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                id="outlet-name"
                                className="h-11 pl-10"
                                placeholder="Contoh: Outlet Utama"
                                aria-invalid={form.formState.errors.name !== undefined}
                                {...form.register("name")}
                            />
                        </div>
                        <FieldError errors={form.formState.errors.name ? [form.formState.errors.name] : undefined} />
                    </Field>

                    {/* Telepon & Email */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="outlet-phone">
                                Telepon <span className="font-normal text-muted-foreground">(opsional)</span>
                            </FieldLabel>
                            <div className="relative">
                                <Phone
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                                />

                                <Input
                                    id="outlet-phone"
                                    className="h-11 pl-10"
                                    inputMode="tel"
                                    placeholder="08xxxxxxxxxx"
                                    {...form.register("phone")}
                                />
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="outlet-email">
                                Email <span className="font-normal text-muted-foreground">(opsional)</span>
                            </FieldLabel>
                            <div className="relative">
                                <Mail
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                                />

                                <Input
                                    id="outlet-email"
                                    type="email"
                                    className="h-11 pl-10"
                                    placeholder="outlet@usaha.id"
                                    aria-invalid={form.formState.errors.email !== undefined}
                                    {...form.register("email")}
                                />
                            </div>
                            <FieldError
                                errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
                            />
                        </Field>
                    </div>

                    {/* Alamat Lengkap */}
                    <Field>
                        <FieldLabel htmlFor="outlet-address">
                            Alamat Lengkap <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Textarea
                            id="outlet-address"
                            rows={3}
                            placeholder="Jalan, nomor, patokan"
                            aria-invalid={form.formState.errors.address !== undefined}
                            {...form.register("address")}
                        />
                        <FieldError
                            errors={form.formState.errors.address ? [form.formState.errors.address] : undefined}
                        />
                    </Field>

                    {/* Geografi */}
                    <GeographyFields disabled={mutation.isPending} />

                    {/* Kode Pos */}
                    <Field>
                        <FieldLabel htmlFor="outlet-postal">
                            Kode pos <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Input
                            id="outlet-postal"
                            className="h-11"
                            inputMode="numeric"
                            placeholder="Contoh: 78711"
                            aria-invalid={form.formState.errors.postal_code !== undefined}
                            {...form.register("postal_code")}
                        />
                        <FieldError
                            errors={form.formState.errors.postal_code ? [form.formState.errors.postal_code] : undefined}
                        />
                    </Field>

                    {/* Koordinat */}
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="outlet-latitude">
                                    Latitude <span className="text-red-600">*</span>
                                </FieldLabel>
                                <Input
                                    id="outlet-latitude"
                                    className="h-11"
                                    inputMode="decimal"
                                    placeholder="-0.12345678"
                                    aria-invalid={form.formState.errors.latitude !== undefined}
                                    {...form.register("latitude")}
                                />
                                <FieldError
                                    errors={
                                        form.formState.errors.latitude ? [form.formState.errors.latitude] : undefined
                                    }
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="outlet-longitude">
                                    Longitude <span className="text-red-600">*</span>
                                </FieldLabel>
                                <Input
                                    id="outlet-longitude"
                                    className="h-11"
                                    inputMode="decimal"
                                    placeholder="111.12345678"
                                    aria-invalid={form.formState.errors.longitude !== undefined}
                                    {...form.register("longitude")}
                                />
                                <FieldError
                                    errors={
                                        form.formState.errors.longitude ? [form.formState.errors.longitude] : undefined
                                    }
                                />
                            </Field>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit"
                            onClick={useCurrentLocation}
                        >
                            <CrosshairIcon /> Gunakan lokasi saat ini
                        </Button>
                        {geoError !== null ? <p className="text-xs text-destructive">{geoError}</p> : null}
                    </div>

                    <Field>
                        <FieldLabel>
                            Area layanan <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Controller
                            control={form.control}
                            name="service_area_type"
                            render={({ field }) => (
                                <ChoiceCards
                                    options={SERVICE_AREA_TYPE_OPTIONS}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </Field>

                    {serviceAreaType === "radius" ? (
                        <Field>
                            <FieldLabel htmlFor="outlet-radius">
                                Radius (km) <span className="text-red-600">*</span>
                            </FieldLabel>
                            <Input
                                id="outlet-radius"
                                className="h-11"
                                inputMode="decimal"
                                placeholder="Contoh: 5"
                                aria-invalid={form.formState.errors.service_radius_km !== undefined}
                                {...form.register("service_radius_km")}
                            />
                            <FieldError
                                errors={
                                    form.formState.errors.service_radius_km
                                        ? [form.formState.errors.service_radius_km]
                                        : undefined
                                }
                            />
                        </Field>
                    ) : null}

                    <Field>
                        <FieldLabel>Jam operasional</FieldLabel>
                        <OperatingHoursField />
                    </Field>
                </div>

                <RegistrationActions
                    form="outlet-form"
                    submitLabel={isEditing ? "Simpan perubahan" : "Simpan outlet"}
                    isSubmitting={mutation.isPending}
                    onBack={onCancel}
                />
            </form>
        </FormProvider>
    )
}
