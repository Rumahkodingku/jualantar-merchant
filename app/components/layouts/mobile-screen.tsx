import { cn } from "~/lib/utils"

export function MobileScreen({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className="flex min-h-[100dvh] w-full justify-center bg-muted/30">
            <div className={cn("flex min-h-[100dvh] w-full max-w-md flex-col bg-background md:border-x", className)}>
                {children}
            </div>
        </div>
    )
}
