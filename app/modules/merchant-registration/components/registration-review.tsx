import { ChevronDownIcon, CircleAlertIcon, FileTextIcon, ImageIcon, InfoIcon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Text } from "~/components/ui/text"
import { useRegistrationContext } from "./registration-context"
import { documentTypeLabel } from "../schemas/document.schema"
import { isStepComplete, REGISTRATION_STEPS, type StepId } from "../utils/steps"
import type { DayKey, MerchantRegistration, OperatingHours } from "../types/merchant-registration.types"

type SectionStatus = "complete" | "incomplete" | "optional"

const DAY_ORDER: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const DAY_SHORT: Record<DayKey, string> = {
    monday: "Sen",
    tuesday: "Sel",
    wednesday: "Rab",
    thursday: "Kam",
    friday: "Jum",
    saturday: "Sab",
    sunday: "Min",
}

function stepMeta(id: StepId) {
    return REGISTRATION_STEPS.find((step) => step.id === id)
}

function sectionStatus(id: StepId, registration: MerchantRegistration): SectionStatus {
    const step = stepMeta(id)

    if (step === undefined) {
        return "incomplete"
    }

    return isStepComplete(step, registration) ? "complete" : "incomplete"
}

function formatTime(value: string): string {
    return value.replace(":", ".")
}

type HoursGroup = { start: number; end: number; open: string; close: string }

function groupHours(hours: OperatingHours): HoursGroup[] {
    const groups: HoursGroup[] = []

    DAY_ORDER.forEach((day, index) => {
        const slot = hours[day]?.[0]

        if (slot === undefined) {
            return
        }

        const last = groups[groups.length - 1]

        if (last !== undefined && last.end === index - 1 && last.open === slot.open && last.close === slot.close) {
            last.end = index
        } else {
            groups.push({ start: index, end: index, open: slot.open, close: slot.close })
        }
    })

    return groups
}

function operatingHoursSummary(hours: OperatingHours | null): string {
    if (hours === null) {
        return "Belum diatur"
    }

    const groups = groupHours(hours)

    if (groups.length === 0) {
        return "Belum diatur"
    }

    const only = groups[0]

    if (groups.length === 1 && only.start === 0 && only.end === 6) {
        return `Setiap hari ${formatTime(only.open)}–${formatTime(only.close)}`
    }

    return groups
        .map((group) => {
            const start = DAY_SHORT[DAY_ORDER[group.start]]
            const end = DAY_SHORT[DAY_ORDER[group.end]]
            const label = group.start === group.end ? start : `${start}–${end}`

            return `${label} ${formatTime(group.open)}–${formatTime(group.close)}`
        })
        .join(", ")
}

function serviceAreaLabel(
    type: MerchantRegistration["outlets"][number]["service_area_type"],
    radius: number | null
): string {
    return type === "radius" ? `Radius ${radius ?? "-"} km` : `Area ${type}`
}

function StatusBadge({ status }: { status: SectionStatus }) {
    if (status === "complete") {
        return (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                Lengkap
            </Badge>
        )
    }

    if (status === "incomplete") {
        return (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
                Perlu dilengkapi
            </Badge>
        )
    }

    return <Badge variant="outline">Opsional</Badge>
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium wrap-break-word">{value ?? "-"}</span>
        </div>
    )
}

