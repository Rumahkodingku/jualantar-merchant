export const ALLOWED_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

export const MAX_UPLOAD_SIZE_LABEL = "5 MB"

export type UploadValidationOptions = {
    imagesOnly?: boolean
}

export function validateUploadFile(file: File, options: UploadValidationOptions = {}): string | null {
    if (file.size === 0) {
        return "File kosong atau tidak terbaca."
    }

    if (file.size > MAX_UPLOAD_SIZE) {
        return `Ukuran file maksimal ${MAX_UPLOAD_SIZE_LABEL}.`
    }

    const allowed: readonly string[] = options.imagesOnly ? IMAGE_MIME_TYPES : ALLOWED_UPLOAD_MIME_TYPES

    if (!allowed.includes(file.type)) {
        return options.imagesOnly ? "Format harus JPG, PNG, atau WEBP." : "Format harus JPG, PNG, WEBP, atau PDF."
    }

    return null
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
