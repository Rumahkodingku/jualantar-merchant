/// <reference lib="webworker" />

import { decideFetchStrategy } from "./cache-strategy"
import { ASSET_CACHE, OFFLINE_URL, PAGE_CACHE, PRECACHE_PATHS, SHELL_CACHE } from "./constants"

declare const self: ServiceWorkerGlobalScope

const ALL_CACHES = [SHELL_CACHE, ASSET_CACHE, PAGE_CACHE]

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(SHELL_CACHE)
            await cache.addAll(PRECACHE_PATHS)
        })()
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys()
            await Promise.all(keys.filter((key) => !ALL_CACHES.includes(key)).map((key) => caches.delete(key)))
            await self.clients.claim()
        })()
    )
})

self.addEventListener("message", (event) => {
    if ((event.data as { type?: string } | null)?.type === "SKIP_WAITING") {
        void self.skipWaiting()
    }
})

async function cacheFirst(request: Request): Promise<Response> {
    const assetCache = await caches.open(ASSET_CACHE)
    const cachedAsset = await assetCache.match(request)
    if (cachedAsset) {
        return cachedAsset
    }

    const shellCache = await caches.open(SHELL_CACHE)
    const cachedShell = await shellCache.match(request)
    if (cachedShell) {
        return cachedShell
    }

    const response = await fetch(request)
    if (response.ok) {
        await assetCache.put(request, response.clone())
    }
    return response
}

async function networkFirstPage(request: Request): Promise<Response> {
    const cache = await caches.open(PAGE_CACHE)

    try {
        const response = await fetch(request)
        if (response.ok) {
            await cache.put(request, response.clone())
        }
        return response
    } catch {
        const cached = await cache.match(request)
        if (cached) {
            return cached
        }

        const shellCache = await caches.open(SHELL_CACHE)
        const offline = await shellCache.match(OFFLINE_URL)
        if (offline) {
            return offline
        }

        return new Response("Offline", { status: 503, statusText: "Offline" })
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)
    const strategy = decideFetchStrategy({
        url,
        method: request.method,
        mode: request.mode,
        swOrigin: self.location.origin,
    })

    if (strategy === "cache-first") {
        event.respondWith(cacheFirst(request))
        return
    }

    if (strategy === "network-first-page") {
        event.respondWith(networkFirstPage(request))
    }
})
