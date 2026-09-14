import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DocumentList } from "../components/document-list"
import { DocumentUploader } from "../components/document-uploader"
import { FileUpload } from "../components/file-upload"
import { RegistrationActions } from "../components/registration-actions"
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
            <div className="flex flex-1 flex-col gap-6 px-4 py-5">
                <section className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-sm font-semibold">Logo usaha</h2>
                        <p className="text-xs text-muted-foreground">Gunakan gambar persegi agar logo tampil rapi.</p>
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
                        <h2 className="text-sm font-semibold">Dokumen pendukung</h2>
                        <p className="text-xs text-muted-foreground">
                            Opsional. Unggah KTP, NPWP, NIB, atau dokumen lain bila tersedia.
                        </p>
                    </div>
                    <DocumentList documents={registration.documents} />
                    <DocumentUploader />
                </section>
            </div>

            <RegistrationActions
                type="button"
                submitLabel="Simpan & lanjut"
                disabled={logoBusy}
                onBack={navigation.goBack}
                onSubmit={navigation.goNext}
            />
        </div>
    )
}
