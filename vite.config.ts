import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "")
    // Local `php artisan serve` runs on 8001; Docker Compose maps the API on 8000.
    const apiProxyTarget = env.API_PROXY_TARGET || "http://127.0.0.1:8001"

    return {
        resolve: { tsconfigPaths: true },
        plugins: [tailwindcss(), reactRouter()],
        server: {
            // Expose the dev server on the LAN so the app can be tested from a phone.
            host: true,
            proxy: {
                "/api": {
                    target: apiProxyTarget,
                    changeOrigin: true,
                },
            },
        },
    }
})
