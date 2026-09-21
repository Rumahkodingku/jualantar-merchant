import { zodResolver } from "@hookform/resolvers/zod"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormProvider, useForm, type Resolver } from "react-hook-form"
import { describe, expect, it } from "vitest"

import { outletSchema, type OutletFormValues } from "../../schemas/outlet.schema"
import { OperatingHoursField } from "./operating-hours-field"

function Harness({ defaultHours = {} }: { defaultHours?: OutletFormValues["hours"] }) {
    const form = useForm<OutletFormValues>({
        resolver: zodResolver(outletSchema) as unknown as Resolver<OutletFormValues>,
        defaultValues: {
            name: "Outlet Utama",
            phone: "",
            email: "",
            address: "Jl. Merdeka No. 1",
            province_id: 1,
            regency_id: 1,
            district_id: 1,
            village_id: 1,
            postal_code: "12345",
            latitude: 0,
            longitude: 0,
            service_area_type: "radius",
            service_radius_km: 5,
            hours: defaultHours,
        },
    })

    return (
        <FormProvider {...form}>
            <OperatingHoursField />
        </FormProvider>
    )
}

describe("OperatingHoursField", () => {
    it("adds a default window when a day is switched on", async () => {
        const user = userEvent.setup()
        render(<Harness />)

        expect(screen.queryByLabelText("Jam buka")).not.toBeInTheDocument()

        await user.click(screen.getByRole("switch", { name: "Buka Senin" }))

        expect(screen.getByLabelText("Jam buka")).toHaveValue("08:00")
        expect(screen.getByLabelText("Jam tutup")).toHaveValue("17:00")
    })

    it("opens every day with the default hours", async () => {
        const user = userEvent.setup()
        render(<Harness />)

        await user.click(screen.getByRole("button", { name: /buka semua hari/i }))

        expect(screen.getAllByLabelText("Jam buka")).toHaveLength(7)
        expect(screen.getAllByRole("switch")).toHaveLength(7)
        expect(screen.getAllByRole("switch").every((el) => el.getAttribute("aria-checked") === "true")).toBe(true)
    })

    it("closes every day", async () => {
        const user = userEvent.setup()
        render(<Harness defaultHours={{ monday: { is_open: true, open: "08:00", close: "17:00" } }} />)

        await user.click(screen.getByRole("button", { name: /tutup semua hari/i }))

        expect(screen.queryByLabelText("Jam buka")).not.toBeInTheDocument()
    })

    it("applies a day's window to every other day", async () => {
        const user = userEvent.setup()
        render(<Harness />)

        await user.click(screen.getByRole("switch", { name: "Buka Senin" }))
        await user.click(screen.getByRole("button", { name: /terapkan ke semua hari/i }))

        expect(screen.getAllByLabelText("Jam buka")).toHaveLength(7)
    })

    it("shows an inline error when the close time is not after the open time", async () => {
        const user = userEvent.setup()
        render(<Harness />)

        await user.click(screen.getByRole("switch", { name: "Buka Senin" }))

        fireEvent.change(screen.getByLabelText("Jam tutup"), { target: { value: "07:00" } })

        expect(await screen.findByText("Jam tutup harus setelah jam buka.")).toBeInTheDocument()
    })
})