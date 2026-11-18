# 仅用于本地/流水线打出 dist 静态资源。
# 线上由宿主机 Nginx 托管，不在镜像内跑 Nginx。
#
# 构建产物目录：/app/dist
# 流水线也可直接 yarn build，不必一定走 docker build。

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml .npmrc ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN yarn build

# 方便 docker create/cp 取出 dist；不作为长期运行容器
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["sh", "-c", "echo 'static files in /app/dist — serve with host nginx' && sleep infinity"]
