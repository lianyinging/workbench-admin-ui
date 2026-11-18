# OPC 工作台管理前端 — Node 构建 + 容器内 Nginx
# 运行：docker run -d -p 9002:9002 -e BACKEND_UPSTREAM=host.docker.internal:9080 <image>

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml .npmrc ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:1.27-alpine
LABEL maintainer="opc-workbench" \
      app="cm-opc-workbench-admin-ui"

# 后端上游，部署时用 -e 覆盖（host:port，不含协议）
ENV BACKEND_UPSTREAM=opc-workbench-admin-service:9080

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 9002

CMD ["nginx", "-g", "daemon off;"]
