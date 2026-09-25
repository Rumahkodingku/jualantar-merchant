export function issuesToMessages<T extends Record<string, string> = Record<string, string>>(
    issues: readonly { path: PropertyKey[]; message: string }[]
): Partial<T> & Record<string, string> {
    const messages: Record<string, string> = {}

    for (const issue of issues) {
        const key = String(issue.path[0] ?? "")

        if (messages[key] === undefined) {
            messages[key] = issue.message
        }
    }

    return messages as Partial<T> & Record<string, string>
}
