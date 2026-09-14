export const merchantRegistrationKeys = {
    all: ["merchant-registration"] as const,
    detail: () => [...merchantRegistrationKeys.all, "detail"] as const,
    review: () => [...merchantRegistrationKeys.all, "review"] as const,
}
