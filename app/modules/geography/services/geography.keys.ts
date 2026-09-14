export const geographyKeys = {
    all: ["geography"] as const,
    provinces: (search?: string) => [...geographyKeys.all, "provinces", search ?? ""] as const,
    regencies: (provinceId: number, search?: string) =>
        [...geographyKeys.all, "regencies", provinceId, search ?? ""] as const,
    districts: (regencyId: number, search?: string) =>
        [...geographyKeys.all, "districts", regencyId, search ?? ""] as const,
    villages: (districtId: number, search?: string) =>
        [...geographyKeys.all, "villages", districtId, search ?? ""] as const,
}
