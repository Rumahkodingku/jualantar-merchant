import type { OutletStatus } from "~/modules/merchant-operations"

export type HomeOutletContext =
    | {
          type: "none"
      }
    | {
          type: "single"
          outletId: string
      }
    | {
          type: "all"
          outletIds: string[]
      }
    | {
          type: "selected"
          outletId: string
          outletIds: string[]
      }

export type RecentOrderStatus = "new" | "processing" | "completed"

export type TodayOrders = {
    new: number
    processing: number
    completed: number
}

export type BusinessSummary = {
    totalOrders: number
    sales: number
    productsSold: number
    rating: number
}

export type SalesPoint = {
    label: string
    value: number
}

export type RecentOrder = {
    id: string
    customerName: string
    itemCount: number
    total: number
    status: RecentOrderStatus
    createdAt: string
}

export type TopProduct = {
    id: string
    name: string
    sold: number
    price: number
    imageUrl: string | null
}

export type ActivityItem = {
    id: string
    type: string
    title: string
    description: string
    createdAt: string
}

export type OutletPerformanceItem = {
    outletId: string
    name: string
    status: OutletStatus
    orders: number
    sales: number
    imageUrl: string | null
}

export type HomeDashboardData = {
    todayOrders: TodayOrders
    summary: BusinessSummary
    sales7Days: SalesPoint[]
    recentOrders: RecentOrder[]
    topProducts: TopProduct[]
    activities: ActivityItem[]
}
