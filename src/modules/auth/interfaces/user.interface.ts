import {IPagination} from "../../shared/interfaces/pagination.ts";

export interface IUser {
    _id: string | undefined;
    login?: string | undefined;
    group?: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    username: string | undefined;
    password: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    image: string | undefined;
    address: string | undefined;
    gender: boolean | undefined;
    country: string | undefined;
    city: string | undefined;
    active: boolean | undefined;
    activeToken: string | undefined| null;
    activeExpires: Date | undefined| null;
    status: boolean | undefined;
    statusMessage: string | undefined;
    resetToken: string | undefined| null;
    resetExpires: Date | undefined| null;
    resetAt: Date | undefined| null;
    createdAt: Date | undefined| null;
    updatedAt: Date | undefined| null;
    deletedAt: Date | undefined| null;
}

export interface IUserPagination {
    data: IUser[];
    pagination?: IPagination;
}
