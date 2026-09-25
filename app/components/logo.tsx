import type { CSSProperties, HTMLAttributes } from "react"

import logoUrl from "../assets/logo.svg?url"

export interface LogoProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    size?: number | string
}

export function Logo({ size = 64, className, style, ...props }: LogoProps) {
    const mask: CSSProperties = {
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: "currentColor",
        maskImage: `url(${logoUrl})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        WebkitMaskImage: `url(${logoUrl})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
    }

    return <span role="img" aria-label="JualAntar" className={className} style={{ ...mask, ...style }} {...props} />
}
