/* eslint-disable @typescript-eslint/no-require-imports */
const js = require("@eslint/js");
const globals = require("globals");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const reactPlugin = require("eslint-plugin-react");
const unusedImports = require("eslint-plugin-unused-imports");
const { FlatCompat } = require("@eslint/eslintrc");
const nextPlugin = require("@next/eslint-plugin-next");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended
});

module.exports = [
    /* 全局忽略 */
    {
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/out/**",
            "**/dist/**",
            "**/build/**",
            "**/next-env.d.ts",
            "**/components/ui/*.tsx" // shadcn/ui 组件
        ]
    },

    /* 基础 JS/TS 配置 */
    ...compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "prettier"
    ),
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaVersion: "latest", sourceType: "module" },
            globals: { ...globals.browser, ...globals.node }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "unused-imports": unusedImports,
            "@next/next": nextPlugin,
            react: reactPlugin
        },
        settings: {
            react: {
                version: "detect",
                detectOption: { cwd: __dirname }
            }
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-unused-vars": "error",
            "unused-imports/no-unused-imports": "error"
        }
    },

    /* shadcn/ui 组件特例 */
    {
        files: ["**/components/ui/*.tsx"],
        rules: { "react/prop-types": "off" }
    },

    /* 配置文件自身 */
    {
        files: [".eslintrc.{js,cjs}", "eslint.config.{js,cjs}"],
        languageOptions: { sourceType: "script", globals: globals.node }
    }
];
