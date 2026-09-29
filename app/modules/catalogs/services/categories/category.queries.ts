import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { catalogKeys } from "../catalog.keys"
import * as categoryApi from "./category.api"
import type { CategoryIndexParams } from "../../types"

export function useCategories(params: CategoryIndexParams = {}) {
    return useQuery({
        queryKey: catalogKeys.categoryList(params),
        queryFn: () => categoryApi.fetchCategories(params),
        placeholderData: keepPreviousData,
    })
}
