import { Text } from "~/components/ui/text"

import { DOCUMENT_REQUIREMENTS, type DocumentRequirement } from "../../schemas/document.schema"
import type { MerchantDocument, MerchantType } from "../../types/merchant-registration.types"
import { useRegistrationContext } from "../registration-context"
import { DocumentList } from "./document-list"
import { DocumentSlot } from "./document-slot"

function latestDocument(documents: MerchantDocument[], requirement: DocumentRequirement): MerchantDocument | null {
    const matched = documents.filter((document) => requirement.types.includes(document.document_type))

    if (matched.length === 0) {
        return null
    }

    return matched.reduce((latest, candidate) => {
        const latestTime = latest.created_at ?? ""
        const candidateTime = candidate.created_at ?? ""

        return candidateTime >= latestTime ? candidate : latest
    })
}

export function DocumentChecklist() {
    const { registration } = useRegistrationContext()
    const type: MerchantType = registration.type ?? "individual"
    const requirements = DOCUMENT_REQUIREMENTS[type]
    const slotDocuments = requirements.map((requirement) => latestDocument(registration.documents, requirement))
    const usedIds = new Set(slotDocuments.flatMap((document) => (document === null ? [] : [document.id])))
    const unmatched = registration.documents.filter((document) => !usedIds.has(document.id))

    return (
        <div className="flex flex-col gap-3">
            {requirements.map((requirement, index) => (
                <DocumentSlot key={requirement.id} requirement={requirement} document={slotDocuments[index]} />
            ))}

            {unmatched.length > 0 ? (
                <div className="flex flex-col gap-2 pt-1">
                    <Text as="h3" variant="sm" weight="semibold">
                        Dokumen lainnya
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        Dokumen yang sudah diunggah namun tidak termasuk daftar di atas.
                    </Text>
                    <DocumentList documents={unmatched} />
                </div>
            ) : null}
        </div>
    )
}
