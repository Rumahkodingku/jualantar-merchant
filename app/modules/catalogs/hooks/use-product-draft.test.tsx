import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useProductDraft } from "./use-product-draft"

const { api, putToStorage } = vi.hoisted(() => ({
    api: {
        fetchProductDraft: vi.fn(),
        saveProductDraft: vi.fn(),
        discardProductDraft: vi.fn(),
        createDraftMediaUploadUrl: vi.fn(),
        deleteDraftMedia: vi.fn(),
    },
    putToStorage: vi.fn(),
}))

vi.mock("../services/product-draft/product-draft.api", () => api)
vi.mock("~/lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/lib/api")>()

    return { ...actual, putToStorage }
})

vi.mock("~/lib/notify", () => ({ notifyError: vi.fn(), notifySuccess: vi.fn() }))

const DEBOUNCE_MS = 1000

type StoredDraft = {
    id: string
    version: number
    step_index: number
    data: Record<string, unknown>
    expires_at: string | null
    updated_at: string | null
}

function storedDraft(overrides: Partial<StoredDraft> = {}): StoredDraft {
    return {
        id: "d1",
        version: 4,
        step_index: 1,
        data: {
            info: {
                name: "Burger Spesial",
                category_id: "cat-1",
                description: null,
                product_type: "simple",
            },
            price_raw: "18000",
            variants: [],
            modifier_groups: [],
            media: [],
            outlet_ids: ["out-1"],
        },
        expires_at: "2099-01-01T00:00:00Z",
        updated_at: "2099-01-01T00:00:00Z",
        ...overrides,
    }
}

/** The variables of the most recent draft write. */
function lastSave(): unknown {
    const calls = api.saveProductDraft.mock.calls

    return calls.at(-1)?.[0]
}

function renderDraft(autosave = true) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return renderHook(() => useProductDraft({ autosave }), {
        wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    })
}

beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    api.fetchProductDraft.mockResolvedValue(null)
    api.saveProductDraft.mockImplementation(async (input: { data: unknown }) =>
        storedDraft({ version: 1, step_index: 0, data: input.data as Record<string, unknown> })
    )
    api.discardProductDraft.mockResolvedValue(undefined)
    api.deleteDraftMedia.mockResolvedValue(storedDraft())
    api.createDraftMediaUploadUrl.mockResolvedValue({
        object_key: "merchants/m1/drafts/a.jpg",
        upload_url: "https://storage.test/put",
        headers: { "Content-Type": "image/jpeg" },
        expires_at: "2099-01-01T00:00:00Z",
        preview_url: "https://storage.test/a.jpg",
    })
    putToStorage.mockResolvedValue(undefined)
})

afterEach(() => {
    vi.useRealTimers()
})

