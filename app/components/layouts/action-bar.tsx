import { cn } from "~/lib/utils"

export function ActionBar({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "sticky bottom-0 z-20 mt-auto border-t bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md",
                className
            )}
        >
            {children}
        </div>
    )
}
