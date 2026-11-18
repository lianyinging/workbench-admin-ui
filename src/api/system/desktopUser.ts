import type { R, TableDataInfo } from '@/api/model/resultModel';
import type { OpcDesktopUserForm, OpcDesktopUserQuery, OpcDesktopUserVo } from '@/api/system/model/desktopUserModel';
import { request } from '@/utils/request';

export function listDesktopUser(query?: OpcDesktopUserQuery) {
  return request.get<TableDataInfo<OpcDesktopUserVo>>({
    url: '/system/desktopUser/list',
    params: query,
  });
}

export function getDesktopUser(userId: number) {
  return request.get<R<OpcDesktopUserVo>>({
    url: `/system/desktopUser/${userId}`,
  });
}

export function addDesktopUser(data: OpcDesktopUserForm) {
  return request.post<R>({
    url: '/system/desktopUser',
    data,
  });
}

export function updateDesktopUser(data: OpcDesktopUserForm) {
  return request.put<R>({
    url: '/system/desktopUser',
    data,
  });
}

export function delDesktopUser(userIds: number | Array<number>) {
  return request.delete<R>({
    url: `/system/desktopUser/${userIds}`,
  });
}

export function changeDesktopUserStatus(userId: number, status: string) {
  return request.put<R>({
    url: '/system/desktopUser/changeStatus',
    data: { userId, status },
  });
}

export function resetDesktopUserPwd(userId: number, password: string) {
  return request.put<R>({
    url: '/system/desktopUser/resetPwd',
    data: { userId, password },
  });
}
