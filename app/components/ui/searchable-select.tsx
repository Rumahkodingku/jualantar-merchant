"use client"

import * as React from "react"
import { LoaderCircleIcon, SearchIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export type SearchableSelectOption = {
    value: number
    label: string
}

type SearchableSelectProps = {
    id?: string
    value: number | null
    onValueChange: (value: number) => void
    options: SearchableSelectOption[]
    disabled?: boolean
    ariaInvalid?: boolean
    placeholder?: string
    searchPlaceholder?: string
    search: string
    onSearchChange: (value: string) => void
    loading?: boolean
    emptyText?: string
}

export function SearchableSelect({
    id,
    value,
    onValueChange,
    options,
    disabled = false,
    ariaInvalid = false,
    placeholder,
    searchPlaceholder = "Cari...",
    search,
    onSearchChange,
    loading = false,
    emptyText = "Tidak ditemukan",
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const labelCacheRef = React.useRef<Record<string, React.ReactNode>>({})

    const items = React.useMemo(() => {
        for (const option of options) {
            labelCacheRef.current[String(option.value)] = option.label
        }

        return { ...labelCacheRef.current }
    }, [options])

    React.useEffect(() => {
        if (!open) {
            return
        }

        const frame = requestAnimationFrame(() => inputRef.current?.focus())

        return () => cancelAnimationFrame(frame)
    }, [open])

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen)

        if (!nextOpen) {
            onSearchChange("")
        }
    }

    function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            return
        }

        event.stopPropagation()

        if (event.key === "Enter") {
            event.preventDefault()
        }
    }

    return (
        <Select
            id={id}
            value={value}
            onValueChange={(nextValue) => {
                if (typeof nextValue === "number") {
                    onValueChange(nextValue)
                }
            }}
            open={open}
            onOpenChange={handleOpenChange}
            items={items}
            disabled={disabled}
        >
            <SelectTrigger className="w-full" aria-invalid={ariaInvalid}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
                contentHeader={
                    <div className="sticky top-0 z-20 border-b bg-popover p-1.5">
                        <InputGroup className="h-10 rounded-lg border-input/30 bg-input/30 shadow-none">
                            <InputGroupAddon>
                                {loading ? (
                                    <LoaderCircleIcon className="size-4 shrink-0 animate-spin opacity-50" />
                                ) : (
                                    <SearchIcon className="size-4 shrink-0 opacity-50" />
                                )}
                            </InputGroupAddon>
                            <InputGroupInput
                                ref={inputRef}
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder={searchPlaceholder}
                            />
                        </InputGroup>
                    </div>
                }
            >
                {options.length > 0 ? (
                    options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="h-10 cursor-pointer px-4 text-sm"
                        >
                            {option.label}
                        </SelectItem>
                    ))
                ) : (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        {loading ? "Memuat..." : emptyText}
                    </div>
                )}
            </SelectContent>
        </Select>
    )
}
