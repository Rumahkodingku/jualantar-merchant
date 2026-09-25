import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { catalogKeys } from "../catalog.keys"
import { catalogRepository } from "../catalog.repository"
import type { CategoryIndexParams } from "../../types/catalog.types"

export function useCategories(params: CategoryIndexParams = {}) {
    return useQuery({
        queryKey: catalogKeys.categoryList(params),
        queryFn: () => catalogRepository.categories.list(params),
        placeholderData: keepPreviousData,
    })
}
