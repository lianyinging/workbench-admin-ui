# OPC 工作台管理前端 — dist + Nginx:9002
# 云效：先 yarn build，再 docker build
# 运行：docker run -d -p 9002:9002 -e BACKEND_UPSTREAM=<后端IP>:9080 <image>
# 访问：http://<服务器IP>:9002

FROM nginx:1.27-alpine
LABEL maintainer="opc-workbench" \
      app="cm-opc-workbench-admin-ui"

ENV BACKEND_UPSTREAM=172.29.132.165:9080

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist/ /usr/share/nginx/html/

EXPOSE 9002

CMD ["nginx", "-g", "daemon off;"]
