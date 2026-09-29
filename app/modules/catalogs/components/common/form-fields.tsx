import type { ReactNode } from "react"

import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

/**
 * The presentational half of a catalog form: labelled inputs, a money field, a
 * toggle row, and the error slot under each one.
 *
 * These hold no state of their own. Every catalog form — the one that writes
 * straight to the API and the one that stages into the wizard draft — lays the
 * same fields out with the same components, so a label or an error position
 * cannot drift between the two.
 */

export function NameField({
    id,
    label,
    value,
    error,
    placeholder,
    onChange,
}: {
    id: string
    label: string
    value: string
    error?: string
    placeholder?: string
    onChange: (value: string) => void
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-invalid={error !== undefined}
                className="h-11"
            />
            {error !== undefined ? <FieldError>{error}</FieldError> : null}
        </Field>
    )
}

export function DescriptionField({
    id,
    label,
    value,
    onChange,
}: {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-11" />
        </Field>
    )
}

export function MoneyField({
    id,
    label,
    value,
    error,
    placeholder,
    onChange,
}: {
    id: string
    label: string
    value: number
    error?: string
    placeholder?: string
    onChange: (value: number) => void
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
                id={id}
                inputMode="numeric"
                value={String(value)}
                onChange={(event) => onChange(Number(event.target.value))}
                placeholder={placeholder}
                aria-invalid={error !== undefined}
                className="h-11"
            />
            {error !== undefined ? <FieldError>{error}</FieldError> : null}
        </Field>
    )
}

/**
 * A switch with its label above and a line of explanation below — the pattern
 * both "chosen by default" and "must be picked" use.
 */
export function ToggleField({
    label,
    description,
    checked,
    checkedDescription,
    uncheckedDescription,
    onCheckedChange,
    error,
    ariaLabel,
    control,
}: {
    label: string
    description: string
    checked: boolean
    checkedDescription?: string
    uncheckedDescription?: string
    onCheckedChange: (checked: boolean) => void
    error?: string
    /** Needed when the visible label is not adjacent to the switch. */
    ariaLabel?: string
    /** Rendered on the trailing edge, for a control that needs its own label. */
    control?: ReactNode
}) {
    const hint = checked ? (checkedDescription ?? description) : (uncheckedDescription ?? description)

    return (
        <Field>
            <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                <div className="flex flex-col">
                    <Text variant="sm" weight="medium">
                        {label}
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        {hint}
                    </Text>
                </div>
                {control ?? (
                    <Switch
                        checked={checked}
                        aria-label={ariaLabel}
                        onCheckedChange={(value) => onCheckedChange(value === true)}
                    />
                )}
            </div>
            {error !== undefined ? <FieldError>{error}</FieldError> : null}
        </Field>
    )
}
