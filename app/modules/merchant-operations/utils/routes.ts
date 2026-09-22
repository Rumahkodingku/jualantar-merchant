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
