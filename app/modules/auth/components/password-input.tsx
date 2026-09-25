import * as React from "react"
import { EyeIcon, EyeOffIcon, LockKeyholeIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

interface PasswordInputProps extends React.ComponentProps<typeof Input> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    { className, id, ...props },
    ref
) {
    const [visible, setVisible] = React.useState(false)
    const inputId = id ?? React.useId()

    return (
        <div className="relative">
            <LockKeyholeIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
                ref={ref}
                id={inputId}
                type={visible ? "text" : "password"}
                className={cn("pr-11 pl-10", className)}
                {...props}
            />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
                className="absolute inset-y-0 right-1 my-auto h-9 w-9 text-muted-foreground"
            >
                {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
            </Button>
        </div>
    )
})
