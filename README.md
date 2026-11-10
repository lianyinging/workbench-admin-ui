# OPC 电商工作台 - 后台管理前端

基于 [ruoyi-tdesign](https://gitee.com/yixiacoco/ruoyi-tdesign) 的 `ruoyi-ui` 独立拆分而来。

## 技术栈

- Vue 3 + TypeScript + Vite 6
- TDesign Vue Next
- Pinia / Vue Router / Axios
- UnoCSS / Less

## 环境要求

- Node.js >= 22

## 快速开始

```shell
# 安装依赖（推荐 yarn，也可使用 npm）
yarn install
# 或
npm install --registry=https://registry.npmmirror.com

# 启动开发服务（默认 http://localhost:9002）
yarn dev
# 或
npm run dev
```

开发代理：`/dev-api` → `http://localhost:9080`（后端 `ruoyi-admin` 默认端口）。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `yarn dev` | 本地开发 |
| `yarn build` | 生产构建 |
| `yarn build:test` | 测试环境构建 |
| `yarn preview` | 预览构建产物 |

## 目录说明

```
src/
  api/          # 接口定义
  components/   # 公共组件
  layouts/      # 布局
  pages/        # 业务页面
  router/       # 路由
  store/        # Pinia 状态
  utils/        # 工具（含 request）
```

## 与后端关系

后端工程位于：`opc电商-后端服务/ruoyi-tdesign-main`

前后端通过 REST API 通信；RSA 接口加解密密钥需与后端保持一致（见 `.env` / `.env.development`）。
