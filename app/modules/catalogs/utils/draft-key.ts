/**
 * A short, collision-resistant id for a row the wizard owns locally.
 *
 * The wizard stages variants, modifier groups and modifiers before any of them
 * exist on the server, so they need an identity to be edited, duplicated,
 * reordered and deleted by. `crypto.randomUUID` is available in every browser
 * that supports the rest of this module; the first eight characters are enough
 * to keep ids readable while staying unique within one draft.
 */
export function draftKey(prefix: string): string {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
