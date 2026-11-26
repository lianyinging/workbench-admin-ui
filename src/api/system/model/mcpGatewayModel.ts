export interface OpcMcpGatewayConfigVo {
  configId?: number;
  gatewayBaseUrl?: string;
  hasApiKey?: boolean;
  apiKeyHint?: string;
  virtualServerId?: string;
  hasAdminToken?: boolean;
  remark?: string;
  updateTime?: string;
}

export interface OpcMcpGatewayConfigForm {
  gatewayBaseUrl?: string;
  /** 留空表示不修改已有 Key */
  gatewayApiKey?: string;
  virtualServerId?: string;
  adminToken?: string;
  remark?: string;
}

export interface McpGatewayToolItem {
  toolId?: string;
  toolName?: string;
  description?: string;
  gatewayId?: string;
  gatewayName?: string;
}