"use client"

import * as React from "react"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerSwipeHandle,
    DrawerTitle,
    DrawerTrigger,
} from "~/components/ui/drawer"
import { cn } from "~/lib/utils"

type BottomSheetContextValue = {
    desktop: boolean
    hasSnapPoints: boolean
}

const BottomSheetContext = React.createContext<BottomSheetContextValue | null>(null)

function useBottomSheet() {
    const context = React.useContext(BottomSheetContext)

    if (context === null) {
        throw new Error("BottomSheet parts must be used within <BottomSheet>.")
    }

    return context
}

/**
 * A bottom sheet built on the Base UI Drawer, so it dismisses on a swipe down
 * rather than only on a tap. `snapPoints` reaches the primitive untouched: the
 * drawer spreads its remaining props straight onto the root.
 */
function BottomSheet({
    children,
    defaultSnapPoint,
    desktop = true,
    showSwipeHandle = true,
    snapPoints,
    ...props
}: React.ComponentProps<typeof Drawer> & {
    desktop?: boolean
    showSwipeHandle?: boolean
}) {
    const hasSnapPoints = snapPoints != null && snapPoints.length > 0
    const contextValue = React.useMemo(() => ({ desktop, hasSnapPoints }), [desktop, hasSnapPoints])

    // The primitive needs an explicit starting point. Left unset it would open
    // at full height and ignore the first entry, so default to the lowest one.
    const initialSnapPoint = React.useMemo(
        () => defaultSnapPoint ?? (snapPoints != null && snapPoints.length > 0 ? snapPoints[0] : undefined),
        [defaultSnapPoint, snapPoints]
    )

    return (
        <BottomSheetContext.Provider value={contextValue}>
            <Drawer
                data-slot="bottom-sheet"
                showSwipeHandle={showSwipeHandle}
                snapPoints={snapPoints}
                defaultSnapPoint={initialSnapPoint}
                swipeDirection="down"
                {...props}
            >
                {children}
            </Drawer>
        </BottomSheetContext.Provider>
    )
}

function BottomSheetTrigger(props: React.ComponentProps<typeof DrawerTrigger>) {
    return <DrawerTrigger data-slot="bottom-sheet-trigger" {...props} />
}

function BottomSheetClose(props: React.ComponentProps<typeof DrawerClose>) {
    return <DrawerClose data-slot="bottom-sheet-close" {...props} />
}

function BottomSheetSwipeHandle({ className, ...props }: React.ComponentProps<typeof DrawerSwipeHandle>) {
    return <DrawerSwipeHandle data-slot="bottom-sheet-swipe-handle" className={className} {...props} />
}

function BottomSheetTitle({ className, ...props }: React.ComponentProps<typeof DrawerTitle>) {
    return (
        <DrawerTitle
            data-slot="bottom-sheet-title"
            className={`${className} text-start text-lg font-bold`}
            {...props}
        />
    )
}

function BottomSheetDescription({ className, ...props }: React.ComponentProps<typeof DrawerDescription>) {
    return (
        <DrawerDescription
            data-slot="bottom-sheet-description"
            className={`${className} text-start text-xs`}
            {...props}
        />
    )
}

function BottomSheetHeader({ className, ...props }: React.ComponentProps<typeof DrawerHeader>) {
    return <DrawerHeader data-slot="bottom-sheet-header" className={`${className} mb-6`} {...props} />
}

function BottomSheetFooter({ className, ...props }: React.ComponentProps<typeof DrawerFooter>) {
    return (
        <DrawerFooter
            data-slot="bottom-sheet-footer"
            className={cn("pb-[max(1rem,env(safe-area-inset-bottom))] mt-5", className)}
            {...props}
        />
    )
}

function BottomSheetBody({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="bottom-sheet-body"
            data-base-ui-swipe-ignore=""
            className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain", className)}
            {...props}
        />
    )
}

function BottomSheetContent({ className, children, ...props }: React.ComponentProps<typeof DrawerContent>) {
    const { desktop } = useBottomSheet()

    return (
        <DrawerContent
            data-slot="bottom-sheet-content"
            className={cn(
                desktop &&
                    "px-1 md:top-1/2! md:right-auto! md:bottom-auto! md:left-1/2! md:origin-center! md:rounded-xl! md:[--drawer-content-width:32rem] md:[--translate-x:calc(-50%+var(--translate-x,0px))] md:data-[swipe-direction=down]:[--translate-y:calc(-50%+var(--translate-y,0px))]",
                className
            )}
            {...props}
        >
            {children}
        </DrawerContent>
    )
}

export {
    BottomSheet,
    BottomSheetBody,
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetFooter,
    BottomSheetHeader,
    BottomSheetSwipeHandle,
    BottomSheetTitle,
    BottomSheetTrigger,
}
