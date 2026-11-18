import type { R } from '@/api/model/resultModel';
import { request } from '@/utils/request';

export interface OpcDesktopDevice {
  deviceId: string;
  deviceName: string;
  osName?: string;
  osVersion?: string;
  appVersion?: string;
  userId?: number;
  userDisplayName?: string;
  /** 绑定用户是否仍登录 */
  userOnline?: boolean;
  lastIp?: string;
  lastHeartbeatTime?: string;
  status?: string;
  /** 设备心跳在线 */
  online?: boolean;
}

export interface OpcDesktopDeviceQuery {
  onlineOnly?: boolean;
  deviceName?: string;
}

/** 查询桌面端设备列表 */
export function listDesktopDevices(query?: OpcDesktopDeviceQuery) {
  return request.get<R<OpcDesktopDevice[]>>({
    url: '/monitor/desktop/list',
    params: query,
  });
}

/** 启用/禁用设备 status=1|0 */
export function updateDesktopDeviceStatus(deviceId: string, status: string) {
  return request.put<R>({
    url: `/monitor/desktop/${deviceId}/status/${status}`,
  });
}
