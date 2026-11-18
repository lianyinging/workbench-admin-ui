# OPC 工作台管理前端 — Yarn classic 构建 + 容器内 Nginx
# 运行：docker run -d -p 9002:9002 -e BACKEND_UPSTREAM=106.15.53.78:9080 <image>

FROM node:22-alpine AS builder
WORKDIR /app

# 固定 Yarn classic（国内勿用 corepack / registry.yarnpkg.com）
RUN npm install -g yarn@1.22.22 --registry=https://registry.npmmirror.com

COPY package.json yarn.lock .yarnrc.yml .npmrc ./
RUN yarn install --frozen-lockfile --registry=https://registry.npmmirror.com

COPY . .
RUN yarn build

FROM nginx:1.27-alpine
LABEL maintainer="opc-workbench" \
      app="cm-opc-workbench-admin-ui"

ENV BACKEND_UPSTREAM=opc-workbench-admin-service:9080

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 9002

CMD ["nginx", "-g", "daemon off;"]
