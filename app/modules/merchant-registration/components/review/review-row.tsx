export function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium wrap-break-word">{value ?? "-"}</span>
        </div>
    )
}
