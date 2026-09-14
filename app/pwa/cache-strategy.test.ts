import { describe, expect, it } from "vitest"
import { decideFetchStrategy } from "./cache-strategy"

const SW_ORIGIN = "https://jualantar.test"

function decide(path: string, options: { method?: string; mode?: RequestMode } = {}) {
    return decideFetchStrategy({
        url: new URL(path, SW_ORIGIN),
        method: options.method ?? "GET",
        mode: options.mode ?? "cors",
        swOrigin: SW_ORIGIN,
    })
}

describe("decideFetchStrategy", () => {
    it("passes through non-GET requests", () => {
        expect(decide("/api/v1/orders", { method: "POST" })).toBe("passthrough")
    })

    it("passes through cross-origin requests", () => {
        expect(decide("https://cdn.example.com/app.js")).toBe("passthrough")
    })

    it("never caches React Router single-fetch loader data", () => {
        expect(decide("/app.data")).toBe("passthrough")
        expect(decide("/app.data", { mode: "navigate" })).toBe("passthrough")
    })

    it("passes through the lazy route discovery manifest", () => {
        expect(decide("/__manifest?paths=/app")).toBe("passthrough")
    })

    it("passes through API requests", () => {
        expect(decide("/api/v1/auth/login")).toBe("passthrough")
    })

    it("uses cache-first for hashed assets", () => {
        expect(decide("/assets/root-DHQFHdGV.css")).toBe("cache-first")
    })

    it("uses cache-first for precached shell paths", () => {
        expect(decide("/offline")).toBe("cache-first")
        expect(decide("/manifest.webmanifest")).toBe("cache-first")
        expect(decide("/favicon.ico")).toBe("cache-first")
    })

    it("uses network-first for document navigations", () => {
        expect(decide("/app", { mode: "navigate" })).toBe("network-first-page")
    })

    it("passes through unknown same-origin requests", () => {
        expect(decide("/robots.txt")).toBe("passthrough")
    })
})
