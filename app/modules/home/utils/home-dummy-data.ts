import type {
    ActivityItem,
    HomeDashboardData,
    HomeOutletContext,
    OutletPerformanceItem,
    RecentOrder,
    TopProduct,
} from "../types/home.types"

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

const AGGREGATE_DASHBOARD: HomeDashboardData = {
    todayOrders: { new: 8, processing: 5, completed: 21 },
    summary: { totalOrders: 34, sales: 1_286_500, productsSold: 87, rating: 4.8 },
    sales7Days: [
        { label: "Sen", value: 842_000 },
        { label: "Sel", value: 915_500 },
        { label: "Rab", value: 1_024_000 },
        { label: "Kam", value: 788_000 },
        { label: "Jum", value: 1_312_000 },
        { label: "Sab", value: 1_586_500 },
        { label: "Min", value: 1_286_500 },
    ],
    recentOrders: [
        {
            id: "ORD-1042",
            customerName: "Sinta Maharani",
            itemCount: 3,
            total: 68_500,
            status: "new",
            createdAt: "10 mnt lalu",
        },
        {
            id: "ORD-1041",
            customerName: "Budi Santoso",
            itemCount: 2,
            total: 45_000,
            status: "processing",
            createdAt: "25 mnt lalu",
        },
        {
            id: "ORD-1040",
            customerName: "Ayu Lestari",
            itemCount: 5,
            total: 112_000,
            status: "processing",
            createdAt: "1 jam lalu",
        },
        {
            id: "ORD-1039",
            customerName: "Rizky Pratama",
            itemCount: 1,
            total: 28_500,
            status: "completed",
            createdAt: "2 jam lalu",
        },
    ],
    topProducts: [
        { id: "p1", name: "Ayam Geprek Sambal Matah", sold: 32, price: 18_500, imageUrl: null },
        { id: "p2", name: "Paket Ayam + Nasi + Es Teh", sold: 27, price: 25_000, imageUrl: null },
        { id: "p3", name: "Mie Gacoan Level 4", sold: 19, price: 22_000, imageUrl: null },
    ],
    activities: [
        {
            id: "a1",
            type: "order",
            title: "Pesanan baru diterima",
            description: "ORD-1042 dari Sinta Maharani menunggu konfirmasi.",
            createdAt: "10 mnt lalu",
        },
        {
            id: "a2",
            type: "product",
            title: "Stok menipis",
            description: "Mie Gacoan Level 4 tersisa 5 porsi.",
            createdAt: "1 jam lalu",
        },
        {
            id: "a3",
            type: "finance",
            title: "Pencairan dana berhasil",
            description: "Rp 850.000 diteruskan ke rekening BCA •• 8821.",
            createdAt: "3 jam lalu",
        },
    ],
}

/** Deterministic seed so each outlet gets stable but distinct dummy numbers. */
function seedFrom(outletId: string): number {
    let hash = 0

    for (let i = 0; i < outletId.length; i += 1) {
        hash = (hash + outletId.charCodeAt(i) * (i + 1)) % 997
    }

    return hash / 997
}

function outletDashboard(outletId: string, outletName: string): HomeDashboardData {
    const seed = seedFrom(outletId)
    const scale = 0.35 + seed * 0.9
    const round = (value: number) => Math.max(1, Math.round(value * scale))

    return {
        todayOrders: {
            new: round(4),
            processing: round(3),
            completed: round(12),
        },
        summary: {
            totalOrders: round(19),
            sales: round(712_000),
            productsSold: round(48),
            rating: Math.min(5, Math.round((4.2 + seed * 0.7) * 10) / 10),
        },
        sales7Days: DAY_LABELS.map((label, index) => ({
            label,
            value: round(AGGREGATE_DASHBOARD.sales7Days[index]?.value ?? 500_000),
        })),
        recentOrders: AGGREGATE_DASHBOARD.recentOrders.map((order): RecentOrder => ({ ...order })),
        topProducts: AGGREGATE_DASHBOARD.topProducts.map((product): TopProduct => ({
            ...product,
            sold: round(product.sold),
        })),
        activities: AGGREGATE_DASHBOARD.activities.map((activity): ActivityItem => ({ ...activity })),
    }
}

export function getHomeDummyData(context: HomeOutletContext, outletName?: string): HomeDashboardData {
    if (context.type === "single" || context.type === "selected") {
        return outletDashboard(context.outletId, outletName ?? "")
    }

    return AGGREGATE_DASHBOARD
}

export function getOutletPerformanceDummy(
    outlets: { id: string; name: string; status: "active" | "inactive" }[]
): OutletPerformanceItem[] {
    return outlets.map((outlet) => {
        const seed = seedFrom(outlet.id)
        const orders = Math.max(1, Math.round(14 * (0.4 + seed)))

        return {
            outletId: outlet.id,
            name: outlet.name,
            status: outlet.status,
            orders,
            sales: orders * Math.round(24_000 + seed * 12_000),
            imageUrl: null,
        }
    })
}
