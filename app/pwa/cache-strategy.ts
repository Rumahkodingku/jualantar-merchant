import { CACHE_FIRST_PREFIXES, PASSTHROUGH_PREFIXES, PRECACHE_PATHS } from "./constants"

export type FetchStrategy = "cache-first" | "network-first-page" | "passthrough"

export interface FetchStrategyInput {
    url: URL
    method: string
    mode: RequestMode
    swOrigin: string
}

export function decideFetchStrategy({ url, method, mode, swOrigin }: FetchStrategyInput): FetchStrategy {
    if (method !== "GET") {
        return "passthrough"
    }

    if (url.origin !== swOrigin) {
        return "passthrough"
    }

    // React Router single-fetch loader data. Caching this breaks post-action revalidation.
    if (url.pathname.endsWith(".data")) {
        return "passthrough"
    }

    // React Router lazy route discovery manifest.
    if (url.pathname === "/__manifest") {
        return "passthrough"
    }

    if (PASSTHROUGH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
        return "passthrough"
    }

    if (CACHE_FIRST_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
        return "cache-first"
    }

    if (PRECACHE_PATHS.includes(url.pathname)) {
        return "cache-first"
    }

    if (mode === "navigate") {
        return "network-first-page"
    }

    return "passthrough"
}
