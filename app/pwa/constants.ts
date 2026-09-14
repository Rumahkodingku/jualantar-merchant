export const SW_VERSION = "v1"

export const SHELL_CACHE = `jualantar-merchant-shell-${SW_VERSION}`
export const ASSET_CACHE = `jualantar-merchant-assets-${SW_VERSION}`
export const PAGE_CACHE = `jualantar-merchant-pages-${SW_VERSION}`

export const OFFLINE_URL = "/offline"

export const PRECACHE_PATHS = [
    OFFLINE_URL,
    "/manifest.webmanifest",
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/icons/icon-192x192-maskable.png",
    "/icons/icon-512x512-maskable.png",
]

export const CACHE_FIRST_PREFIXES = ["/assets/"]

export const PASSTHROUGH_PREFIXES = ["/api/"]
