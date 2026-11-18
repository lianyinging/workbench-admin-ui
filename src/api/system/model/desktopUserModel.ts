import type { BaseEntity } from '@/api/model/resultModel';

export interface OpcDesktopUserQuery extends BaseEntity {
  userName?: string;
  nickName?: string;
  status?: string;
}

export interface OpcDesktopUserForm {
  userId?: number;
  userName?: string;
  nickName?: string;
  password?: string;
  status?: string;
  /** 1已订阅 0未订阅（有勾选应用则为 1） */
  subscribed?: string;
  /** 订阅的行业应用 ID（多选） */
  appIds?: number[];
  remark?: string;
}

export interface OpcDesktopUserVo extends BaseEntity {
  userId?: number;
  userName?: string;
  nickName?: string;
  status?: string;
  /** 1已订阅 0未订阅 */
  subscribed?: string;
  appIds?: number[];
  appTitles?: string[];
  remark?: string;
  lastLoginIp?: string;
  lastLoginTime?: string;
  /** 桌面端登录会话是否在线 */
  online?: boolean;
}
