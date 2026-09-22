export const SETTINGS_BASE = "/settings"

export const SETTINGS_PATHS = {
    home: SETTINGS_BASE,
    account: `${SETTINGS_BASE}/account`,
    appearance: `${SETTINGS_BASE}/appearance`,
    profile: `${SETTINGS_BASE}/profile`,
    status: `${SETTINGS_BASE}/status`,
    outlets: `${SETTINGS_BASE}/outlets`,
    outletNew: `${SETTINGS_BASE}/outlets/new`,
} as const

export function outletPath(outletId: string): string {
    return `${SETTINGS_PATHS.outlets}/${outletId}`
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

export type OutletShortcutKey = "hours" | "service-area" | "employees" | "availability"

export const OUTLET_SHORTCUTS: Record<OutletShortcutKey, { title: string; description: string; placeholder: string }> =
    {
        hours: {
            title: "Jam Operasional",
            description: "Jam operasional diatur per outlet.",
            placeholder: "Pilih outlet untuk mengatur jam operasional",
        },
        "service-area": {
            title: "Area Layanan",
            description: "Area layanan diatur per outlet.",
            placeholder: "Pilih outlet untuk mengatur area layanan",
        },
        employees: {
            title: "Karyawan",
            description: "Karyawan ditugaskan pada outlet tertentu.",
            placeholder: "Pilih outlet untuk mengelola karyawan",
        },
        availability: {
            title: "Status Operasional",
            description: "Status operasional dihitung per outlet.",
            placeholder: "Pilih outlet untuk melihat status operasional",
        },
    }

export function outletShortcutPath(outletId: string, key: OutletShortcutKey): string {
    switch (key) {
        case "hours":
            return outletHoursPath(outletId)
        case "service-area":
            return outletServiceAreaPath(outletId)
        case "employees":
            return outletEmployeesPath(outletId)
        case "availability":
            return outletAvailabilityPath(outletId)
    }
}
