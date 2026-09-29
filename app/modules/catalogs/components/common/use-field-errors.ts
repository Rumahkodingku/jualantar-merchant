import { useCallback, useState } from "react"

/**
 * The one error pattern every catalog form repeated: a flat map of field name
 * to message, and an edit that has to forget the field's error so a stale
 * complaint never sits under a value the merchant already corrected.
 *
 * `clear` takes any number of fields because some controls move two values at
 * once — toggling "required" also clamps the minimum — and both of their errors
 * should go with it.
 */
export function useFieldErrors() {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const clear = useCallback((...fields: string[]) => {
        setErrors((current) => {
            if (fields.every((field) => current[field] === undefined)) {
                return current
            }

            const next = { ...current }

            for (const field of fields) {
                delete next[field]
            }

            return next
        })
    }, [])

    const reset = useCallback(() => {
        setErrors((current) => (Object.keys(current).length === 0 ? current : {}))
    }, [])

    return { errors, setErrors, clear, reset }
}
