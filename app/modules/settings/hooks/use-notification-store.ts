import { create } from "zustand"
import { persist } from "zustand/middleware"

export const NOTIFICATION_STORAGE_KEY = "jualantar-merchant.notifications"

interface NotificationState {
    orderUpdates: boolean
    promotions: boolean
    setOrderUpdates: (value: boolean) => void
    setPromotions: (value: boolean) => void
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            orderUpdates: true,
            promotions: true,
            setOrderUpdates: (orderUpdates) => set({ orderUpdates }),
            setPromotions: (promotions) => set({ promotions }),
        }),
        {
            name: NOTIFICATION_STORAGE_KEY,
            version: 1,
        }
    )
)
