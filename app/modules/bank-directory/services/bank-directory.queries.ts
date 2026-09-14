import { useQuery } from "@tanstack/react-query"

import { api } from "~/lib/api"

import type { Bank } from "../types/bank-directory.types"

export const bankDirectoryKeys = {
    all: ["bank-directory"] as const,
    list: (search?: string) => [...bankDirectoryKeys.all, "list", search ?? ""] as const,
}

export async function fetchBanks(search?: string): Promise<Bank[]> {
    const { data } = await api.get<{ data: Bank[] }>("/banks", {
        params: { search, per_page: 100 },
    })

    return data.data
}

export function useBanks(search?: string) {
    return useQuery({
        queryKey: bankDirectoryKeys.list(search),
        queryFn: () => fetchBanks(search),
        staleTime: 60 * 60_000,
    })
}
