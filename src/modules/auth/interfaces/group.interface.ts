import {IPagination} from "../../shared/interfaces/pagination.ts";

export interface IGroup {
    _id: string | undefined;
    name: string | undefined;
    description: string | undefined;
    members?: [{ _id: string, userId: string }];
}

export interface IGroupPagination {
    data: IGroup[];
    pagination?: IPagination;
}
