import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, FormProvider, useForm, type Resolver } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select"
import { Textarea } from "~/components/ui/textarea"

import { GeographyFields } from "./geography-fields"
import { RegistrationActions } from "./registration-actions"
import { useRegistrationContext } from "./registration-context"
import {
    LEGAL_ENTITY_TYPE_OPTIONS,
    legalEntitySchema,
    type LegalEntityFormValues,
} from "../schemas/legal-entity.schema"
import { useSaveLegalEntity } from "../services/merchant-registration.mutations"
import { applyApiFieldErrors, getApiErrorMessage } from "../utils/api-error"

const FIELDS = [
    "entity_type",
    "name",
    "nib",
    "npwp",
    "address",
    "province_id",
    "regency_id",
    "district_id",
    "village_id",
    "postal_code",
] as const

export function LegalEntityForm() {
    const { registration, navigation } = useRegistrationContext()
    const mutation = useSaveLegalEntity()
    const entity = registration.legal_entity

    const form = useForm<LegalEntityFormValues>({
        resolver: zodResolver(legalEntitySchema) as unknown as Resolver<LegalEntityFormValues>,
        defaultValues: {
            entity_type: entity?.entity_type ?? "pt",
            name: entity?.name ?? registration.business_name ?? "",
            nib: entity?.nib ?? "",
            npwp: entity?.npwp ?? "",
            address: entity?.address ?? "",
            province_id: (entity?.province_id ?? "") as unknown as number,
            regency_id: (entity?.regency_id ?? "") as unknown as number,
            district_id: (entity?.district_id ?? "") as unknown as number,
            village_id: (entity?.village_id ?? "") as unknown as number,
            postal_code: entity?.postal_code ?? "",
        },
    })

    const onSubmit = form.handleSubmit((values) => {
        mutation.mutate(
            {
                ...values,
                address: values.address === "" ? null : (values.address ?? null),
                postal_code: values.postal_code === "" ? null : (values.postal_code ?? null),
            },
            {
                onSuccess: () => navigation.goNext(),
                onError: (error) => {
                    const applied = applyApiFieldErrors(error, form.setError, FIELDS)

                    if (!applied) {
                        form.setError("root", { message: getApiErrorMessage(error) })
                    }
                },
            }
        )
    })

    return (
        <FormProvider {...form}>
            <form id="legal-entity-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
                <div className="flex flex-1 flex-col gap-5 px-4 py-5">
                    {form.formState.errors.root?.message !== undefined ? (
                        <Alert variant="destructive">
                            <AlertTitle>Gagal menyimpan</AlertTitle>
                            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <Field>
                        <FieldLabel htmlFor="entity_type">Bentuk badan usaha</FieldLabel>
                        <Controller
                            control={form.control}
                            name="entity_type"
                            render={({ field }) => (
                                <NativeSelect
                                    id="entity_type"
                                    className="w-full"
                                    value={field.value}
                                    onChange={(event) => field.onChange(event.target.value)}
                                >
                                    {LEGAL_ENTITY_TYPE_OPTIONS.map((option) => (
                                        <NativeSelectOption key={option.value} value={option.value}>
                                            {option.label}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            )}
                        />
                        <FieldError
                            errors={form.formState.errors.entity_type ? [form.formState.errors.entity_type] : undefined}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="name">Nama badan usaha</FieldLabel>
                        <Input
                            id="name"
                            className="h-11"
                            placeholder="Sesuai akta pendirian"
                            aria-invalid={form.formState.errors.name !== undefined}
                            {...form.register("name")}
                        />
                        <FieldError errors={form.formState.errors.name ? [form.formState.errors.name] : undefined} />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="nib">NIB</FieldLabel>
                            <Input
                                id="nib"
                                className="h-11"
                                placeholder="Nomor Induk Berusaha"
                                aria-invalid={form.formState.errors.nib !== undefined}
                                {...form.register("nib")}
                            />
                            <FieldError errors={form.formState.errors.nib ? [form.formState.errors.nib] : undefined} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="npwp">NPWP</FieldLabel>
                            <Input
                                id="npwp"
                                className="h-11"
                                placeholder="Nomor NPWP"
                                aria-invalid={form.formState.errors.npwp !== undefined}
                                {...form.register("npwp")}
                            />
                            <FieldError
                                errors={form.formState.errors.npwp ? [form.formState.errors.npwp] : undefined}
                            />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="address">
                            Alamat <span className="font-normal text-muted-foreground">(opsional)</span>
                        </FieldLabel>
                        <Textarea
                            id="address"
                            rows={3}
                            placeholder="Alamat lengkap badan usaha"
                            {...form.register("address")}
                        />
                    </Field>

                    <GeographyFields disabled={mutation.isPending} />

                    <Field>
                        <FieldLabel htmlFor="postal_code">
                            Kode pos <span className="font-normal text-muted-foreground">(opsional)</span>
                        </FieldLabel>
                        <Input
                            id="postal_code"
                            className="h-11"
                            inputMode="numeric"
                            placeholder="Contoh: 78711"
                            {...form.register("postal_code")}
                        />
                    </Field>
                </div>

                <RegistrationActions
                    form="legal-entity-form"
                    isSubmitting={mutation.isPending}
                    onBack={navigation.goBack}
                />
            </form>
        </FormProvider>
    )
}
