export const BUNDLE_STATUS_LABEL = {
    pending: "Menunggu",
    running: "Diproses…",
    success: "Berhasil",
    skipped: "Tidak ada",
    failed: "Gagal",
} as const

/**
 * The parts of a product, walked one at a time. Both wizards walk the same
 * route through a product, so the ids are shared and only the labels and the
 * final action differ.
 */
export const CREATE_STEPS = [
    { id: "info", label: "Informasi" },
    { id: "price", label: "Harga / Variant" },
    { id: "customization", label: "Customization" },
    { id: "media", label: "Media" },
    { id: "outlet", label: "Outlet" },
    { id: "review", label: "Review" },
] as const

/** Kept as the default so the create wizard reads the same as before. */
export const STEPS = CREATE_STEPS

export type StepId = (typeof CREATE_STEPS)[number]["id"]

export type WizardSteps = ReadonlyArray<{ id: StepId; label: string }>
