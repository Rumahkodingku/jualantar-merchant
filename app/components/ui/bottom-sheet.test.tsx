import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetFooter,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetTrigger,
} from "~/components/ui/bottom-sheet"
import { Button } from "~/components/ui/button"

function renderSheet(ui: React.ReactNode) {
    cleanup()

    return render(ui)
}

function DefaultSheet(props: { showSwipeHandle?: boolean }) {
    return (
        <BottomSheet {...props}>
            <BottomSheetTrigger render={<Button />}>Buka</BottomSheetTrigger>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle>Ubah peran</BottomSheetTitle>
                    <BottomSheetDescription>wahyu@usaha.id</BottomSheetDescription>
                </BottomSheetHeader>
                <BottomSheetBody>
                    <p>Pilih peran untuk karyawan ini.</p>
                    <BottomSheetClose render={<Button variant="outline" />}>Batal</BottomSheetClose>
                </BottomSheetBody>
                <BottomSheetFooter>
                    <Button>Simpan peran</Button>
                </BottomSheetFooter>
            </BottomSheetContent>
        </BottomSheet>
    )
}

afterEach(() => {
    cleanup()
})

describe("BottomSheet", () => {
    it("shows nothing until the trigger opens it", () => {
        renderSheet(<DefaultSheet />)

        expect(screen.queryByText("Ubah peran")).not.toBeInTheDocument()

        screen.getByRole("button", { name: "Buka" }).click()

        return waitFor(() => {
            expect(screen.getByText("Ubah peran")).toBeInTheDocument()
        })
    })

    it("renders the header, body and footer regions", () => {
        renderSheet(
            <BottomSheet defaultOpen>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Tambah karyawan</BottomSheetTitle>
                        <BottomSheetDescription>Buat akun karyawan.</BottomSheetDescription>
                    </BottomSheetHeader>
                    <BottomSheetBody>
                        <p>Isi formulir di sini.</p>
                    </BottomSheetBody>
                    <BottomSheetFooter>
                        <Button>Simpan</Button>
                    </BottomSheetFooter>
                </BottomSheetContent>
            </BottomSheet>
        )

        expect(screen.getByText("Tambah karyawan")).toBeInTheDocument()
        expect(screen.getByText("Buat akun karyawan.")).toBeInTheDocument()
        expect(screen.getByText("Isi formulir di sini.")).toBeInTheDocument()
        expect(screen.getByText("Simpan")).toBeInTheDocument()

        expect(document.querySelector('[data-slot="bottom-sheet-body"]')).toBeInTheDocument()
        expect(document.querySelector('[data-slot="bottom-sheet-footer"]')).toBeInTheDocument()
    })

    it("centres the sheet on desktop and drops that on request", () => {
        renderSheet(
            <BottomSheet defaultOpen>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Ubah peran</BottomSheetTitle>
                    </BottomSheetHeader>
                </BottomSheetContent>
            </BottomSheet>
        )

        const centred = document.querySelector('[data-slot="bottom-sheet-content"]')?.className ?? ""

        expect(centred).toContain("md:left-1/2!")
        expect(centred).toContain("md:top-1/2!")
        expect(centred).toContain("md:[--translate-x:calc(-50%+var(--translate-x,0px))]")
        expect(centred).toContain("md:data-[swipe-direction=down]:[--translate-y:calc(-50%+var(--translate-y,0px))]")

        renderSheet(
            <BottomSheet defaultOpen desktop={false}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Ubah peran</BottomSheetTitle>
                    </BottomSheetHeader>
                </BottomSheetContent>
            </BottomSheet>
        )

        expect(document.querySelector('[data-slot="bottom-sheet-content"]')?.className ?? "").not.toContain(
            "md:left-1/2!"
        )
    })

    it("closes when a BottomSheetClose inside it is pressed", async () => {
        const user = userEvent.setup()

        renderSheet(<DefaultSheet />)

        await user.click(screen.getByRole("button", { name: "Buka" }))
        await waitFor(() => {
            expect(screen.getByText("Ubah peran")).toBeInTheDocument()
        })

        await user.click(screen.getByRole("button", { name: "Batal" }))

        await waitFor(() => {
            expect(screen.queryByText("Ubah peran")).not.toBeInTheDocument()
        })
    })

    it("exposes the title and description to assistive technology", () => {
        renderSheet(
            <BottomSheet defaultOpen>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Ubah peran</BottomSheetTitle>
                        <BottomSheetDescription>wahyu@usaha.id</BottomSheetDescription>
                    </BottomSheetHeader>
                </BottomSheetContent>
            </BottomSheet>
        )

        expect(screen.getByRole("heading", { name: "Ubah peran" })).toBeInTheDocument()
    })

    it("keeps the swipe handle by default and drops it on request", () => {
        renderSheet(<DefaultSheet />)
        screen.getByRole("button", { name: "Buka" }).click()

        return waitFor(() => {
            expect(screen.getByText("Ubah peran")).toBeInTheDocument()
        }).then(() => {
            // The handle is rendered by the drawer's own content, so it keeps
            // the drawer's slot rather than a bottom-sheet one.
            expect(document.querySelector('[data-slot="drawer-swipe-handle"]')).toBeInTheDocument()
        })
    })

    it("omits the swipe handle when showSwipeHandle is false", () => {
        renderSheet(<DefaultSheet showSwipeHandle={false} />)
        screen.getByRole("button", { name: "Buka" }).click()

        return waitFor(() => {
            expect(screen.getByText("Ubah peran")).toBeInTheDocument()
        }).then(() => {
            expect(document.querySelector('[data-slot="drawer-swipe-handle"]')).not.toBeInTheDocument()
        })
    })

    it("keeps scroll and swipe gestures separate on the body", () => {
        renderSheet(
            <BottomSheet defaultOpen>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Tambah karyawan</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody>
                        <p>Form panjang.</p>
                    </BottomSheetBody>
                </BottomSheetContent>
            </BottomSheet>
        )

        const body = document.querySelector('[data-slot="bottom-sheet-body"]')

        expect(body).toHaveClass("overflow-y-auto", "overscroll-contain")
        expect(body).toHaveAttribute("data-base-ui-swipe-ignore")
    })

    it("reserves room for the home indicator in the footer", () => {
        renderSheet(
            <BottomSheet defaultOpen>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Ubah peran</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetFooter>
                        <Button>Simpan</Button>
                    </BottomSheetFooter>
                </BottomSheetContent>
            </BottomSheet>
        )

        expect(document.querySelector('[data-slot="bottom-sheet-footer"]')?.className).toContain(
            "env(safe-area-inset-bottom)"
        )
    })

    it("starts at the lowest snap point when only a list is given", () => {
        renderSheet(
            <BottomSheet defaultOpen snapPoints={[0.5, 0.9]}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Pilih outlet</BottomSheetTitle>
                    </BottomSheetHeader>
                    <BottomSheetBody>
                        <p>Outlet Kemang</p>
                    </BottomSheetBody>
                </BottomSheetContent>
            </BottomSheet>
        )

        expect(screen.getByText("Pilih outlet")).toBeInTheDocument()
    })

    it("refuses to render its content outside a BottomSheet", () => {
        const consoleError = console.error
        console.error = () => {}

        try {
            expect(() => render(<BottomSheetContent>Di luar root</BottomSheetContent>)).toThrow(
                /must be used within <BottomSheet>/
            )
        } finally {
            console.error = consoleError
        }
    })
})
