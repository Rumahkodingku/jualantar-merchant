import { useNavigate } from "react-router"

import { SettingsSubpageHeader } from "../components/layout/settings-subpage-header"
import { OutletForm } from "../components/outlets/outlet-form"
import { notifySuccess } from "../utils/notify"
import { SETTINGS_PATHS, outletPath } from "../utils/routes"

export function OutletCreatePage() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SettingsSubpageHeader
                title="Outlet Baru"
                description="Lengkapi data outlet. Jam operasional dan area layanan diatur setelahnya."
                backTo={SETTINGS_PATHS.outlets}
            />

            <OutletForm
                outlet={null}
                onSaved={(saved) => {
                    notifySuccess("Outlet berhasil disimpan.")
                    void navigate(outletPath(saved.id), { replace: true })
                }}
                onCancel={() => void navigate(SETTINGS_PATHS.outlets)}
            />
        </div>
    )
}
