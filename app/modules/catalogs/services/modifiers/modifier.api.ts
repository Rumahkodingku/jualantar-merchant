import { api } from "~/lib/api"

import {
    toModifierGroup,
    toProductModifier,
    type ProductModifierGroupWire,
    type ProductModifierWire,
} from "../catalog.mappers"
import type {
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    ProductModifier,
    ProductModifierGroup,
    ReorderItem,
} from "../../types"

const BASE = "/merchant/catalog/products"

function groupsBase(productId: string) {
    return `${BASE}/${productId}/modifier-groups`
}

function modifiersBase(productId: string, groupId: string) {
    return `${groupsBase(productId)}/${groupId}/modifiers`
}

function toGroupReorderRequest(items: ReorderItem[]) {
    return { items: items.map((item) => ({ group_id: item.id, display_order: item.display_order })) }
}

function toModifierReorderRequest(items: ReorderItem[]) {
    return { items: items.map((item) => ({ modifier_id: item.id, display_order: item.display_order })) }
}

export async function fetchProductModifierGroups(productId: string): Promise<ProductModifierGroup[]> {
    const { data } = await api.get<{ data: ProductModifierGroupWire[] }>(groupsBase(productId))

    return data.data.map(toModifierGroup)
}

export async function createProductModifierGroup(
    productId: string,
    input: ModifierGroupCreateInput
): Promise<ProductModifierGroup> {
    const { data } = await api.post<{ data: ProductModifierGroupWire }>(groupsBase(productId), input)

    return toModifierGroup(data.data)
}

export async function updateProductModifierGroup(
    productId: string,
    groupId: string,
    input: ModifierGroupUpdateInput
): Promise<ProductModifierGroup> {
    const { data } = await api.patch<{ data: ProductModifierGroupWire }>(`${groupsBase(productId)}/${groupId}`, input)

    return toModifierGroup(data.data)
}

export async function deleteProductModifierGroup(productId: string, groupId: string): Promise<void> {
    await api.delete(`${groupsBase(productId)}/${groupId}`)
}

export async function activateProductModifierGroup(productId: string, groupId: string): Promise<ProductModifierGroup> {
    const { data } = await api.post<{ data: ProductModifierGroupWire }>(`${groupsBase(productId)}/${groupId}/activate`)

    return toModifierGroup(data.data)
}

export async function deactivateProductModifierGroup(
    productId: string,
    groupId: string
): Promise<ProductModifierGroup> {
    const { data } = await api.post<{ data: ProductModifierGroupWire }>(
        `${groupsBase(productId)}/${groupId}/deactivate`
    )

    return toModifierGroup(data.data)
}

export async function reorderProductModifierGroups(productId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${groupsBase(productId)}/order`, toGroupReorderRequest(items))
}

export async function fetchProductModifiers(productId: string, groupId: string): Promise<ProductModifier[]> {
    const { data } = await api.get<{ data: ProductModifierWire[] }>(modifiersBase(productId, groupId))

    return data.data.map(toProductModifier)
}

export async function createProductModifier(
    productId: string,
    groupId: string,
    input: ModifierCreateInput
): Promise<ProductModifier> {
    const { data } = await api.post<{ data: ProductModifierWire }>(modifiersBase(productId, groupId), input)

    return toProductModifier(data.data)
}

export async function updateProductModifier(
    productId: string,
    groupId: string,
    modifierId: string,
    input: ModifierUpdateInput
): Promise<ProductModifier> {
    const { data } = await api.patch<{ data: ProductModifierWire }>(
        `${modifiersBase(productId, groupId)}/${modifierId}`,
        input
    )

    return toProductModifier(data.data)
}

export async function deleteProductModifier(productId: string, groupId: string, modifierId: string): Promise<void> {
    await api.delete(`${modifiersBase(productId, groupId)}/${modifierId}`)
}

export async function activateProductModifier(
    productId: string,
    groupId: string,
    modifierId: string
): Promise<ProductModifier> {
    const { data } = await api.post<{ data: ProductModifierWire }>(
        `${modifiersBase(productId, groupId)}/${modifierId}/activate`
    )

    return toProductModifier(data.data)
}

export async function deactivateProductModifier(
    productId: string,
    groupId: string,
    modifierId: string
): Promise<ProductModifier> {
    const { data } = await api.post<{ data: ProductModifierWire }>(
        `${modifiersBase(productId, groupId)}/${modifierId}/deactivate`
    )

    return toProductModifier(data.data)
}

export async function reorderProductModifiers(productId: string, groupId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${modifiersBase(productId, groupId)}/order`, toModifierReorderRequest(items))
}
