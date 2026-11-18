# 云效「Docker 部署」执行脚本（部署组每台机器执行）
# $image 由流水线上游「镜像构建」步骤注入，勿改名

CONTAINER_NAME="cm-opc-workbench-admin-ui"
# 后端地址（宿主机上的后端端口；同机部署可改成实际 IP）
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-host.docker.internal:9080}"

if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
  echo "停止并删除旧容器: $CONTAINER_NAME"
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

# 清理本容器曾用过的旧镜像层（忽略正在被其他容器使用的）
for img in $(docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' | grep -i 'opc-workbench-admin-ui' | awk '{print $2}'); do
  echo "尝试删除旧镜像: $img"
  docker rmi "$img" || true
done

docker pull "$image" || true

docker run -d \
  --restart=always \
  --name="$CONTAINER_NAME" \
  -p 9002:9002 \
  -e BACKEND_UPSTREAM="$BACKEND_UPSTREAM" \
  --add-host=host.docker.internal:host-gateway \
  "$image"

echo "已启动 $CONTAINER_NAME -> http://0.0.0.0:9002  (BACKEND_UPSTREAM=$BACKEND_UPSTREAM)"
docker ps -f name=^/${CONTAINER_NAME}$
