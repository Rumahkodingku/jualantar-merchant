import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { createQueryClient } from "~/lib/query-client"

import { ThemeProvider } from "./theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(createQueryClient)

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
    )
}
