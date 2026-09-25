import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { Text } from "~/components/ui/text"

import { DocumentChecklist } from "../components/documents/document-checklist"
import { FileUpload } from "../components/ui/file-upload"
import { FormActions } from "~/components/form-actions"
import { useRegistrationContext } from "../components/registration-context"
import { merchantRegistrationKeys } from "../services/merchant-registration.keys"

export function DocumentsPage() {
    const { registration, navigation } = useRegistrationContext()
    const queryClient = useQueryClient()
    const [logoBusy, setLogoBusy] = useState(false)

    function refreshRegistration() {
        void queryClient.invalidateQueries({
            queryKey: merchantRegistrationKeys.detail(),
        })
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-6">
                <section className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <Text as="h2" variant="sm" weight="semibold">
                            Logo usaha
                        </Text>
                        <Text variant="xs" className="text-muted-foreground">
                            Gunakan gambar persegi agar logo tampil rapi.
                        </Text>
                    </div>
                    <FileUpload
                        purpose="logo"
                        imagesOnly
                        accept="image/jpeg,image/png,image/webp"
                        label="Unggah logo"
                        currentUrl={registration.logo_url}
                        onStateChange={(state) => setLogoBusy(state === "requesting" || state === "uploading")}
                        onUploaded={() => refreshRegistration()}
                    />
                </section>

                <section className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <Text as="h2" variant="sm" weight="semibold">
                            Dokumen pendukung
                        </Text>
                        <Text variant="xs" className="text-muted-foreground">
                            Unggah minimal satu dokumen pendukung. Sesuaikan dengan jenis usaha Anda.
                        </Text>
                    </div>
                    <DocumentChecklist />
                </section>
            </div>

            <FormActions
                type="button"
                submitLabel="Simpan & lanjut"
                disabled={logoBusy}
                onBack={navigation.goBack}
                onSubmit={navigation.goNext}
            />
        </div>
    )
}
