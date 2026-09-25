import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"

import type { BundleStep } from "../../services/product-bundle/product-bundle.mutation"
import { catalogErrorMessage } from "../../utils/api-error"
import { CATALOGS_PATHS } from "../../utils/paths"
import { BUNDLE_STATUS_LABEL } from "./steps"

export function BundleStatusPanel({
    steps,
    hasFailure,
    firstFailedError,
    isPending,
    productId,
    onRetry,
}: {
    steps: BundleStep[]
    hasFailure: boolean
    firstFailedError: unknown
    isPending: boolean
    productId: string | null
    onRetry: () => void
}) {
    return (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border p-3">
            <Text variant="sm" weight="semibold">
                Status penyimpanan
            </Text>
            <ul className="flex flex-col gap-1.5">
                {steps.map((entry) => (
                    <li key={entry.key} className="flex items-center justify-between gap-3">
                        <Text variant="sm">{entry.label}</Text>
                        <Text
                            variant="xs"
                            className={
                                entry.status === "failed" ? "font-semibold text-destructive" : "text-muted-foreground"
                            }
                        >
                            {BUNDLE_STATUS_LABEL[entry.status]}
                        </Text>
                    </li>
                ))}
            </ul>

            {hasFailure ? (
                <div className="flex flex-col gap-2">
                    <p role="alert" className="text-sm font-semibold text-destructive">
                        {catalogErrorMessage(
                            firstFailedError,
                            "Sebagian data gagal disimpan. Coba lagi hanya langkah yang gagal."
                        )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" disabled={isPending} onClick={onRetry}>
                            {isPending ? (
                                <>
                                    <Spinner /> Mencoba…
                                </>
                            ) : (
                                "Coba lagi"
                            )}
                        </Button>
                        {productId !== null ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                render={<Link to={CATALOGS_PATHS.detail(productId)} />}
                            >
                                Buka Product Detail
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
