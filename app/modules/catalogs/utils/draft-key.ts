const HEX = "0123456789abcdef"

/**
 * Eight hex characters of randomness, i.e. 32 bits.
 *
 * `crypto.getRandomValues` rather than `crypto.randomUUID`, deliberately. The
 * latter is a secure-context-only API, so it does not exist at all on a page
 * served over plain HTTP — which is exactly what the dev server is when it is
 * reached at a LAN address such as `http://192.168.x.x:5173`, the way it is
 * opened to reach the app from a phone. `getRandomValues` is available in every
 * context, and nothing is given up by using it: the result is truncated to eight
 * characters either way, so a v4 UUID would contribute no more entropy than the
 * four random bytes this reads.
 */
function randomId(): string {
    const bytes = new Uint8Array(4)

    crypto.getRandomValues(bytes)

    return Array.from(bytes, (byte) => HEX[byte >> 4] + HEX[byte & 0x0f]).join("")
}

/**
 * A short, collision-resistant id for a row the wizard owns locally.
 *
 * The wizard stages variants, modifier groups, modifiers and photos before the
 * server has heard of them, so they need an identity to be edited, duplicated,
 * reordered and deleted by. These keys are local to one form: they are React keys
 * and dnd-kit ids, never sent anywhere and never compared against a server id,
 * so a collision would have to happen between two rows of the same unsaved form.
 * Thirty-two bits makes that vanishingly unlikely at the size a form reaches —
 * a birthday collision needs on the order of 77 000 rows, and a product holds
 * ten.
 *
 * The prefix is kept for the sake of whoever is reading: these keys show up in
 * React DevTools and in a dnd-kit event payload, and `grp-1f3a9c02` says which
 * of the three kinds of row is involved where a bare `1f3a9c02` does not. It is
 * never rendered to the merchant and never sent to the API.
 */
export function draftKey(prefix: string): string {
    return `${prefix}-${randomId()}`
}
