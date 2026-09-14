import { useState } from "react"

import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select"

import { FileUpload } from "./file-upload"
import { DOCUMENT_TYPE_OPTIONS } from "../schemas/document.schema"
import { useAttachDocument } from "../services/merchant-registration.mutations"
import type { MerchantDocumentType } from "../types/merchant-registration.types"
import { getApiErrorMessage } from "../utils/api-error"

export function DocumentUploader() {
    const attach = useAttachDocument()
    const [documentType, setDocumentType] = useState<MerchantDocumentType>("ktp")
    const [error, setError] = useState<string | null>(null)

    return (
        <div className="flex flex-col gap-3">
            <Field>
                <FieldLabel htmlFor="document_type">Jenis dokumen</FieldLabel>
                <NativeSelect
                    id="document_type"
                    className="w-full"
                    value={documentType}
                    onChange={(event) => setDocumentType(event.target.value as MerchantDocumentType)}
                >
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                        <NativeSelectOption key={option.value} value={option.value}>
                            {option.label}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <FieldError />
            </Field>

            <FileUpload
                purpose="document"
                label="Pilih dokumen"
                onUploaded={async (presigned, file) => {
                    setError(null)

                    try {
                        await attach.mutateAsync({
                            document_type: documentType,
                            object_key: presigned.object_key,
                            file_name: file.name,
                            mime_type: file.type,
                            file_size: file.size,
                        })
                    } catch (attachError) {
                        setError(getApiErrorMessage(attachError))
                        throw attachError
                    }
                }}
            />

            {error !== null ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
    )
}
