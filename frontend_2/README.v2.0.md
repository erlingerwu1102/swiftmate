# SwiftMate 影视机械臂控制终端 (SwiftMate Control Terminal)

**SwiftMate** 是一个基于 Web 的专业机械臂运动控制系统，专为影视拍摄（如 Glambot、产品特写）、自动化运镜和工业轨迹规划设计。它集成了 3D 仿真、实时视觉反馈和高精度运动控制功能。

##  系统特性

* **3D 轨迹所见即所得**: 基于 Three.js 的实时仿真环境，支持拖拽编辑路点。
* **影视级运镜预设**: 内置 "Orbit" (环绕)、"One Take" (一镜到底) 等拍摄模板。
* **多模式插值**: 支持 PTP (点到点)、LIN (直线)、CIRC (圆弧) 和 SPLINE (样条曲线) 运动模式。
* **安全保障**: 集成软/硬件双重紧急停止 (E-STOP) 及碰撞检测机制。
* **实时遥测**: 毫秒级显示 6 轴关节角度、末端坐标及实时视频流。

##  技术栈

* **前端框架**: Vue 3 + TypeScript + Vite
* **UI 组件库**: Element Plus / 自定义 CSS 变量适配系统
* **3D 引擎**: Three.js (OrbitControls, TransformControls)
* **通信协议**: RESTful API + Server-Sent Events (SSE)

##  快速开始

1. 环境准备
确保已安装 Node.js (v18+) 和 npm。

2. 安装依赖
npm install

3. 启动开发服务器
npm run dev
访问终端地址: http://localhost:5173

4. 生产环境构建
npm run build