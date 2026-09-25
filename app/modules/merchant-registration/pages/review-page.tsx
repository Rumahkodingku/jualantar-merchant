import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { ApiError } from "~/lib/api"

import { RegistrationReview } from "../components/review/registration-review"
import { useRegistrationContext } from "../components/registration-context"
import { useSubmitRegistration } from "../services/merchant-registration.mutations"
import { firstIncompleteStep } from "../utils/steps"

export function ReviewPage() {
    const { registration, navigation } = useRegistrationContext()
    const submit = useSubmitRegistration()
    const [error, setError] = useState<ApiError | null>(null)

    function handleSubmit() {
        setError(null)

        submit.mutate(undefined, {
            onError: (mutationError) => {
                setError(
                    mutationError instanceof ApiError
                        ? mutationError
                        : new ApiError({
                              status: 0,
                              code: "unknown_error",
                              title: "Gagal mengirim",
                              detail: "Terjadi kesalahan. Silakan coba lagi.",
                          })
                )
            },
        })
    }

    const incompleteFields = error?.code === "registration_incomplete" ? Object.keys(error.errors) : []

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-4">
                {error !== null ? (
                    <Alert variant="destructive">
                        <AlertTitle>Pendaftaran belum bisa dikirim</AlertTitle>
                        <AlertDescription>
                            {incompleteFields.length > 0 ? (
                                <span>
                                    Lengkapi data berikut:{" "}
                                    {incompleteFields.map((field) => field.replace(/_/g, " ")).join(", ")}.
                                </span>
                            ) : (
                                error.detail
                            )}
                        </AlertDescription>
                    </Alert>
                ) : null}

                {error?.code === "registration_incomplete" ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigation.goToStep(firstIncompleteStep(registration))}
                    >
                        Lengkapi sekarang
                    </Button>
                ) : null}

                <RegistrationReview registration={registration} />
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-6">
                <Button
                    type="button"
                    size="lg"
                    className="h-11 w-full text-sm"
                    disabled={submit.isPending}
                    onClick={handleSubmit}
                >
                    {submit.isPending ? (
                        <>
                            <Spinner /> Mengirim…
                        </>
                    ) : (
                        "Kirim pendaftaran"
                    )}
                </Button>
                <Text variant="xs" align="center" className="text-muted-foreground">
                    Setelah dikirim, data tidak dapat diubah sampai proses peninjauan selesai.
                </Text>
            </div>
        </div>
    )
}
