export const SETTINGS_BASE = "/settings"

export const SETTINGS_PATHS = {
    home: SETTINGS_BASE,
    account: `${SETTINGS_BASE}/account`,
    appearance: `${SETTINGS_BASE}/appearance`,
    notifications: `${SETTINGS_BASE}/notifications`,
    language: `${SETTINGS_BASE}/language`,
    profile: `${SETTINGS_BASE}/profile`,
    status: `${SETTINGS_BASE}/status`,
    outlets: `${SETTINGS_BASE}/outlets`,
    outletNew: `${SETTINGS_BASE}/outlets/new`,
    payout: `${SETTINGS_BASE}/payout`,
    documents: `${SETTINGS_BASE}/documents`,
    password: `${SETTINGS_BASE}/password`,
    help: `${SETTINGS_BASE}/help`,
    about: `${SETTINGS_BASE}/about`,
} as const
