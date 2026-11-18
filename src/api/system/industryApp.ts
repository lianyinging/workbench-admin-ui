import type { R, TableDataInfo } from '@/api/model/resultModel';
import type { OpcIndustryAppForm, OpcIndustryAppQuery, OpcIndustryAppVo } from '@/api/system/model/industryAppModel';
import { request } from '@/utils/request';

export function listIndustryApp(query?: OpcIndustryAppQuery) {
  return request.get<TableDataInfo<OpcIndustryAppVo>>({
    url: '/system/industryApp/list',
    params: query,
  });
}

export function getIndustryApp(appId: number) {
  return request.get<R<OpcIndustryAppVo>>({
    url: `/system/industryApp/${appId}`,
  });
}

export function addIndustryApp(data: OpcIndustryAppForm) {
  return request.post<R>({
    url: '/system/industryApp',
    data,
  });
}

export function updateIndustryApp(data: OpcIndustryAppForm) {
  return request.put<R>({
    url: '/system/industryApp',
    data,
  });
}

export function delIndustryApp(appIds: number | Array<number>) {
  return request.delete<R>({
    url: `/system/industryApp/${appIds}`,
  });
}

export function changeIndustryAppStatus(appId: number, status: string) {
  return request.put<R>({
    url: '/system/industryApp/changeStatus',
    data: { appId, status },
  });
}