describe("useProductDraft", () => {
    it("starts empty when the merchant has no draft", async () => {
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.status).toBe("ready"))

        expect(result.current.hydrated).toBe(true)
        expect(result.current.isResumed).toBe(false)
        expect(result.current.info.name).toBe("")
        expect(result.current.stepIndex).toBe(0)
    })

    it("restores a stored draft onto the form", async () => {
        api.fetchProductDraft.mockResolvedValue(storedDraft())
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        expect(result.current.status).toBe("ready")
        expect(result.current.isResumed).toBe(true)
        expect(result.current.info.name).toBe("Burger Spesial")
        expect(result.current.info.category_id).toBe("cat-1")
        expect(result.current.info.description).toBe("")
        expect(result.current.priceRaw).toBe("18000")
        expect(result.current.outletIds).toEqual(["out-1"])
        expect(result.current.stepIndex).toBe(1)
    })

    it("survives a draft that does not parse", async () => {
        api.fetchProductDraft.mockResolvedValue({ id: "d1", version: 1, data: { variants: "nope" } })
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        expect(result.current.info.name).toBe("")
        expect(result.current.variants).toEqual([])
    })

    it("debounces autosave and sends one write for a burst of edits", async () => {
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.patchInfo({ name: "A" })
            result.current.patchInfo({ name: "Ay" })
            result.current.patchInfo({ name: "Ayam" })
        })

        expect(api.saveProductDraft).not.toHaveBeenCalled()

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS)
        })

        await waitFor(() => expect(api.saveProductDraft).toHaveBeenCalledTimes(1))

        expect(lastSave()).toEqual(
            expect.objectContaining({
                expected_version: null,
                step_index: 0,
                data: expect.objectContaining({ info: expect.objectContaining({ name: "Ayam" }) }),
            })
        )
    })

    it("skips the write when nothing actually changed", async () => {
        api.fetchProductDraft.mockResolvedValue(storedDraft())
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS)
        })

        expect(api.saveProductDraft).not.toHaveBeenCalled()
    })

    it("flushes immediately when the step changes", async () => {
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.patchInfo({ name: "Ayam" })
            result.current.setStepIndex(2)
        })

        await waitFor(() => expect(api.saveProductDraft).toHaveBeenCalledTimes(1))
        expect(lastSave()).toEqual(expect.objectContaining({ step_index: 2 }))
    })

    it("sends the version it was based on", async () => {
        api.fetchProductDraft.mockResolvedValue(storedDraft())
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.patchInfo({ name: "Ayam Geprek" })
        })

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS)
        })

        await waitFor(() => expect(api.saveProductDraft).toHaveBeenCalled())
        expect(lastSave()).toEqual(expect.objectContaining({ expected_version: 4 }))
    })

    it("does not autosave while a submit is in flight", async () => {
        api.fetchProductDraft.mockResolvedValue(storedDraft())
        const { result } = renderDraft(false)

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.patchInfo({ name: "Ayam Geprek" })
        })

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS * 4)
        })

        expect(api.saveProductDraft).not.toHaveBeenCalled()
    })

    it("still writes a checkpoint step change while autosave is off", async () => {
        const { result } = renderDraft(false)

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.setStepIndex(3)
        })

        await waitFor(() => expect(api.saveProductDraft).toHaveBeenCalledTimes(1))
    })

    it("uploads a picked photo and stores its object key", async () => {
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        const file = new File(["x"], "burger.jpg", { type: "image/jpeg" })

        await act(async () => {
            await result.current.addMedia(file)
        })

        expect(api.createDraftMediaUploadUrl.mock.calls[0]?.[0]).toEqual({
            file_name: "burger.jpg",
            mime_type: "image/jpeg",
            file_size: file.size,
        })
        expect(putToStorage).toHaveBeenCalledWith(
            "https://storage.test/put",
            file,
            expect.objectContaining({ headers: { "Content-Type": "image/jpeg" } })
        )
        expect(result.current.media).toHaveLength(1)
        expect(result.current.media[0]).toMatchObject({
            object_key: "merchants/m1/drafts/a.jpg",
            preview_url: "https://storage.test/a.jpg",
            status: "ready",
            is_primary: true,
        })
        expect(result.current.mediaBusy).toBe(false)
    })

    it("drops a photo whose upload failed", async () => {
        putToStorage.mockRejectedValueOnce(new Error("storage offline"))
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        await act(async () => {
            await result.current.addMedia(new File(["x"], "burger.jpg", { type: "image/jpeg" }))
        })

        expect(result.current.media).toEqual([])
    })

    it("keeps a photo in the draft only once it is uploaded", async () => {
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        let resolveUpload: (() => void) | undefined
        putToStorage.mockImplementationOnce(() => new Promise<void>((resolve) => (resolveUpload = resolve)))

        act(() => {
            void result.current.addMedia(new File(["x"], "burger.jpg", { type: "image/jpeg" }))
        })

        await waitFor(() => expect(result.current.mediaBusy).toBe(true))

        act(() => {
            result.current.setStepIndex(4)
        })

        await waitFor(() => expect(api.saveProductDraft).toHaveBeenCalled())

        const sent = lastSave() as { data: { media: unknown[] } }

        expect(sent.data.media).toEqual([])

        await act(async () => {
            resolveUpload?.()
        })
    })

    it("removes a photo through the API before dropping it locally", async () => {
        const draft: StoredDraft = storedDraft()
        draft.data.media = [
            {
                key: "med-1",
                object_key: "merchants/m1/drafts/a.jpg",
                file_name: "a.jpg",
                mime_type: "image/jpeg",
                file_size: 2048,
                alt_text: null,
                is_primary: true,
                preview_url: "https://storage.test/a.jpg",
            },
        ]
        api.fetchProductDraft.mockResolvedValue(draft)
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))
        expect(result.current.media).toHaveLength(1)

        await act(async () => {
            await result.current.deleteMedia("med-1")
        })

        expect(api.deleteDraftMedia.mock.calls[0]?.[0]).toBe("merchants/m1/drafts/a.jpg")
        expect(result.current.media).toEqual([])
    })

    it("keeps a photo the API refused to remove", async () => {
        const draft: StoredDraft = storedDraft()
        draft.data.media = [
            {
                key: "med-1",
                object_key: "merchants/m1/drafts/a.jpg",
                file_name: "a.jpg",
                mime_type: "image/jpeg",
                file_size: 2048,
                alt_text: null,
                is_primary: true,
                preview_url: "https://storage.test/a.jpg",
            },
        ]
        api.fetchProductDraft.mockResolvedValue(draft)
        api.deleteDraftMedia.mockRejectedValueOnce(new Error("boom"))
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        await act(async () => {
            await result.current.deleteMedia("med-1")
        })

        expect(result.current.media).toHaveLength(1)
    })

    it("promotes the next photo to primary when one is removed", async () => {
        const draft: StoredDraft = storedDraft()
        draft.data.media = [
            {
                key: "med-1",
                object_key: "merchants/m1/drafts/a.jpg",
                file_name: "a.jpg",
                mime_type: "image/jpeg",
                file_size: 1,
                alt_text: null,
                is_primary: true,
                preview_url: null,
            },
            {
                key: "med-2",
                object_key: "merchants/m1/drafts/b.jpg",
                file_name: "b.jpg",
                mime_type: "image/jpeg",
                file_size: 1,
                alt_text: null,
                is_primary: false,
                preview_url: null,
            },
        ]
        api.fetchProductDraft.mockResolvedValue(draft)
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.setPrimaryMedia("med-2")
        })

        expect(result.current.media[0]?.is_primary).toBe(false)
        expect(result.current.media[1]?.is_primary).toBe(true)
    })

    it("discards the draft on the server and clears the form", async () => {
        api.fetchProductDraft.mockResolvedValue(storedDraft())
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        await act(async () => {
            await result.current.discard()
        })

        expect(api.discardProductDraft).toHaveBeenCalled()
        expect(result.current.info.name).toBe("")
        expect(result.current.stepIndex).toBe(0)
        expect(result.current.isResumed).toBe(false)
        expect(result.current.saveState).toBe("idle")
    })

    it("stores the submit cursors so a retry can resume", async () => {
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        act(() => {
            result.current.setSubmission({
                productId: "p1",
                createdVariants: 2,
                createdGroupIds: [],
                createdModifierCounts: [],
                createdMedia: 1,
                outletsReplaced: false,
            })
        })

        await waitFor(() => expect(api.saveProductDraft).toHaveBeenCalled())

        const sent = lastSave() as { data: { submission: { productId: string } } }

        expect(sent.data.submission).toMatchObject({ productId: "p1", createdVariants: 2 })
    })

    it("restores the submit cursors that came back with the draft", async () => {
        const draft: StoredDraft = storedDraft()
        draft.data.submission = {
            productId: "p1",
            createdVariants: 1,
            createdGroupIds: [],
            createdModifierCounts: [],
            createdMedia: 0,
            outletsReplaced: false,
        }
        api.fetchProductDraft.mockResolvedValue(draft)
        const { result } = renderDraft()

        await waitFor(() => expect(result.current.hydrated).toBe(true))

        expect(result.current.submission).toMatchObject({ productId: "p1", createdVariants: 1 })
    })
})
