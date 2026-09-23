import { z } from "zod"

import type { AuthUser, OutletAssignment } from "../types/auth.types"

export const outletUserRoleSchema = z.enum(["outlet_manager", "outlet_staff"])

/**
 * Raw `/auth/me` contract. `outlet_assignments` is contributed by the Merchant
 * module; a missing list is treated as "no outlet access" (never as full access).
 */
const rawAuthUserSchema = z.object({
    id: z.string(),
    email: z.string(),
    roles: z.array(z.string()).nullish(),
    permissions: z.array(z.string()).nullish(),
    outlet_assignments: z.array(z.unknown()).nullish(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
})

const rawOutletAssignmentSchema = z.object({
    outlet_id: z.string(),
    role: outletUserRoleSchema,
})

/**
 * Normalize outlet assignments fail-closed: entries whose `role` is not a known
 * `OutletUserRole` are dropped rather than silently treated as authorized.
 */
export function normalizeOutletAssignments(value: unknown): OutletAssignment[] {
    if (!Array.isArray(value)) {
        return []
    }

    const assignments: OutletAssignment[] = []

    for (const item of value) {
        const parsed = rawOutletAssignmentSchema.safeParse(item)

        if (parsed.success) {
            assignments.push({ outletId: parsed.data.outlet_id, role: parsed.data.role })
        }
    }

    return assignments
}

/**
 * Map the API user payload (snake_case, `outlet_assignments`) to the UI model
 * (camelCase `outletAssignments`). Throws when the required identity fields are
 * absent so a malformed session surfaces as an error instead of a half-user.
 */
export function normalizeAuthUser(raw: unknown): AuthUser {
    const parsed = rawAuthUserSchema.parse(raw)

    return {
        id: parsed.id,
        email: parsed.email,
        roles: parsed.roles ?? [],
        permissions: parsed.permissions ?? [],
        outletAssignments: normalizeOutletAssignments(parsed.outlet_assignments),
        created_at: parsed.created_at ?? null,
        updated_at: parsed.updated_at ?? null,
    }
}
