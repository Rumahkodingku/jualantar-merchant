import { zodResolver } from "@hookform/resolvers/zod"
import { GlobeIcon, MailIcon, PhoneIcon } from "lucide-react"
import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { applyApiFieldErrors, getApiErrorMessage } from "~/lib/api-form"
import { FormActions } from "~/components/form-actions"

import { MerchantLogoField } from "./merchant-logo-field"
import {
    merchantProfilePayload,
    merchantProfileSchema,
    type MerchantProfileFormValues,
} from "../../schemas/merchant-profile.schema"
import { useUpdateOperationalProfile } from "../../services/merchant-operations.mutations"
import { notifySuccess } from "~/lib/notify"
import type { OperationalProfile } from "../../types/merchant-operations.types"

const FIELDS = ["business_name", "description", "operational_phone", "operational_email", "website"] as const

export function MerchantProfileForm({ profile, canUpdate }: { profile: OperationalProfile; canUpdate: boolean }) {
    const mutation = useUpdateOperationalProfile()
    const [logoKey, setLogoKey] = useState<string | null>(profile.logo)
    const [logoBusy, setLogoBusy] = useState(false)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<MerchantProfileFormValues>({
        resolver: zodResolver(merchantProfileSchema) as unknown as Resolver<MerchantProfileFormValues>,
        defaultValues: {
            business_name: profile.business_name ?? "",
            description: profile.description ?? "",
            operational_phone: profile.operational_phone ?? "",
            operational_email: profile.operational_email ?? "",
            website: profile.website ?? "",
        },
    })

    const disabled = !canUpdate

    const onSubmit = handleSubmit((values) => {
        mutation.mutate(merchantProfilePayload(values, logoKey), {
            onSuccess: () => {
                notifySuccess("Profil merchant disimpan.")
            },
            onError: (error) => {
                const applied = applyApiFieldErrors(error, setError, FIELDS)

                if (!applied) {
                    setError("root", { message: getApiErrorMessage(error) })
                }
            },
        })
    })

    return (
        <form id="merchant-profile-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5">
                {errors.root?.message !== undefined ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal menyimpan profil</AlertTitle>
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                ) : null}

                <MerchantLogoField
                    key={profile.logo ?? "no-logo"}
                    logoUrl={profile.logo_url}
                    disabled={disabled || mutation.isPending}
                    onUploaded={setLogoKey}
                    onBusyChange={setLogoBusy}
                />

                <Field>
                    <FieldLabel htmlFor="business_name">
                        Nama usaha <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Input
                        id="business_name"
                        className="h-11"
                        placeholder="Contoh: Warung Sari"
                        disabled={disabled}
                        aria-invalid={errors.business_name !== undefined}
                        {...register("business_name")}
                    />
                    <FieldError errors={errors.business_name ? [errors.business_name] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="description">
                        Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FieldLabel>
                    <Textarea
                        id="description"
                        rows={4}
                        placeholder="Ceritakan singkat tentang usaha Anda"
                        disabled={disabled}
                        aria-invalid={errors.description !== undefined}
                        {...register("description")}
                    />
                    <FieldError errors={errors.description ? [errors.description] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="operational_phone">
                        Telepon operasional <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FieldLabel>
                    <div className="relative">
                        <PhoneIcon
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="operational_phone"
                            className="h-11 pl-10"
                            inputMode="tel"
                            placeholder="08xxxxxxxxxx"
                            disabled={disabled}
                            aria-invalid={errors.operational_phone !== undefined}
                            {...register("operational_phone")}
                        />
                    </div>
                    <FieldError errors={errors.operational_phone ? [errors.operational_phone] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="operational_email">
                        Email operasional <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FieldLabel>
                    <div className="relative">
                        <MailIcon
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="operational_email"
                            type="email"
                            className="h-11 pl-10"
                            placeholder="operasional@usaha.id"
                            disabled={disabled}
                            aria-invalid={errors.operational_email !== undefined}
                            {...register("operational_email")}
                        />
                    </div>
                    <FieldError errors={errors.operational_email ? [errors.operational_email] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="website">
                        Website <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FieldLabel>
                    <div className="relative">
                        <GlobeIcon
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="website"
                            className="h-11 pl-10"
                            inputMode="url"
                            placeholder="https://usaha.id"
                            disabled={disabled}
                            aria-invalid={errors.website !== undefined}
                            {...register("website")}
                        />
                    </div>
                    <FieldDescription>Awali dengan https:// agar valid.</FieldDescription>
                    <FieldError errors={errors.website ? [errors.website] : undefined} />
                </Field>
            </div>

            {canUpdate ? (
                <FormActions
                    form="merchant-profile-form"
                    submitLabel="Simpan perubahan"
                    isSubmitting={mutation.isPending}
                    disabled={logoBusy}
                />
            ) : (
                <p className="pt-6 text-xs text-muted-foreground">
                    Anda tidak memiliki izin untuk mengubah profil merchant.
                </p>
            )}
        </form>
    )
}
