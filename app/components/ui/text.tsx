import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const textVariants = cva("", {
    variants: {
        variant: {
            xs: "text-xs",
            sm: "text-sm",
            base: "text-base",
            lg: "text-lg",
            xl: "text-xl",
            "2xl": "text-2xl",
            "3xl": "text-3xl",
            "4xl": "text-4xl",
            "5xl": "text-5xl",
            "6xl": "text-6xl",
            "7xl": "text-7xl",
            "8xl": "text-8xl",
            "9xl": "text-9xl",
        },
        weight: {
            thin: "font-thin",
            light: "font-light",
            normal: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
            extrabold: "font-extrabold",
            black: "font-black",
        },
        align: {
            left: "text-left",
            center: "text-center",
            right: "text-right",
            justify: "text-justify",
        },
        transform: {
            none: "",
            uppercase: "uppercase",
            lowercase: "lowercase",
            capitalize: "capitalize",
        },
        nowrap: {
            true: "whitespace-nowrap",
        },
        truncate: {
            true: "truncate",
        },
        lineClamp: {
            "1": "line-clamp-1",
            "2": "line-clamp-2",
            "3": "line-clamp-3",
            "4": "line-clamp-4",
            "5": "line-clamp-5",
            "6": "line-clamp-6",
        },
    },
    defaultVariants: {
        variant: "base",
        transform: "none",
    },
})

const textDefaultTag: Record<
    NonNullable<VariantProps<typeof textVariants>["variant"]>,
    keyof React.JSX.IntrinsicElements
> = {
    xs: "span",
    sm: "p",
    base: "p",
    lg: "p",
    xl: "h4",
    "2xl": "h3",
    "3xl": "h3",
    "4xl": "h2",
    "5xl": "h2",
    "6xl": "h1",
    "7xl": "h1",
    "8xl": "h1",
    "9xl": "h1",
}

type TextProps = useRender.ComponentProps<"p"> &
    VariantProps<typeof textVariants> & {
        as?: keyof React.JSX.IntrinsicElements
    }

function Text({
    className,
    variant,
    weight,
    align,
    transform,
    nowrap,
    truncate,
    lineClamp,
    as,
    render,
    ...props
}: TextProps) {
    const defaultTagName = (as ?? textDefaultTag[variant ?? "base"]) as keyof React.JSX.IntrinsicElements

    return useRender({
        defaultTagName,
        props: mergeProps<"p">(
            {
                className: cn(
                    textVariants({ variant, weight, align, transform, nowrap, truncate, lineClamp }),
                    className
                ),
            },
            props
        ),
        render,
        state: {
            slot: "text",
            variant,
        },
    })
}

export { Text, textVariants, type TextProps }
