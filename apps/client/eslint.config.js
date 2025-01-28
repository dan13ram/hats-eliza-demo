import eslint from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import typescript from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";

export default [
    // JavaScript and TypeScript files
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: typescript,
            parserOptions: {
                ecmaVersion: "latest",
                //sourceType: "module",
                //project: "./tsconfig.json", // Make sure your tsconfig includes @types/node
                ecmaFeatures: {
                    jsx: true,
                },
            },

            //ecmaVersion: 2020,
            globals: globals.browser,
        },
        //extends: ["eslint:recommended", "plugin:react/recommended"],
        plugins: {
            "@typescript-eslint": tseslint,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            react,
        },
        rules: {
            ...eslint.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "prefer-const": "warn",
            "no-constant-binary-expression": "error",

            // Disable no-undef as TypeScript handles this better
            "no-undef": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            // Customize TypeScript rules
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
    // Add prettier as the last config to override other formatting rules
    prettier,
];
