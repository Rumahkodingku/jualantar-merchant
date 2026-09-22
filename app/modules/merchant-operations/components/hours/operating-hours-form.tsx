import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, type Resolver } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { getApiErrorMessage } from "~/lib/api-form"
import { OperatingHoursField, RegistrationActions as FormActions } from "~/modules/merchant-registration"

import { operatingHoursSchema, type OperatingHoursFormValues } from "../../schemas/operating-hours.schema"
import { useUpdateOperatingHours } from "../../services/merchant-operations.mutations"
import { formToOperatingHoursPayload, operatingHoursToForm } from "../../utils/operating-hours"
import { notifyError, notifySuccess } from "../../utils/notify"
import type { OperatingHours } from "~/modules/merchant-registration"

export function OperatingHoursForm({
    outletId,
    schedule,
    canUpdate,
}: {
    outletId: string
    schedule: OperatingHours | null | undefined
    canUpdate: boolean
}) {
    const mutation = useUpdateOperatingHours(outletId)

    const form = useForm<OperatingHoursFormValues>({
        resolver: zodResolver(operatingHoursSchema) as unknown as Resolver<OperatingHoursFormValues>,
        defaultValues: { hours: operatingHoursToForm(schedule) },
    })

    const onSubmit = form.handleSubmit((values) => {
        mutation.mutate(formToOperatingHoursPayload(values.hours), {
            onSuccess: () => {
                notifySuccess("Jam operasional disimpan.")
            },
            onError: (error) => {
                form.setError("root", { message: getApiErrorMessage(error) })
                notifyError("Gagal menyimpan jam operasional", getApiErrorMessage(error))
            },
        })
    })

    return (
        <FormProvider {...form}>
            <form id="operating-hours-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
                <div className="flex flex-1 flex-col gap-4">
                    {form.formState.errors.root?.message !== undefined ? (
                        <Alert variant="destructive">
                            <AlertTitle>Jadwal tidak tersimpan</AlertTitle>
                            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <OperatingHoursField />
                </div>

                {canUpdate ? (
                    <FormActions
                        form="operating-hours-form"
                        submitLabel="Simpan jam operasional"
                        isSubmitting={mutation.isPending}
                    />
                ) : (
                    <p className="pt-6 text-xs text-muted-foreground">
                        Anda tidak memiliki izin untuk mengubah jam operasional.
                    </p>
                )}
            </form>
        </FormProvider>
    )
}
