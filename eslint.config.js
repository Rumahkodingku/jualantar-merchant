import boundaries from "eslint-plugin-boundaries"
import tseslint from "typescript-eslint"

const DEEP_MODULE_IMPORT =
    "Deep import ke internal module lain dilarang. Gunakan public API module: ~/modules/<module>."
const SHARED_DEPENDENCY =
    "Shared layer (app/components, app/hooks, app/lib, app/stores) tidak boleh bergantung pada module."
const RESTRICTED_AXIOS = "Gunakan instance Axios dari ~/lib/api. Module tidak boleh membuat request sendiri."

export default tseslint.config(
    {
        ignores: ["build/**", ".react-router/**", "node_modules/**", "app/pwa/sw.ts"],
    },
    {
        files: ["app/**/*.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            boundaries,
        },
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json",
                },
            },
            "boundaries/elements": [
                { type: "shared", pattern: "app/components", partialMatch: false },
                { type: "shared", pattern: "app/hooks", partialMatch: false },
                { type: "shared", pattern: "app/lib", partialMatch: false },
                { type: "shared", pattern: "app/stores", partialMatch: false },
                { type: "module", pattern: "app/modules/(*)", partialMatch: false, capture: ["module"] },
            ],
            "boundaries/ignore": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
            "boundaries/legacy-warnings": false,
        },
        rules: {
            "boundaries/dependencies": [
                "error",
                {
                    default: "allow",
                    policies: [
                        {
                            from: "shared",
                            disallow: ["module"],
                            message: SHARED_DEPENDENCY,
                        },
                    ],
                },
            ],
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        { group: ["~/modules/*/**"], message: DEEP_MODULE_IMPORT },
                        { group: ["axios"], message: RESTRICTED_AXIOS },
                    ],
                },
            ],
        },
    },
    {
        files: ["app/lib/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": "off",
        },
    }
)
