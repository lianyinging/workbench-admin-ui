# OPC 工作台管理前端 — 仅打包静态资源 + Nginx
# 云效顺序：先 Node 构建产出 dist/，再 docker build
# 运行：docker run -d -p 9002:9002 -e BACKEND_UPSTREAM=106.15.53.78:9080 <image>

FROM nginx:1.27-alpine
LABEL maintainer="opc-workbench" \
      app="cm-opc-workbench-admin-ui"

ENV BACKEND_UPSTREAM=opc-workbench-admin-service:9080

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist/ /usr/share/nginx/html/

EXPOSE 9002

CMD ["nginx", "-g", "daemon off;"]
