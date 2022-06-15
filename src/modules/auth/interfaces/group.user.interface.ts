import {IPagination} from "../../shared/interfaces/pagination.ts";

export interface IUserGroup {
  _id?: string;
  userId: string;
  groupId: string;
}

export interface IUserGroupPagination {
  data: IUserGroup[];
  pagination: IPagination;
}
