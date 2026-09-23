import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon } from "lucide-react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"
import { ChoiceCards, RegistrationActions as FormActions } from "~/modules/merchant-registration"

import {
    SERVICE_AREA_TYPE_OPTIONS,
    serviceAreaSchema,
    type ServiceAreaFormValues,
} from "../../schemas/service-area.schema"
import { useUpdateServiceArea } from "../../services/merchant-operations.mutations"
import { notifyError, notifySuccess } from "../../utils/notify"
import {
    outletRegionId,
    outletRegionName,
    regionLevelLabel,
    serviceAreaSummary,
    type RegionLevel,
} from "../../utils/service-area-summary"
import type { OperationalOutlet, ServiceArea, ServiceAreaInput } from "../../types/merchant-operations.types"

function toFormValues(area: ServiceArea | null | undefined): ServiceAreaFormValues {
    if (area === null || area === undefined) {
        return { type: "radius", radius_km: undefined }
    }

    if (area.type === "radius") {
        const radius = area.radius_km === null ? undefined : Number(area.radius_km)

        return { type: "radius", radius_km: Number.isFinite(radius) ? radius : undefined }
    }

    return { type: area.type }
}

/**
 * P0 anchors a non-radius service area to the outlet's own region, so the level
 * id always comes from the outlet rather than a free geography picker.
 */
function buildPayload(values: ServiceAreaFormValues, outlet: OperationalOutlet): ServiceAreaInput {
    if (values.type === "radius") {
        return { type: "radius", radius_km: values.radius_km as number }
    }

    const level = values.type as RegionLevel

    return { type: level, [`${level}_id`]: outletRegionId(outlet, level) } as ServiceAreaInput
}

/**
 * Editable service area. Only rendered for users who hold the update capability;
 * read-only users get `ServiceAreaReadOnly` instead.
 */
export function ServiceAreaForm({ outlet, area }: { outlet: OperationalOutlet; area: ServiceArea | null | undefined }) {
    const mutation = useUpdateServiceArea(outlet.id)

    const form = useForm<ServiceAreaFormValues>({
        resolver: zodResolver(serviceAreaSchema) as unknown as Resolver<ServiceAreaFormValues>,
        defaultValues: toFormValues(area),
    })

    const selectedType = form.watch("type")
    const selectedRegionName = selectedType === "radius" ? null : outletRegionName(outlet, selectedType as RegionLevel)

    const onSubmit = form.handleSubmit((values) => {
        mutation.mutate(buildPayload(values, outlet), {
            onSuccess: () => {
                notifySuccess("Area layanan disimpan.")
            },
            onError: (error) => {
                form.setError("root", { message: getApiErrorMessage(error) })
                notifyError("Gagal menyimpan area layanan", getApiErrorMessage(error))
            },
        })
    })

    return (
        <form id="service-area-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5">
                {form.formState.errors.root?.message !== undefined ? (
                    <Alert variant="destructive">
                        <AlertTitle>Area layanan tidak tersimpan</AlertTitle>
                        <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="rounded-2xl border bg-card p-4">
                    <Text variant="xs" className="text-muted-foreground">
                        Area layanan saat ini
                    </Text>
                    <Text as="p" variant="base" weight="semibold" className="mt-0.5">
                        {serviceAreaSummary(area, outlet)}
                    </Text>
                </div>

                <Field>
                    <FieldLabel>Tipe area layanan</FieldLabel>
                    <Controller
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <ChoiceCards
                                options={SERVICE_AREA_TYPE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </Field>

                {selectedType === "radius" ? (
                    <Field>
                        <FieldLabel htmlFor="service-radius">
                            Radius (km) <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Input
                            id="service-radius"
                            className="h-11"
                            inputMode="decimal"
                            placeholder="Contoh: 5"
                            aria-invalid={form.formState.errors.radius_km !== undefined}
                            {...form.register("radius_km")}
                        />
                        <FieldDescription>Jarak maksimal pengantaran dari outlet, 0.1–999.99 km.</FieldDescription>
                        <FieldError
                            errors={form.formState.errors.radius_km ? [form.formState.errors.radius_km] : undefined}
                        />
                    </Field>
                ) : (
                    <Field>
                        <FieldLabel>{regionLevelLabel(selectedType as RegionLevel)}</FieldLabel>
                        <div className="rounded-xl border bg-muted/40 p-3">
                            <Text variant="sm" weight="medium">
                                {selectedRegionName ?? "-"}
                            </Text>
                            <Text variant="xs" className="mt-1 text-muted-foreground">
                                Wilayah ini mengikuti alamat outlet dan tidak dapat diubah dari sini.
                            </Text>
                        </div>
                    </Field>
                )}

                <Alert>
                    <InfoIcon />
                    <AlertDescription>
                        Area layanan non-radius memakai wilayah outlet sendiri sebagai batas layanan.
                    </AlertDescription>
                </Alert>
            </div>

            <FormActions form="service-area-form" submitLabel="Simpan area layanan" isSubmitting={mutation.isPending} />
        </form>
    )
}