function ReviewCollapsible({
    title,
    stepId,
    status,
    hasData,
    children,
}: {
    title: string
    stepId: StepId
    status: SectionStatus
    hasData: boolean
    children: React.ReactNode
}) {
    const { navigation } = useRegistrationContext()
    const description = stepMeta(stepId)?.description
    const incomplete = status === "incomplete"
    const actionLabel = incomplete ? "Lengkapi data" : status === "optional" && !hasData ? "Tambah data" : "Ubah data"

    return (
        <section aria-label={title}>
            <Collapsible defaultOpen className="overflow-hidden rounded-xl border bg-card">
                <CollapsibleTrigger
                    type="button"
                    className="group flex w-full items-center gap-2 p-4 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
                    <StatusBadge status={status} />
                    <ChevronDownIcon
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="border-t">
                        {incomplete && hasData ? (
                            <div className="flex items-start gap-2 border-b bg-amber-500/5 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
                                <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                                <span>Bagian ini belum lengkap. Periksa kembali datanya.</span>
                            </div>
                        ) : null}

                        {!hasData && incomplete ? (
                            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                                <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <CircleAlertIcon className="size-4" aria-hidden="true" />
                                </span>
                                <Text variant="sm" weight="medium">
                                    Belum diisi
                                </Text>
                                {description !== undefined ? (
                                    <Text variant="xs" className="text-muted-foreground">
                                        {description}
                                    </Text>
                                ) : null}
                            </div>
                        ) : !hasData && status === "optional" ? (
                            <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
                                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <InfoIcon className="size-4" aria-hidden="true" />
                                </span>
                                <Text variant="sm" weight="medium">
                                    Belum ada dokumen
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    Bagian ini opsional, Anda bisa menambahkannya nanti.
                                </Text>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y">{children}</div>
                        )}

                        <div className="border-t px-4 py-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => navigation.goToStep(stepId)}
                            >
                                {actionLabel}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    )
}

