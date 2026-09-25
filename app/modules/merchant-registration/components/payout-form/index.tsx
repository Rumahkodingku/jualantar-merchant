import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { SearchableSelect, type SearchableSelectOption } from "~/components/ui/searchable-select"
import { useDebouncedValue } from "~/hooks/use-debounced-value"
import { useBanks } from "~/modules/bank-directory"
import { FormActions } from "~/components/form-actions"
import { useRegistrationContext } from "../registration-context"
import { payoutSchema, type PayoutFormValues } from "../../schemas/payout.schema"
import { useSavePayoutAccount } from "../../services/merchant-registration.mutations"
import { applyApiFieldErrors, getApiErrorMessage } from "../../utils/api-error"
import { Hash, ShieldUser, User } from "lucide-react"

const FIELDS = ["bank_id", "account_number", "account_name"] as const

export function PayoutForm() {
    const { registration, navigation } = useRegistrationContext()
    const mutation = useSavePayoutAccount()
    const existing = registration.payout_accounts[0]
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebouncedValue(search)
    const banks = useBanks(debouncedSearch.trim() === "" ? undefined : debouncedSearch.trim())
    const bankOptions = useMemo<SearchableSelectOption[]>(
        () => banks.data?.map((bank) => ({ value: bank.id, label: bank.name })) ?? [],
        [banks.data]
    )

    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema) as unknown as Resolver<PayoutFormValues>,
        defaultValues: {
            bank_id: (existing?.bank_id ?? "") as unknown as number,
            account_number: existing?.account_number ?? "",
            account_name: existing?.account_name ?? "",
        },
    })

    const onSubmit = handleSubmit((values) => {
        mutation.mutate(values, {
            onSuccess: () => navigation.goNext(),
            onError: (error) => {
                const applied = applyApiFieldErrors(error, setError, FIELDS)

                if (!applied) {
                    setError("root", { message: getApiErrorMessage(error) })
                }
            },
        })
    })

    return (
        <form id="payout-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5">
                {errors.root?.message !== undefined ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal menyimpan</AlertTitle>
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                ) : null}

                {existing !== undefined ? (
                    <div className="rounded-xl border bg-muted/40 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Rekening tersimpan</p>
                        <p className="mt-0.5 text-sm font-medium">
                            {existing.bank_name} · {existing.account_number}
                        </p>
                        <p className="text-xs text-muted-foreground">a.n. {existing.account_name}</p>
                    </div>
                ) : null}

                <Field>
                    <FieldLabel htmlFor="bank_id">
                        Bank <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Controller
                        control={control}
                        name="bank_id"
                        render={({ field }) => (
                            <SearchableSelect
                                id="bank_id"
                                value={
                                    typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null
                                }
                                onValueChange={(value) => field.onChange(value)}
                                options={bankOptions}
                                ariaInvalid={errors.bank_id !== undefined}
                                placeholder="Pilih bank"
                                searchPlaceholder="Cari bank..."
                                search={search}
                                onSearchChange={setSearch}
                                loading={banks.isPending || banks.isFetching}
                            />
                        )}
                    />
                    <FieldDescription>Pastikan nama pemilik rekening sama dengan identitas merchant.</FieldDescription>
                    <FieldError errors={errors.bank_id ? [errors.bank_id] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="account_number">
                        Nomor rekening <span className="text-red-600">*</span>
                    </FieldLabel>
                    <div className="relative">
                        <Hash
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            id="account_number"
                            className="h-11 pl-10"
                            inputMode="numeric"
                            placeholder="1234567890"
                            aria-invalid={errors.account_number !== undefined}
                            {...register("account_number")}
                        />
                    </div>
                    <FieldError errors={errors.account_number ? [errors.account_number] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="account_name">
                        Nama pemilik rekening <span className="text-red-600">*</span>
                    </FieldLabel>
                    <div className="relative">
                        <ShieldUser
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            id="account_name"
                            className="h-11 pl-10"
                            placeholder="Sesuai buku tabungan"
                            aria-invalid={errors.account_name !== undefined}
                            {...register("account_name")}
                        />
                    </div>
                    <FieldError errors={errors.account_name ? [errors.account_name] : undefined} />
                </Field>
            </div>

            <FormActions form="payout-form" isSubmitting={mutation.isPending} onBack={navigation.goBack} />
        </form>
    )
}
