import type { R, TableDataInfo } from '@/api/model/resultModel';
import type { OpcCoworkerForm, OpcCoworkerQuery, OpcCoworkerVo } from '@/api/system/model/coworkerModel';
import { request } from '@/utils/request';

export function listCoworker(query?: OpcCoworkerQuery) {
  return request.get<TableDataInfo<OpcCoworkerVo>>({
    url: '/system/coworker/list',
    params: query,
  });
}

export function getCoworker(coworkerId: number) {
  return request.get<R<OpcCoworkerVo>>({
    url: `/system/coworker/${coworkerId}`,
  });
}

export function listCoworkerEnabledOptions() {
  return request.get<R<OpcCoworkerVo[]>>({
    url: '/system/coworker/enabledOptions',
  });
}

export function addCoworker(data: OpcCoworkerForm) {
  return request.post<R>({
    url: '/system/coworker',
    data,
  });
}

export function updateCoworker(data: OpcCoworkerForm) {
  return request.put<R>({
    url: '/system/coworker',
    data,
  });
}

export function delCoworker(coworkerIds: number | Array<number>) {
  return request.delete<R>({
    url: `/system/coworker/${coworkerIds}`,
  });
}

export function changeCoworkerStatus(coworkerId: number, status: string) {
  return request.put<R>({
    url: '/system/coworker/changeStatus',
    data: { coworkerId, status },
  });
}