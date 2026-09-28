export function sortByDisplayOrder<T extends { display_order: number }>(items: T[]): T[] {
    return items.slice().sort((a, b) => a.display_order - b.display_order)
}
