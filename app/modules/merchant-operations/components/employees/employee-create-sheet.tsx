import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Spinner } from "~/components/ui/spinner"
import { applyApiFieldErrors } from "~/lib/api-form"
import { authorizationErrorMessage } from "~/modules/authorization"
import { ChoiceCards } from "~/modules/merchant-registration"

import { employeePayload, employeeSchema, type EmployeeFormValues } from "../../schemas/employee.schema"
import { useCreateOutletEmployee } from "../../services/merchant-operations.mutations"
import { notifySuccess } from "../../utils/notify"
import { OUTLET_ROLE_DESCRIPTION, OUTLET_ROLE_OPTIONS } from "../../utils/outlet-status"

const FIELDS = ["email", "phone", "password", "password_confirmation", "role"] as const

const DEFAULTS: EmployeeFormValues = {
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "outlet_staff",
}

export function EmployeeCreateSheet({
    outletId,
    open,
    onOpenChange,
}: {
    outletId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const mutation = useCreateOutletEmployee(outletId)

    const {
        control,
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema) as unknown as Resolver<EmployeeFormValues>,
        defaultValues: DEFAULTS,
    })

    useEffect(() => {
        if (!open) {
            reset(DEFAULTS)
        }
    }, [open, reset])

    const onSubmit = handleSubmit((values) => {
        mutation.mutate(employeePayload(values), {
            onSuccess: () => {
                notifySuccess("Karyawan berhasil ditambahkan.", "Sampaikan email dan password kepada karyawan.")
                onOpenChange(false)
            },
            onError: (error) => {
                const applied = applyApiFieldErrors(error, setError, FIELDS)

                if (!applied) {
                    setError("root", { message: authorizationErrorMessage(error) })
                }
            },
        })
    })

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[90svh] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Tambah karyawan</SheetTitle>
                    <SheetDescription>Buat akun karyawan dan tugaskan langsung ke outlet ini.</SheetDescription>
                </SheetHeader>

                <form id="employee-create-form" onSubmit={onSubmit} className="flex flex-col gap-4 px-4" noValidate>
                    {errors.root?.message !== undefined ? (
                        <Alert variant="destructive">
                            <AlertTitle>Gagal menambah karyawan</AlertTitle>
                            <AlertDescription>{errors.root.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <Field>
                        <FieldLabel htmlFor="employee-email">
                            Email <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Input
                            id="employee-email"
                            type="email"
                            className="h-11"
                            inputMode="email"
                            placeholder="karyawan@usaha.id"
                            autoComplete="off"
                            aria-invalid={errors.email !== undefined}
                            {...register("email")}
                        />
                        <FieldDescription>Email ini dipakai karyawan untuk masuk ke aplikasi.</FieldDescription>
                        <FieldError errors={errors.email ? [errors.email] : undefined} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="employee-phone">
                            Telepon <span className="font-normal text-muted-foreground">(opsional)</span>
                        </FieldLabel>
                        <Input
                            id="employee-phone"
                            className="h-11"
                            inputMode="tel"
                            placeholder="08xxxxxxxxxx"
                            aria-invalid={errors.phone !== undefined}
                            {...register("phone")}
                        />
                        <FieldError errors={errors.phone ? [errors.phone] : undefined} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="employee-password">
                            Password awal <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Input
                            id="employee-password"
                            type="password"
                            className="h-11"
                            autoComplete="new-password"
                            aria-invalid={errors.password !== undefined}
                            {...register("password")}
                        />
                        <FieldDescription>Minimal 8 karakter dan memuat huruf serta angka.</FieldDescription>
                        <FieldError errors={errors.password ? [errors.password] : undefined} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="employee-password-confirmation">
                            Konfirmasi password <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Input
                            id="employee-password-confirmation"
                            type="password"
                            className="h-11"
                            autoComplete="new-password"
                            aria-invalid={errors.password_confirmation !== undefined}
                            {...register("password_confirmation")}
                        />
                        <FieldError
                            errors={errors.password_confirmation ? [errors.password_confirmation] : undefined}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>
                            Peran <span className="text-red-600">*</span>
                        </FieldLabel>
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <ChoiceCards
                                    options={OUTLET_ROLE_OPTIONS.map((option) => ({
                                        ...option,
                                        description: OUTLET_ROLE_DESCRIPTION[option.value],
                                    }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <FieldError errors={errors.role ? [errors.role] : undefined} />
                    </Field>
                </form>

                <SheetFooter>
                    <Button
                        type="submit"
                        form="employee-create-form"
                        size="lg"
                        className="h-11 w-full text-sm font-semibold"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan karyawan"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-11 w-full"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
