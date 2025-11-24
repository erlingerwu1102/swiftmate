"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("vitest/config");
var plugin_vue_1 = require("@vitejs/plugin-vue");
var path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, plugin_vue_1.default)()], // 添加类型断言
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, './src')
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
    }
});
