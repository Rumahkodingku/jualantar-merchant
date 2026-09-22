import { toast } from "~/components/ui/toast"

// Notifikasi global tetap memakai Base-UI toast manager (reaktif lintas module),
// bukan Zustand — tidak ada kebutuhan antrean/history terobservasi di store.
export function notifySuccess(title: string, description?: string) {
    toast.add({ title, description, type: "success" })
}

export function notifyError(title: string, description?: string) {
    toast.add({ title, description, type: "error" })
}
