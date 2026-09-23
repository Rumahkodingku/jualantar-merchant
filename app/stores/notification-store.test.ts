import { beforeEach, describe, expect, it } from "vitest"

import { NOTIFICATION_STORAGE_KEY, useNotificationStore } from "./notification-store"

beforeEach(() => {
    window.localStorage.clear()
    useNotificationStore.setState({ orderUpdates: true, promotions: true })
})

describe("useNotificationStore", () => {
    it("defaults to all notification categories enabled", () => {
        const state = useNotificationStore.getState()

        expect(state.orderUpdates).toBe(true)
        expect(state.promotions).toBe(true)
    })

    it("updates preferences and persists them", () => {
        useNotificationStore.getState().setOrderUpdates(false)
        useNotificationStore.getState().setPromotions(false)

        expect(useNotificationStore.getState().orderUpdates).toBe(false)
        expect(useNotificationStore.getState().promotions).toBe(false)

        const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY)
        expect(raw).not.toBeNull()
        expect(JSON.parse(raw ?? "")).toEqual({
            state: { orderUpdates: false, promotions: false },
            version: 1,
        })
    })
})
