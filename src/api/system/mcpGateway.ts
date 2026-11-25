import type { R } from '@/api/model/resultModel';
import type {
  McpGatewayToolItem,
  OpcMcpGatewayConfigForm,
  OpcMcpGatewayConfigVo,
} from '@/api/system/model/mcpGatewayModel';
import { request } from '@/utils/request';

export function getMcpGatewayConfig() {
  return request.get<R<OpcMcpGatewayConfigVo>>({
    url: '/system/mcpGateway',
  });
}

export function saveMcpGatewayConfig(data: OpcMcpGatewayConfigForm) {
  return request.put<R>({
    url: '/system/mcpGateway',
    data,
  });
}

export function listMcpGatewayTools() {
  return request.get<R<McpGatewayToolItem[]>>({
    url: '/system/mcpGateway/tools',
  });
}