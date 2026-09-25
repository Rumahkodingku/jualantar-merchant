export function DetailRows({ rows }: { rows: Array<{ term: string; value: string }> }) {
    return (
        <dl className="flex flex-col divide-y rounded-xl border">
            {rows.map((row) => (
                <div key={row.term} className="flex items-start justify-between gap-4 px-3 py-2">
                    <dt className="shrink-0 text-sm text-muted-foreground">{row.term}</dt>
                    <dd className="text-right text-sm font-medium wrap-break-word">{row.value}</dd>
                </div>
            ))}
        </dl>
    )
}
