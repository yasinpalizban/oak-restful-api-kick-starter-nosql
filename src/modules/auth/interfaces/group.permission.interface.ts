import {IPagination} from "../../shared/interfaces/pagination.ts";

export interface IGroupPermission {
  _id: string;
  actions: string;
  groupId: string;
  group?: string;
  permission?: string;
  permissionId: string;
}
export interface IGroupPermissionPagination {
  data: IGroupPermission[];
  pagination?: IPagination;
}
