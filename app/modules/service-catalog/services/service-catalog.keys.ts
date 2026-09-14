export const serviceCatalogKeys = {
    all: ["service-catalog"] as const,
    services: () => [...serviceCatalogKeys.all, "services"] as const,
    categories: (serviceId: string) => [...serviceCatalogKeys.all, "categories", serviceId] as const,
}
