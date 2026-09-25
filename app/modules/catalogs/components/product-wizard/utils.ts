export function draftKey(prefix: string): string {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
