import type { MerchantDocumentType, MerchantType } from "../types/merchant-registration.types"

export const DOCUMENT_TYPE_LABELS: Record<MerchantDocumentType, string> = {
    ktp: "KTP",
    swafoto: "Swafoto",
    npwp: "NPWP",
    nib: "NIB",
    siup: "SIUP",
    izin_usaha: "Izin Usaha",
    akta_pendirian: "Akta Pendirian",
    identitas_direktur: "Identitas Direktur",
    rekening: "Dokumen Rekening",
    foto_outlet: "Foto Outlet",
    lainnya: "Dokumen Lainnya",
}

export function documentTypeLabel(type: MerchantDocumentType): string {
    return DOCUMENT_TYPE_LABELS[type] ?? type
}

export type DocumentRequirement = {
    /** Stable key for the slot. */
    id: string
    title: string
    description: string
    /** Document types that satisfy this slot; the first is used for new uploads. */
    types: MerchantDocumentType[]
    accept: string
    imagesOnly: boolean
    /** Hints the browser to open the camera directly on mobile. */
    capture?: "user" | "environment"
    actionLabel?: string
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp"

export const DOCUMENT_ACCEPT = `${IMAGE_ACCEPT},application/pdf`

export const DOCUMENT_REQUIREMENTS: Record<MerchantType, DocumentRequirement[]> = {
    individual: [
        {
            id: "ktp",
            title: "KTP",
            description: "KTP asli yang masih berlaku dan foto harus terlihat jelas tidak buram.",
            types: ["ktp"],
            accept: IMAGE_ACCEPT,
            imagesOnly: true,
        },
        {
            id: "swafoto",
            title: "Swafoto (Verifikasi Wajah)",
            description: "Ambil foto wajah langsung melalui aplikasi untuk mencocokkan identitas pemilik.",
            types: ["swafoto"],
            accept: IMAGE_ACCEPT,
            imagesOnly: true,
            capture: "user",
            actionLabel: "Ambil Swafoto",
        },
        {
            id: "npwp",
            title: "NPWP Pemilik Usaha",
            description: "Hanya perlu diunggah jika usaha Anda memiliki atau mengenakan tarif pajak restoran (PB1).",
            types: ["npwp"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
        {
            id: "rekening",
            title: "Dokumen Pendukung Rekening",
            description: "Foto buku tabungan, halaman e-Banking, atau rekening koran.",
            types: ["rekening"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
    ],
    company: [
        {
            id: "identitas_direktur",
            title: "Identitas Direktur/Kuasa Direksi",
            description: "Foto KTP asli (WNI) atau Paspor dan KITAS (WNA) yang masih berlaku.",
            types: ["identitas_direktur"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
        {
            id: "izin_usaha",
            title: "Nomor Registrasi/Izin Usaha",
            description: "Berkas izin usaha yang sudah efektif, misalnya NIB, SIUP, atau izin operasional lainnya.",
            types: ["izin_usaha", "nib", "siup"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
        {
            id: "akta",
            title: "Akta Pendirian & Perubahan",
            description:
                "Akta pendirian (lampirkan Akta Penyesuaian bila terbit sebelum 16 Agustus 2007) serta akta perubahan bila ada.",
            types: ["akta_pendirian"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
        {
            id: "npwp",
            title: "NPWP Perusahaan",
            description: "NPWP atas nama badan usaha yang sesuai dengan data di akta.",
            types: ["npwp"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
        {
            id: "rekening",
            title: "Dokumen Pendukung Rekening",
            description: "Foto buku tabungan, halaman e-Banking, atau rekening koran.",
            types: ["rekening"],
            accept: DOCUMENT_ACCEPT,
            imagesOnly: false,
        },
    ],
}

export function primaryDocumentType(requirement: DocumentRequirement): MerchantDocumentType {
    return requirement.types[0]
}
