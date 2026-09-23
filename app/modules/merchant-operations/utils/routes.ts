/**
 * Kontrak URL untuk halaman merchant-operations.
 *
 * Halaman-halaman ini dirender di bawah namespace `/settings` yang dimiliki
 * oleh `modules/settings` (sumber tunggal: `SETTINGS_PATHS`). Konstanta base
 * di bawah diduplikasi secara sengaja agar arah dependensi tetap satu arah
 * (`settings` → `merchant-operations`) dan tidak sirkular.
 */
const OUTLETS_BASE = "/settings/outlets"

/** Kembalian ke beranda settings (dipakai sebagai `backTo`). */
export const SETTINGS_HOME_PATH = "/settings"

export const OUTLETS_PATHS = {
    home: OUTLETS_BASE,
    new: `${OUTLETS_BASE}/new`,
} as const

export function outletPath(outletId: string): string {
    return `${OUTLETS_BASE}/${outletId}`
}

export function outletEditPath(outletId: string): string {
    return `${outletPath(outletId)}/edit`
}

export function outletHoursPath(outletId: string): string {
    return `${outletPath(outletId)}/hours`
}

export function outletServiceAreaPath(outletId: string): string {
    return `${outletPath(outletId)}/service-area`
}

export function outletEmployeesPath(outletId: string): string {
    return `${outletPath(outletId)}/employees`
}

export function outletAvailabilityPath(outletId: string): string {
    return `${outletPath(outletId)}/availability`
}
