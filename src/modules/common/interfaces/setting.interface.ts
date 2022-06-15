import {IPagination} from "../../shared/interfaces/pagination.ts";

export interface ISetting {
  _id?: string| undefined;
  key: string| undefined;
  value: string| undefined;
  description: string| undefined;
  status: boolean| undefined;
  createdAt: Date| undefined;
  updatedAt: Date| undefined;
  deletedAt: Date| undefined;
}

export interface ISettingPagination {
  data: ISetting[];
  pagination?: IPagination;
}

