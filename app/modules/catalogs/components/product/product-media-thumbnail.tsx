import { useEffect, useState } from "react"
import { PackageIcon } from "lucide-react"

import { cn } from "~/lib/utils"

export function ProductMediaThumbnail({
    src,
    alt,
    className,
}: {
    src: string | null
    alt: string
    className?: string
}) {
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        setFailed(false)
    }, [src])

    if (src === null || src === "" || failed) {
        return (
            <span className={cn("flex size-full items-center justify-center", className)}>
                <PackageIcon aria-hidden="true" className="size-8 text-muted-foreground/70" />
            </span>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={cn("size-full object-cover", className)}
        />
    )
}
