export const BUNDLE_STATUS_LABEL = {
    pending: "Menunggu",
    running: "Diproses…",
    success: "Berhasil",
    skipped: "Tidak ada",
    failed: "Gagal",
} as const

export const STEPS = [
    { id: "info", label: "Informasi" },
    { id: "price", label: "Harga / Variant" },
    { id: "customization", label: "Customization" },
    { id: "media", label: "Media" },
    { id: "outlet", label: "Outlet" },
    { id: "review", label: "Review" },
] as const

export type StepId = (typeof STEPS)[number]["id"]
