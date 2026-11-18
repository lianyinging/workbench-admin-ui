import type { BaseEntity } from '@/api/model/resultModel';

export interface OpcIndustryAppQuery extends BaseEntity {
  appKey?: string;
  title?: string;
  mode?: string;
  status?: string;
  visibility?: string;
}

export interface OpcIndustryAppForm {
  appId?: number;
  appKey?: string;
  title?: string;
  subtitle?: string;
  category?: string;
  tags?: string;
  icon?: string;
  /** Logo base64 data URL */
  logo?: string;
  tone?: string;
  mode?: string;
  url?: string;
  pluginId?: string;
  visibility?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
}

export interface OpcIndustryAppVo extends BaseEntity {
  appId?: number;
  appKey?: string;
  title?: string;
  subtitle?: string;
  category?: string;
  tags?: string;
  tagList?: string[];
  icon?: string;
  /** Logo base64 data URL */
  logo?: string;
  tone?: string;
  mode?: string;
  url?: string;
  pluginId?: string;
  visibility?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
}
