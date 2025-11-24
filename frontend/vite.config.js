"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_vue_1 = require("@vitejs/plugin-vue");
var path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_vue_1.default)()],
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src')
        }
    },
    server: {
        port: 5173,
        host: '127.0.0.1', // 明确指定主机
        // 移除或注释掉 proxy 配置（如果有）
        // proxy: {
        //   '/api': {
        //     target: 'http://localhost:8000',
        //     changeOrigin: true
        //   }
        // }
    }
});
