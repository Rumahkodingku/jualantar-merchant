import { HomeIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"

import { ForbiddenState } from "~/components/forbidden-state"

/** Route-level 403 page (`/403`). Authorization failure only — never a 404. */
export function ForbiddenPage() {
    return (
        <div className="flex flex-1 flex-col">
            <ForbiddenState
                title="Akses ditolak"
                description="Anda tidak memiliki izin untuk membuka halaman ini. Kembali ke halaman yang dapat Anda akses."
                action={
                    <Button render={<Link to="/" />} size="lg" className="h-11">
                        <HomeIcon /> Kembali ke beranda
                    </Button>
                }
            />
        </div>
    )
}
