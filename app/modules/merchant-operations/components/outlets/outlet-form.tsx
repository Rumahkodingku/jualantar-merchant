import { zodResolver } from "@hookform/resolvers/zod"
import { CrosshairIcon, MailIcon, PhoneIcon, StoreIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { FormProvider, useForm, type Resolver } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { applyApiFieldErrors, getApiErrorMessage } from "~/lib/api-form"
import { FormActions } from "~/components/form-actions"
import { GeographyFields, OutletPhotosField } from "~/modules/merchant-registration"
import { useOperationalUpload } from "../../hooks/use-operational-upload"
import { outletOperationsSchema, type OutletOperationsFormValues } from "../../schemas/outlet.schema"
import { useCreateOutlet, useUpdateOutlet } from "../../services/merchant-operations.mutations"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

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
] as const

function photoUrlMap(outlet: OperationalOutlet | null | undefined): Record<string, string> {
    const urls: Record<string, string> = {}

    outlet?.photos?.forEach((key, index) => {
        const url = outlet.photos_url[index]

        if (url !== null && url !== undefined) {
            urls[key] = url
        }
    })

    return urls
}

export function OutletForm({
    outlet,
    onSaved,
    onCancel,
}: {
    outlet?: OperationalOutlet | null
    onSaved: (saved: OperationalOutlet) => void
    onCancel: () => void
}) {
    const isEditing = outlet !== null && outlet !== undefined
    const createMutation = useCreateOutlet()
    const updateMutation = useUpdateOutlet(outlet?.id ?? "")
    const mutation = isEditing ? updateMutation : createMutation
    const upload = useOperationalUpload({ purpose: "outlet", imagesOnly: true })

    const [photos, setPhotos] = useState<string[]>(() => outlet?.photos ?? [])
    const [photosBusy, setPhotosBusy] = useState(false)
    const [geoError, setGeoError] = useState<string | null>(null)
    const photoUrls = useMemo(() => photoUrlMap(outlet), [outlet])

    const form = useForm<OutletOperationsFormValues>({
        resolver: zodResolver(outletOperationsSchema) as unknown as Resolver<OutletOperationsFormValues>,
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
        },
    })

    function useCurrentLocation() {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setGeoError("Perangkat tidak mendukung deteksi lokasi.")
            return
        }

        setGeoError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                void form.setValue("latitude", position.coords.latitude, { shouldDirty: true, shouldValidate: true })
                void form.setValue("longitude", position.coords.longitude, { shouldDirty: true, shouldValidate: true })
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
            photos,
        }

        const onError = (error: unknown) => {
            const applied = applyApiFieldErrors(error, form.setError, FIELDS)

            if (!applied) {
                form.setError("root", { message: getApiErrorMessage(error) })
            }
        }

        if (isEditing && outlet !== null && outlet !== undefined) {
            updateMutation.mutate(payload, { onSuccess: onSaved, onError })
        } else {
            createMutation.mutate(payload, { onSuccess: onSaved, onError })
        }
    })

    return (
        <FormProvider {...form}>
            <form id="outlet-operations-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
                <div className="flex flex-1 flex-col gap-5">
                    {form.formState.errors.root?.message !== undefined ? (
                        <Alert variant="destructive">
                            <AlertTitle>Gagal menyimpan outlet</AlertTitle>
                            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <Field>
                        <FieldLabel htmlFor="outlet-name">
                            Nama outlet <span className="text-red-600">*</span>
                        </FieldLabel>
                        <div className="relative">
                            <StoreIcon
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

                    <Field>
                        <FieldLabel>
                            Foto outlet <span className="font-normal text-muted-foreground">(opsional)</span>
                        </FieldLabel>
                        <OutletPhotosField
                            photos={photos}
                            photoUrls={photoUrls}
                            upload={upload}
                            disabled={mutation.isPending}
                            onChange={setPhotos}
                            onStateChange={(state) => setPhotosBusy(state === "requesting" || state === "uploading")}
                        />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="outlet-phone">
                                Telepon <span className="font-normal text-muted-foreground">(opsional)</span>
                            </FieldLabel>
                            <div className="relative">
                                <PhoneIcon
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
                                <MailIcon
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

                    <Field>
                        <FieldLabel htmlFor="outlet-address">
                            Alamat lengkap <span className="text-red-600">*</span>
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

                    <GeographyFields disabled={mutation.isPending} />

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

                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Jam operasional dan area layanan diatur pada halaman outlet setelah data ini disimpan.
                    </p>
                </div>

                <FormActions
                    form="outlet-operations-form"
                    submitLabel={isEditing ? "Simpan perubahan" : "Simpan outlet"}
                    isSubmitting={mutation.isPending}
                    disabled={photosBusy}
                    onBack={onCancel}
                />
            </form>
        </FormProvider>
    )
}
