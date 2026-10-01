import { describe, expect, it } from "vitest"

import { catalogKeys } from "../catalog.keys"

describe("catalogKeys outlet catalog", () => {
    it("embeds the outlet id so outlet A and B never share cache", () => {
        expect(catalogKeys.outletProductList("A", {})).not.toEqual(catalogKeys.outletProductList("B", {}))
        expect(catalogKeys.outletProduct("A", "p1")).not.toEqual(catalogKeys.outletProduct("B", "p1"))
        expect(catalogKeys.outletCatalogFor("A")).not.toEqual(catalogKeys.outletCatalogFor("B"))
    })

    it("keeps list and detail of the same outlet under the outlet prefix", () => {
        const prefix = catalogKeys.outletCatalogFor("A")

        expect(catalogKeys.outletProductList("A", {}).slice(0, prefix.length)).toEqual([...prefix])
        expect(catalogKeys.outletProduct("A", "p1").slice(0, prefix.length)).toEqual([...prefix])
    })

    it("does not let outlet A's prefix match outlet B's keys", () => {
        const prefixA = catalogKeys.outletCatalogFor("A")
        const keyB = catalogKeys.outletProductList("B", {})

        expect(keyB.slice(0, prefixA.length)).not.toEqual([...prefixA])
    })
})