export function RegistrationReview({ registration }: { registration: MerchantRegistration }) {
    const hasBusiness = registration.business_name !== null && registration.business_name !== ""

    return (
        <div className="flex flex-col gap-2">
            <ReviewCollapsible
                title="Data usaha"
                stepId="business"
                status={sectionStatus("business", registration)}
                hasData={hasBusiness}
            >
                <ReviewRow label="Nama usaha" value={registration.business_name} />
                <ReviewRow
                    label="Jenis usaha"
                    value={
                        registration.type === "company"
                            ? "Badan usaha"
                            : registration.type === "individual"
                              ? "Perorangan"
                              : "-"
                    }
                />
                <ReviewRow label="Deskripsi" value={registration.description} />
            </ReviewCollapsible>

            <ReviewCollapsible
                title="Identitas pemilik"
                stepId="identity"
                status={sectionStatus("identity", registration)}
                hasData={registration.identity !== null}
            >
                {registration.identity !== null ? (
                    <>
                        <ReviewRow label="Jenis identitas" value={registration.identity.id_type.toUpperCase()} />
                        <ReviewRow label="Nomor identitas" value={registration.identity.id_number} />
                        <ReviewRow label="Nama lengkap" value={registration.identity.full_name} />
                        <ReviewRow label="Tanggal lahir" value={registration.identity.birth_date} />
                    </>
                ) : null}
            </ReviewCollapsible>

            {registration.type === "company" ? (
                <ReviewCollapsible
                    title="Badan usaha"
                    stepId="legal-entity"
                    status={sectionStatus("legal-entity", registration)}
                    hasData={registration.legal_entity !== null}
                >
                    {registration.legal_entity !== null ? (
                        <>
                            <ReviewRow label="Bentuk" value={registration.legal_entity.entity_type.toUpperCase()} />
                            <ReviewRow label="Nama" value={registration.legal_entity.name} />
                            <ReviewRow label="NIB" value={registration.legal_entity.nib} />
                            <ReviewRow label="NPWP" value={registration.legal_entity.npwp} />
                            <ReviewRow label="Alamat" value={registration.legal_entity.address} />
                            <ReviewRow label="Wilayah" value={registration.legal_entity.geography?.village} />
                        </>
                    ) : null}
                </ReviewCollapsible>
            ) : null}

            <ReviewCollapsible
                title="Layanan"
                stepId="service"
                status={sectionStatus("service", registration)}
                hasData={registration.service !== null}
            >
                {registration.service !== null ? <ReviewRow label="Layanan" value={registration.service.name} /> : null}
            </ReviewCollapsible>

            <ReviewCollapsible
                title="Kategori"
                stepId="categories"
                status={sectionStatus("categories", registration)}
                hasData={registration.categories.length > 0}
            >
                {registration.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1 px-4 py-3">
                        {registration.categories.map((category) => (
                            <Badge key={category.id} variant="secondary">
                                {category.name ?? category.category_id}
                            </Badge>
                        ))}
                    </div>
                ) : null}
            </ReviewCollapsible>

            <ReviewCollapsible
                title="Outlet & lokasi"
                stepId="outlets"
                status={sectionStatus("outlets", registration)}
                hasData={registration.outlets.length > 0}
            >
                {registration.outlets.length > 0
                    ? registration.outlets.map((outlet) => (
                          <div key={outlet.id} className="flex flex-col gap-2 p-4">
                              <div className="flex items-center justify-between gap-2">
                                  <Text as="h3" variant="sm" weight="semibold" truncate className="min-w-0">
                                      {outlet.name}
                                  </Text>
                                  <Badge
                                      variant="secondary"
                                      className={
                                          outlet.status === "active"
                                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                              : undefined
                                      }
                                  >
                                      {outlet.status === "active" ? "Aktif" : "Nonaktif"}
                                  </Badge>
                              </div>
                              <div className="flex flex-col divide-y rounded-lg border">
                                  <ReviewRow
                                      label="Alamat"
                                      value={`${outlet.address}${outlet.geography?.village ? `, ${outlet.geography.village}` : ""}`}
                                  />
                                  <ReviewRow
                                      label="Area layanan"
                                      value={serviceAreaLabel(outlet.service_area_type, outlet.service_radius_km)}
                                  />
                                  {outlet.phone !== null ? <ReviewRow label="Telepon" value={outlet.phone} /> : null}
                                  <ReviewRow
                                      label="Jam operasional"
                                      value={operatingHoursSummary(outlet.operating_hours)}
                                  />
                              </div>
                              {outlet.photos_url.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                      {outlet.photos_url.map((url, index) =>
                                          url !== null ? (
                                              <img
                                                  key={url ?? index}
                                                  src={url}
                                                  alt={`Foto ${outlet.name}`}
                                                  className="size-12 rounded-lg border object-cover"
                                              />
                                          ) : null
                                      )}
                                  </div>
                              ) : null}
                          </div>
                      ))
                    : null}
            </ReviewCollapsible>

            <ReviewCollapsible
                title="Logo & dokumen"
                stepId="documents"
                status={sectionStatus("documents", registration)}
                hasData={registration.logo_url !== null || registration.documents.length > 0}
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    {registration.logo_url !== null ? (
                        <img
                            src={registration.logo_url}
                            alt="Logo usaha"
                            className="size-12 rounded-lg border object-cover"
                        />
                    ) : (
                        <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <ImageIcon className="size-5" aria-hidden="true" />
                        </span>
                    )}
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Logo usaha</span>
                        <span className="text-sm font-medium">
                            {registration.logo_url !== null ? "Tersimpan" : "Belum ada"}
                        </span>
                    </div>
                </div>

                {registration.documents.map((document) => (
                    <div key={document.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileTextIcon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                            <span className="text-xs text-muted-foreground">
                                {documentTypeLabel(document.document_type)}
                            </span>
                            <span className="truncate text-sm font-medium">{document.file_name}</span>
                        </div>
                    </div>
                ))}
            </ReviewCollapsible>

            <ReviewCollapsible
                title="Rekening pencairan"
                stepId="payout"
                status={sectionStatus("payout", registration)}
                hasData={registration.payout_accounts.length > 0}
            >
                {registration.payout_accounts.length > 0
                    ? registration.payout_accounts.map((account) => (
                          <div key={account.id} className="flex flex-col divide-y">
                              <ReviewRow label="Bank" value={account.bank_name} />
                              <ReviewRow label="Nomor rekening" value={account.account_number} />
                              <ReviewRow label="Nama pemilik" value={account.account_name} />
                          </div>
                      ))
                    : null}
            </ReviewCollapsible>
        </div>
    )
}
