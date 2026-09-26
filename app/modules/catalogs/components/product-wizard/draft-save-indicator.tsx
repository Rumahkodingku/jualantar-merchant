import { CheckIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"

import type { DraftSaveState } from "../../hooks/use-product-draft"

/**
 * Quiet proof that the wizard is being kept safe, so the merchant never has to
 * wonder whether a refresh would cost them the form.
 */
export function DraftSaveIndicator({ state, onRetry }: { state: DraftSaveState; onRetry: () => void }) {
    if (state === "idle") {
        return <span aria-hidden="true" className="flex-1" />
    }

    return (
        <Text
            variant="xs"
            role="status"
            aria-live="polite"
            className="flex flex-1 items-center gap-1.5 text-muted-foreground"
        >
            {state === "saving" ? (
                <>
                    <Spinner /> Menyimpan draft…
                </>
            ) : null}

            {state === "saved" ? (
                <>
                    <CheckIcon aria-hidden="true" className="size-3.5 text-foreground" />
                    Draft tersimpan
                </>
            ) : null}

            {state === "error" ? (
                <>
                    <span>Draft gagal disimpan.</span>
                    <Button type="button" size="xs" variant="ghost" onClick={onRetry}>
                        <RefreshCwIcon /> Coba lagi
                    </Button>
                </>
            ) : null}
        </Text>
    )
}
