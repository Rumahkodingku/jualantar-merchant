import { useNavigate } from "react-router"

import { SubpageHeader } from "~/components/layouts/subpage-header"
import { CAP, RequireCapability } from "~/modules/authorization"

import { OutletForm } from "../components/outlets/outlet-form"
import { notifySuccess } from "~/lib/notify"
import { OUTLETS_PATHS, outletPath } from "../utils/routes"

export function OutletCreatePage() {
    const navigate = useNavigate()

    return (
        <RequireCapability capability={CAP.outletsCreate}>
            <div className="flex flex-1 flex-col gap-5">
                <SubpageHeader
                    title="Outlet Baru"
                    description="Lengkapi data outlet. Jam operasional dan area layanan diatur setelahnya."
                    backTo={OUTLETS_PATHS.home}
                />

                <OutletForm
                    outlet={null}
                    onSaved={(saved) => {
                        notifySuccess("Outlet berhasil disimpan.")
                        void navigate(outletPath(saved.id), { replace: true })
                    }}
                    onCancel={() => void navigate(OUTLETS_PATHS.home)}
                />
            </div>
        </RequireCapability>
    )
}
