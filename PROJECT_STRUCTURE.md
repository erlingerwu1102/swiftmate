# 前端项目结构说明  

基于 Vue 3 + Vite + TypeScript 技术栈

## 目录结构树

```text
.
├── public/                     # 静态资源目录 (favicon等，构建时原样复制)
├── src/                        # 源代码主目录
│   ├── api/                    # [通信层] 后端 API 接口定义
│   │   ├── cameraApi.ts        # 视频流与视觉反馈相关接口
│   │   ├── config.ts           # 系统参数、碰撞检测阈值配置
│   │   ├── dynamics.ts         # 动力学辨识参数与指令
│   │   ├── safety.ts           # 安全回路控制 (E-STOP、复位)
│   │   └── shot.ts             # 轨迹序列/路径点数据的 CRUD
│   │
│   ├── assets/                 # [资源层] 静态图片与样式资源
│   │   └── logo.png            # 项目 Logo
│   │
│   ├── components/             # [组件层] 可复用 UI 组件库
│   │   ├── dynamics/           # 动力学专用组件
│   │   │   └── DynamicsPanel.vue # 辨识参数配置与图表面板
│   │   ├── panels/             # 通用基础面板
│   │   │   ├── ConfigPanel.vue   # 通用配置表单容器
│   │   │   └── DataPanel.vue     # 数据展示看板
│   │   ├── trajectory/         # [核心] 机器人运动控制组件群
│   │   │   ├── MotionPanel.vue   # 速度/加速度/插值模式控制
│   │   │   ├── OperationPanel.vue# 关节覆写与精细操作面板
│   │   │   ├── SystemLogPanel.vue# 系统运行日志控制台
│   │   │   ├── SystemPanel.vue   # 系统状态总览与急停控制
│   │   │   ├── TelemetryPanel.vue# 实时关节角度与坐标遥测
│   │   │   ├── Viewport3D.vue    # Three.js 3D 仿真渲染视口
│   │   │   └── WaypointList.vue  # 路径点列表编辑器 (增删改查)
│   │   └── viewport/           # 视觉反馈组件
│   │       ├── CameraView.vue    # 实时视频流播放器 (MJPEG/WebRTC)
│   │       └── TrajectoryCanvas.vue # 2D 轨迹预览画布
│   │
│   ├── composables/            # [逻辑层] Vue Composition API (Hooks)
│   │   ├── useFileSystem.ts    # JSON 文件导入/导出逻辑
│   │   ├── useStorage.ts       # LocalStorage 本地持久化管理
│   │   ├── useTemplateManager.ts # 预设任务模板 (Orbit/OneTake) 管理
│   │   └── useTrajectoryRunner.ts # [引擎] 纯前端运动插值计算与状态机
│   │
│   ├── config/                 # [配置层] 全局静态配置
│   │   └── robotConfig.ts      # 机器人物理限位、默认参数定义
│   │
│   ├── layouts/                # [布局层] 页面骨架
│   │   └── MainLayout.vue      # 布局
│   │
│   ├── router/                 # [路由层] 页面导航配置
│   │   └── index.ts            # 路由表与导航守卫定义
│   │
│   ├── tests/                  # [测试层] 自动化测试用例
│   │   ├── integration/        # 集成测试场景
│   │   │   ├── 01_safety.spec.ts    # 安全功能测试 (急停逻辑)
│   │   │   ├── 02_stress.spec.ts    # 压力测试 (高频操作)
│   │   │   └── 03_stability.spec.ts # 长时间稳定性测试
│   │   └── utils.ts            # 测试辅助工具函数
│   │
│   ├── types/                  # [类型层] TypeScript 类型声明
│   │   └── sdk.d.ts            # 全局业务实体接口定义
│   │
│   ├── utils/                  # [工具层] 通用工具库
│   │   └── request.ts          # Axios 封装 (拦截器、错误处理)
│   │
│   ├── views/                  # [视图层] 页面级入口
│   │   ├── AdminDashboard.vue  # 管理员高级设置页
│   │   ├── DiagnosticsView.vue # 硬件诊断详情页
│   │   ├── LoginView.vue       # 用户登录页
│   │   └── TrajectoryView.vue  # [主控台] 轨迹规划主界面
│   │
│   ├── App.vue                 # 应用根组件
│   ├── main.ts                 # 应用入口 (挂载 Vue、Router 等)
│   └── index.css               # 全局样式 (Tailwind/Base styles)
│
├── index.html                  # HTML 入口模板
├── nginx.conf                  # Nginx 反向代理配置 (生产环境部署用)
├── package.json                # 项目依赖与脚本配置
├── tsconfig.json               # TypeScript 编译配置
├── vite.config.ts              # Vite 构建与代理配置
├── vitest.config.ts            # 单元测试环境配置
├── PROJECT_STRUCTURE.md        # 目录
├── README.v2.0.md              #简介
└── 使用教程.md                   

