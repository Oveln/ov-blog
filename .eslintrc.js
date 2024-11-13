module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@next/next/recommended",
        "plugin:react/recommended",
        "prettier"
    ],
    overrides: [
        {
            env: {
                node: true
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script"
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: ["@typescript-eslint", "react", "unused-imports"],
    rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "unused-imports/no-unused-imports": "error",
        "@next/next/no-duplicate-head": "off"
    },
    settings: {
        react: {
            version: "detect" // 自动检测并使用项目中的 React 版本
        }
    }
};
