import { Controller, useForm } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Skeleton } from "~/components/ui/skeleton"
import { useServices } from "~/modules/service-catalog"

import { ChoiceCards } from "./choice-cards"
import { RegistrationActions } from "./registration-actions"
import { useRegistrationContext } from "./registration-context"
import { useSaveService } from "../services/merchant-registration.mutations"
import { getApiErrorMessage } from "../utils/api-error"

type ServiceFormValues = { service_id: string }

export function ServiceForm() {
    const { registration, navigation } = useRegistrationContext()
    const services = useServices()
    const mutation = useSaveService()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ServiceFormValues>({
        defaultValues: { service_id: registration.service?.id ?? "" },
    })

    const onSubmit = handleSubmit((values) => {
        if (values.service_id === "") {
            setError("service_id", { message: "Pilih salah satu layanan." })
            return
        }

        mutation.mutate(values.service_id, {
            onSuccess: () => navigation.goNext(),
            onError: (error) => {
                setError("root", { message: getApiErrorMessage(error) })
            },
        })
    })

    return (
        <form id="service-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5 px-4 py-5">
                {errors.root?.message !== undefined ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal menyimpan</AlertTitle>
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                ) : null}

                <Field>
                    <FieldLabel>Layanan JualAntar</FieldLabel>
                    {services.isPending ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                    ) : services.data && services.data.length > 0 ? (
                        <Controller
                            control={control}
                            name="service_id"
                            render={({ field }) => (
                                <ChoiceCards
                                    options={services.data.map((service) => ({
                                        value: service.id,
                                        label: service.name,
                                        description: service.description ?? undefined,
                                    }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Belum ada layanan yang tersedia. Hubungi tim JualAntar.
                        </p>
                    )}
                    <FieldError errors={errors.service_id ? [errors.service_id] : undefined} />
                </Field>
            </div>

            <RegistrationActions form="service-form" isSubmitting={mutation.isPending} onBack={navigation.goBack} />
        </form>
    )
}
