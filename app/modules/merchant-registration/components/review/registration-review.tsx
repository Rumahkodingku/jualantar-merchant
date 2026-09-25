import { FileTextIcon, ImageIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"

import { ReviewCollapsible } from "./review-collapsible"
import { ReviewOutletCard } from "./review-outlet-card"
import { ReviewRow } from "./review-row"
import { documentTypeLabel } from "../../schemas/document.schema"
import { sectionStatus } from "../../utils/review-section-status"
import type { MerchantRegistration } from "../../types/merchant-registration.types"

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
                    ? registration.outlets.map((outlet) => <ReviewOutletCard key={outlet.id} outlet={outlet} />)
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
