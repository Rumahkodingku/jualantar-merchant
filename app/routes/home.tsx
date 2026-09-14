import { redirect } from "react-router"

export function loader() {
    return redirect("/merchant/registration")
}

export default function Home() {
    return null
}
