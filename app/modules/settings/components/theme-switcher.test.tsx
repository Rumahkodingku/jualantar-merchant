import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { useThemeStore } from "~/stores"

import { ThemeSwitcher } from "./theme-switcher"

beforeEach(() => {
    useThemeStore.setState({ mode: "system", resolved: "light" })
})

describe("ThemeSwitcher", () => {
    it("uses native radio semantics and supports keyboard focus", async () => {
        const user = userEvent.setup()
        render(<ThemeSwitcher />)

        const lightOption = screen.getByRole("radio", { name: "Terang" })
        const darkOption = screen.getByRole("radio", { name: "Gelap" })

        expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument()
        expect(screen.getByRole("group", { name: "Mode tampilan" })).toBeInTheDocument()

        lightOption.focus()
        expect(lightOption).toHaveFocus()

        await user.click(darkOption)
        expect(darkOption).toBeChecked()
        expect(lightOption).not.toBeChecked()
    })
})
