import { ImageIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { useRegistrationContext } from "./registration-context"
import { documentTypeLabel } from "../schemas/document.schema"
import type { StepId } from "../utils/steps"
import type { MerchantRegistration } from "../types/merchant-registration.types"

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium break-words">{value ?? "-"}</dd>
        </div>
    )
}

function ReviewSection({ title, stepId, children }: { title: string; stepId: StepId; children: React.ReactNode }) {
    const { navigation } = useRegistrationContext()

    return (
        <section className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                <Text as="h2" variant="sm" weight="semibold">
                    {title}
                </Text>
                <Button type="button" variant="ghost" size="sm" onClick={() => navigation.goToStep(stepId)}>
                    Ubah
                </Button>
            </div>
            <dl className="flex flex-col divide-y">{children}</dl>
        </section>
    )
}

function serviceAreaLabel(
    type: MerchantRegistration["outlets"][number]["service_area_type"],
    radius: number | null
): string {
    return type === "radius" ? `Radius ${radius ?? "-"} km` : `Area ${type}`
}

export function RegistrationReview({ registration }: { registration: MerchantRegistration }) {
    return (
        <div className="flex flex-col gap-4">
            <ReviewSection title="Data usaha" stepId="business">
                <ReviewRow label="Nama usaha" value={registration.business_name} />
                <ReviewRow label="Jenis usaha" value={registration.type === "company" ? "Badan usaha" : "Perorangan"} />
                <ReviewRow label="Deskripsi" value={registration.description || "-"} />
            </ReviewSection>

            <ReviewSection title="Identitas pemilik" stepId="identity">
                {registration.identity !== null ? (
                    <>
                        <ReviewRow label="Jenis identitas" value={registration.identity.id_type.toUpperCase()} />
                        <ReviewRow label="Nomor identitas" value={registration.identity.id_number} />
                        <ReviewRow label="Nama lengkap" value={registration.identity.full_name} />
                        <ReviewRow label="Tanggal lahir" value={registration.identity.birth_date ?? "-"} />
                    </>
                ) : (
                    <ReviewRow label="Status" value="Belum diisi" />
                )}
            </ReviewSection>

            {registration.type === "company" ? (
                <ReviewSection title="Badan usaha" stepId="legal-entity">
                    {registration.legal_entity !== null ? (
                        <>
                            <ReviewRow label="Bentuk" value={registration.legal_entity.entity_type.toUpperCase()} />
                            <ReviewRow label="Nama" value={registration.legal_entity.name} />
                            <ReviewRow label="NIB" value={registration.legal_entity.nib} />
                            <ReviewRow label="NPWP" value={registration.legal_entity.npwp} />
                            <ReviewRow label="Alamat" value={registration.legal_entity.address ?? "-"} />
                            <ReviewRow label="Wilayah" value={registration.legal_entity.geography?.village ?? "-"} />
                        </>
                    ) : (
                        <ReviewRow label="Status" value="Belum diisi" />
                    )}
                </ReviewSection>
            ) : null}

            <ReviewSection title="Layanan" stepId="service">
                <ReviewRow label="Layanan" value={registration.service?.name ?? "Belum dipilih"} />
            </ReviewSection>

            <ReviewSection title="Kategori" stepId="categories">
                <ReviewRow
                    label="Kategori"
                    value={
                        registration.categories.length > 0 ? (
                            <span className="flex flex-wrap justify-end gap-1">
                                {registration.categories.map((category) => (
                                    <Badge key={category.id} variant="secondary">
                                        {category.name ?? category.category_id}
                                    </Badge>
                                ))}
                            </span>
                        ) : (
                            "Belum dipilih"
                        )
                    }
                />
            </ReviewSection>

            <ReviewSection title="Outlet & lokasi" stepId="outlets">
                {registration.outlets.length > 0 ? (
                    registration.outlets.map((outlet) => (
                        <ReviewRow
                            key={outlet.id}
                            label={outlet.name}
                            value={`${serviceAreaLabel(outlet.service_area_type, outlet.service_radius_km)} · ${outlet.geography?.village ?? outlet.address}`}
                        />
                    ))
                ) : (
                    <ReviewRow label="Status" value="Belum ada outlet" />
                )}
            </ReviewSection>

            <ReviewSection title="Logo & dokumen" stepId="documents">
                <div className="flex items-center gap-3 px-4 py-3">
                    {registration.logo_url !== null ? (
                        <img
                            src={registration.logo_url}
                            alt="Logo usaha"
                            className="size-12 rounded-lg border object-cover"
                        />
                    ) : (
                        <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <ImageIcon className="size-5" />
                        </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                        {registration.logo_url !== null ? "Logo tersimpan" : "Belum ada logo"}
                    </span>
                </div>
                {registration.documents.length > 0 ? (
                    registration.documents.map((document) => (
                        <ReviewRow
                            key={document.id}
                            label={documentTypeLabel(document.document_type)}
                            value={document.file_name}
                        />
                    ))
                ) : (
                    <ReviewRow label="Dokumen" value="Tidak ada" />
                )}
            </ReviewSection>

            <ReviewSection title="Rekening pencairan" stepId="payout">
                {registration.payout_accounts.length > 0 ? (
                    registration.payout_accounts.map((account) => (
                        <ReviewRow
                            key={account.id}
                            label={account.bank_name}
                            value={`${account.account_number} · ${account.account_name}`}
                        />
                    ))
                ) : (
                    <ReviewRow label="Status" value="Belum diisi" />
                )}
            </ReviewSection>
        </div>
    )
}
