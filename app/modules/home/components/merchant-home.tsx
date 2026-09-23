import { PauseCircleIcon } from "lucide-react"
import { ErrorState } from "~/components/error-state"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { getApiErrorMessage } from "~/lib/api-form"
import { merchantStatusPresentation, useOperationsSummary } from "~/modules/merchant-operations"
import type { MerchantRegistration } from "~/modules/merchant-registration"
import { useHomeContext } from "../hooks/use-home-context"
import type { HomeOutletContext } from "../types/home.types"
import { getHomeDummyData, getOutletPerformanceDummy } from "../utils/home-dummy-data"
import { AcademyBanner } from "./academy-banner"
import { HomeBusinessSummary } from "./business-summary"
import { AllOutletsCard, OutletContextCard } from "./outlet-context-card"
import { HomeHeader } from "./home-header"
import { HomeSkeleton } from "./home-skeleton"
import { MainMenuGrid } from "./main-menu-grid"
import { OperationalCta } from "./operational-cta"
import { OutletPerformanceList } from "./outlet-performance-list"
import { OutletSelector } from "./outlet-selector"
import { RecentActivities } from "./recent-activities"
import { RecentOrders } from "./recent-orders"
import { HomeSalesChart } from "./sales-chart"
import { SupportCard } from "./support-card"
import { TodayOrdersSummary } from "./today-orders-summary"
import { TopProducts } from "./top-products"
import { ZeroOutletState } from "./zero-outlet-state"

function SuspendedBanner() {
    return (
        <Alert variant="destructive">
            <PauseCircleIcon aria-hidden="true" />
            <AlertTitle>Akun merchant dijeda</AlertTitle>
            <AlertDescription>
                Sementara ini merchant Anda tidak dapat menerima pesanan. Hubungi tim JualAntar untuk informasi lebih
                lanjut.
            </AlertDescription>
        </Alert>
    )
}

const WELCOME_DESCRIPTION = "Kelola usahamu dengan lebih mudah di JualAntar."

export function MerchantHome({ registration }: { registration: MerchantRegistration }) {
    const summary = useOperationsSummary()
    const home = useHomeContext()

    const summaryStatus = summary.data?.merchant.status
    const presentation = summaryStatus === undefined ? null : merchantStatusPresentation(summaryStatus)
    const businessName = summary.data?.merchant.business_name ?? registration.business_name ?? "Merchant"
    const suspended = registration.merchant_status === "suspended" || summaryStatus === "suspended"
    const merchantStatus =
        presentation === null
            ? null
            : { label: presentation.label, tone: presentation.tone as "positive" | "neutral" | "negative" }

    if (summary.isPending || home.isPending) {
        return <HomeSkeleton />
    }

    if (summary.isError && home.isError) {
        return (
            <ErrorState
                title="Gagal memuat beranda"
                description={getApiErrorMessage(summary.error ?? home.error)}
                onRetry={() => {
                    void summary.refetch()
                    home.refetch()
                }}
            />
        )
    }

    if (home.isError) {
        return (
            <>
                {suspended ? <SuspendedBanner /> : null}
                <HomeHeader
                    businessName={businessName}
                    description={WELCOME_DESCRIPTION}
                    merchantStatus={merchantStatus}
                />
                <ErrorState
                    title="Gagal memuat outlet"
                    description={getApiErrorMessage(home.error)}
                    onRetry={home.refetch}
                />
            </>
        )
    }

    return (
        <>
            {suspended ? <SuspendedBanner /> : null}
            <HomeDashboard
                context={home.context}
                businessName={businessName}
                merchantStatus={merchantStatus}
                suspended={suspended}
                home={home}
            />
        </>
    )
}

function HomeDashboard({
    context,
    businessName,
    merchantStatus,
    suspended,
    home,
}: {
    context: HomeOutletContext
    businessName: string
    merchantStatus: { label: string; tone: "positive" | "neutral" | "negative" } | null
    suspended: boolean
    home: ReturnType<typeof useHomeContext>
}) {
    if (context.type === "none") {
        return (
            <>
                <HomeHeader
                    businessName={businessName}
                    description={WELCOME_DESCRIPTION}
                    merchantStatus={merchantStatus}
                />
                <ZeroOutletState />
            </>
        )
    }

    if (context.type === "all") {
        const dashboard = getHomeDummyData(context)
        const performance = getOutletPerformanceDummy(
            home.outlets.map((outlet) => ({ id: outlet.id, name: outlet.name, status: outlet.status }))
        )

        return (
            <>
                <HomeHeader
                    businessName={businessName}
                    description={WELCOME_DESCRIPTION}
                    merchantStatus={merchantStatus}
                />
                <OutletSelector
                    outlets={home.outlets}
                    outletTotal={home.outletTotal}
                    selectedId={null}
                    hasMore={home.hasMoreOutlets}
                    isPending={false}
                    isError={false}
                    error={null}
                    onRetry={home.refetch}
                    onSelect={home.selectOutlet}
                />
                <AllOutletsCard total={home.outletTotal} />
                <TodayOrdersSummary data={dashboard.todayOrders} />
                <HomeBusinessSummary
                    data={dashboard.summary}
                    caption={`Gabungan ${home.outletTotal} outlet hari ini.`}
                />
                <HomeSalesChart data={dashboard.sales7Days} />
                <OutletPerformanceList items={performance} onSelect={(outletId) => home.selectOutlet(outletId)} />
                <MainMenuGrid outletId={null} />
                <RecentOrders orders={dashboard.recentOrders} />
                <TopProducts products={dashboard.topProducts} />
                <RecentActivities activities={dashboard.activities} />
                <AcademyBanner />
                <SupportCard />
            </>
        )
    }

    const outlet = home.selectedOutlet

    if (outlet === null) {
        return (
            <ErrorState
                title="Outlet tidak ditemukan"
                description="Outlet yang dipilih tidak tersedia. Kembali ke ringkasan semua outlet."
                retryLabel="Tampilkan semua outlet"
                onRetry={() => home.selectOutlet(null)}
            />
        )
    }

    const dashboard = getHomeDummyData(context, outlet.name)

    return (
        <>
            <HomeHeader businessName={businessName} description={WELCOME_DESCRIPTION} merchantStatus={merchantStatus} />
            {context.type === "selected" ? (
                <OutletSelector
                    outlets={home.outlets}
                    outletTotal={home.outletTotal}
                    selectedId={outlet.id}
                    hasMore={home.hasMoreOutlets}
                    isPending={false}
                    isError={false}
                    error={null}
                    onRetry={home.refetch}
                    onSelect={home.selectOutlet}
                />
            ) : null}
            <OutletContextCard outlet={outlet} />
            <OperationalCta outlet={outlet} suspended={suspended} />
            <TodayOrdersSummary data={dashboard.todayOrders} />
            <HomeBusinessSummary data={dashboard.summary} caption={`Data ${outlet.name} hari ini.`} />
            <HomeSalesChart data={dashboard.sales7Days} />
            <MainMenuGrid outletId={outlet.id} />
            <RecentOrders orders={dashboard.recentOrders} />
            <TopProducts products={dashboard.topProducts} />
            <RecentActivities activities={dashboard.activities} />
            <AcademyBanner />
            <SupportCard />
        </>
    )
}
