import { PageHeader } from "~/components/page-header"

import { CatalogTabs } from "./common/catalog-tabs"

export function CatalogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <section className="mb-4">
                <PageHeader title="Katalog" description="Kelola dan kustomisasi katalog anda" />
            </section>

            <section>
                <CatalogTabs />
            </section>

            {children}
        </div>
    )
}
