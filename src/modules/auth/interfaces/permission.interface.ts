import {IPagination} from "../../shared/interfaces/pagination.ts";

export interface IPermission {
  _id: string| undefined;
  name: string | undefined;
  description: string |  undefined;
  active: boolean | undefined;
  groups?: [{
    _id: string| undefined,
    actions: string| undefined,
    groupId: string| undefined,
  }];
  users?: [{
    _id: string| undefined,
    actions: string| undefined,
    userId: string| undefined,
  }];
}

export interface IPermissionPagination {
  data: IPermission[];
  pagination?: IPagination;
}
