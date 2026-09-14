import { CheckIcon } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"
import { useCategories } from "~/modules/service-catalog"

import { RegistrationActions } from "./registration-actions"
import { useRegistrationContext } from "./registration-context"
import { useSaveCategories } from "../services/merchant-registration.mutations"
import { getApiErrorMessage } from "../utils/api-error"

const MAX_CATEGORIES = 3

export function CategoryForm() {
    const { registration, navigation } = useRegistrationContext()
    const serviceId = registration.service?.id
    const categories = useCategories(serviceId)
    const mutation = useSaveCategories()

    const [selected, setSelected] = useState<string[]>(registration.categories.map((category) => category.category_id))
    const [error, setError] = useState<string | null>(null)

    function toggle(categoryId: string) {
        setError(null)

        setSelected((previous) => {
            if (previous.includes(categoryId)) {
                return previous.filter((id) => id !== categoryId)
            }

            if (previous.length >= MAX_CATEGORIES) {
                setError(`Maksimal ${MAX_CATEGORIES} kategori.`)
                return previous
            }

            return [...previous, categoryId]
        })
    }

    function onSubmit() {
        if (selected.length < 1) {
            setError("Pilih minimal 1 kategori.")
            return
        }

        setError(null)
        mutation.mutate(selected, {
            onSuccess: () => navigation.goNext(),
            onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
        })
    }

    return (
        <form
            id="category-form"
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}
            className="flex flex-1 flex-col"
            noValidate
        >
            <div className="flex flex-1 flex-col gap-4">
                {error !== null ? (
                    <Alert variant="destructive">
                        <AlertTitle>Periksa pilihan Anda</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Pilih 1–{MAX_CATEGORIES} kategori yang paling sesuai.
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">
                        {selected.length}/{MAX_CATEGORIES}
                    </span>
                </div>

                {categories.isPending ? (
                    <div className="flex flex-col gap-2">
                        {[0, 1, 2, 3].map((index) => (
                            <Skeleton key={index} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                ) : categories.data && categories.data.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {categories.data.map((category) => {
                            const checked = selected.includes(category.id)

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    aria-pressed={checked}
                                    onClick={() => toggle(category.id)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors outline-none",
                                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                        checked
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border bg-card hover:bg-muted/50"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                                            checked
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-input"
                                        )}
                                    >
                                        {checked ? <CheckIcon className="size-3.5" /> : null}
                                    </span>
                                    <span className="font-medium text-foreground">{category.name}</span>
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada kategori untuk layanan ini.</p>
                )}
            </div>

            <RegistrationActions
                form="category-form"
                submitLabel="Simpan & lanjut"
                isSubmitting={mutation.isPending}
                disabled={selected.length < 1}
                onBack={navigation.goBack}
            />
        </form>
    )
}
