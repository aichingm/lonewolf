import eslint from '@eslint/js';
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

import pluginVue from 'eslint-plugin-vue';
import pluginTypescript from 'typescript-eslint';
import pluginCypress from 'eslint-plugin-cypress/flat'

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
    includeIgnoreFile(gitignorePath),
    globalIgnores(["./src-tauri", "./git"]),
    {
        files: ["./**/*.ts", "./**/*.js", "./**/*.vue"],
        extends: [
            eslint.configs.recommended,
            ...pluginTypescript.configs.recommended,
            ...pluginVue.configs['flat/recommended'],
        ],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.browser,
            parserOptions: {
                parser: "@typescript-eslint/parser"
            },
        },
        rules: {
            "vue/multi-word-component-names": ["off"],

            "@typescript-eslint/no-unused-vars": ["warn", {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
            }],

            "vue/no-dupe-keys": ["off"],

            "vue/no-ref-as-operand": ["off"],

            "vue/script-indent": ["error", 4, {
                baseIndent: 0,
            }],

            "vue/html-indent": ["error", 4, {}],
            indent: ["error", 4],
        },
    },
    {
        files: ["scripts/**/*"],
        extends: [
            eslint.configs.recommended,
            ...pluginTypescript.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.node,
            parserOptions: {},
        },

    },
    {
        files: ["cypress/e2e/**.{cy,spec}.{js,ts,jsx,tsx}"],
        extends: [
            pluginCypress.configs.recommended,
        ],
    }
]);
