import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, type Resolver } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { getApiErrorMessage } from "~/lib/api-form"
import { FormActions } from "~/components/form-actions"
import { OperatingHoursField } from "~/modules/merchant-registration"

import { operatingHoursSchema, type OperatingHoursFormValues } from "../../schemas/operating-hours.schema"
import { useUpdateOperatingHours } from "../../services/merchant-operations.mutations"
import { formToOperatingHoursPayload, operatingHoursToForm } from "../../utils/operating-hours"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { OperatingHours } from "~/modules/merchant-registration"

/**
 * Editable operating hours. Only rendered for users who hold the update
 * capability; read-only users get `OperatingHoursReadOnly` instead.
 */
export function OperatingHoursForm({
    outletId,
    schedule,
}: {
    outletId: string
    schedule: OperatingHours | null | undefined
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

                <FormActions
                    form="operating-hours-form"
                    submitLabel="Simpan jam operasional"
                    isSubmitting={mutation.isPending}
                />
            </form>
        </FormProvider>
    )
}
