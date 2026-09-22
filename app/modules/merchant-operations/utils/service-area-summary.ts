import { formatDecimal } from "./format"
import type { OperationalOutlet, ServiceArea } from "../types/merchant-operations.types"

const LEVEL_LABEL: Record<"province" | "regency" | "district" | "village", string> = {
    province: "Provinsi",
    regency: "Kabupaten/Kota",
    district: "Kecamatan",
    village: "Desa/Kelurahan",
}

/**
 * P0 anchors a non-radius service area to the outlet's own region, so the label
 * always comes from the outlet geography rather than a separate lookup.
 */
function regionSummary(
    type: "province" | "regency" | "district" | "village",
    outlet: OperationalOutlet | null | undefined
): string {
    const label = LEVEL_LABEL[type]
    const name = outlet?.geography?.[type] ?? null

    return name === null ? label : `${label} ${name}`
}

export function outletServiceAreaSummary(outlet: OperationalOutlet | null | undefined): string {
    if (outlet === null || outlet === undefined) {
        return "Belum diatur"
    }

    if (outlet.service_area_type === "radius") {
        return `Radius ${formatDecimal(outlet.service_radius_km)} km`
    }

    return regionSummary(outlet.service_area_type, outlet)
}

export function serviceAreaSummary(
    area: ServiceArea | null | undefined,
    outlet: OperationalOutlet | null | undefined
): string {
    if (area === null || area === undefined) {
        return outletServiceAreaSummary(outlet)
    }

    if (area.type === "radius") {
        return `Radius ${formatDecimal(area.radius_km)} km`
    }

    return regionSummary(area.type, outlet)
}

export function serviceAreaTypeLabel(type: ServiceArea["type"]): string {
    if (type === "radius") {
        return "Radius (km)"
    }

    return LEVEL_LABEL[type]
}

export type RegionLevel = "province" | "regency" | "district" | "village"

export const REGION_LEVELS: RegionLevel[] = ["province", "regency", "district", "village"]

export function regionLevelLabel(level: RegionLevel): string {
    return LEVEL_LABEL[level]
}

export function outletRegionId(outlet: OperationalOutlet, level: RegionLevel): number {
    return outlet[`${level}_id`]
}

export function outletRegionName(outlet: OperationalOutlet, level: RegionLevel): string | null {
    return outlet.geography?.[level] ?? null
}
