import ApiController from "../../shared/controllers/api.controller.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {Context, Response, Status} from "https://deno.land/x/oak/mod.ts";
import {UrlAggregation} from "../../shared/libraries/urlAggregation.ts";
import GroupPermissionService from "../services/group.permission.service.ts";
import {IGroupPermission, IGroupPermissionPagination} from "../interfaces/group.permission.interface.ts";
import {GroupPermissionEntity} from "../entities/group.permission.entity.ts";
import {RequestWithUser} from "../interfaces/reqeust.with.user.interface.ts";

export class GroupPermissionController extends ApiController {

    async index(context: RequestWithUser, next: () => Promise<unknown>): Promise<void | Response> {

// @ts-ignore
        const id: string = +context?.params?.id;
        const groupPermissionService = new GroupPermissionService();
        const urlAggregation = new UrlAggregation(context.request.url.search, true);
        const data: IGroupPermissionPagination = await groupPermissionService.setNestId(id).index(urlAggregation);
        context.response.status = Status.OK;
        context.response.headers.set("Content-Type", "application/json")
        context.response.body = {
            ...data,
            statusMessage: i18next.t('api.commons.receive'),
        };

    }


    async show(context: Context, next: () => Promise<unknown>): Promise<void | Response> {


        // @ts-ignore
        const id: string = +context?.params?.id;
        // @ts-ignore
        const subId: string = +context?.params?.subId;
        const groupPermissionService = new GroupPermissionService();
        const data: IGroupPermission[] = await groupPermissionService.setNestId(id).show(subId);

        context.response.status = Status.OK;
        context.response.headers.set("Content-Type", "application/json")
        context.response.body = {
            data,
            statusMessage: i18next.t('api.commons.receive'),
        };

    }

    async create(context: Context, next: () => Promise<unknown>): Promise<void | Response> {

        // @ts-ignore
        const id: string = +context?.params?.id;
        const result = context.request.body();
        const groupPermissionEntity = new GroupPermissionEntity(await result.value);
        const groupPermissionService = new GroupPermissionService();
        await groupPermissionService.setNestId(id).create(groupPermissionEntity);

        context.response.status = Status.Created;
        context.response.headers.set("Content-Type", "application/json");
        context.response.body = {
            statusMessage: i18next.t('api.commons.create'),
        };

    }

    async update(context: Context, next: () => Promise<unknown>): Promise<void | Response> {


        // @ts-ignore
        const id: string = +context?.params?.id;
        // @ts-ignore
        const subId: string = +context?.params?.subId;
        const result = context.request.body();
        const groupPermissionEntity = new GroupPermissionEntity(await result.value);
        const groupPermissionService = new GroupPermissionService();
        await groupPermissionService.setNestId(id).update(subId, groupPermissionEntity);

        context.response.status = Status.OK;
        context.response.headers.set("Content-Type", "application/json")
        context.response.body = {
            statusMessage: i18next.t('api.commons.update'),
        };

    }

    async delete(context: Context, next: () => Promise<unknown>): Promise<void | Response> {

        const groupPermissionService = new GroupPermissionService();

        // @ts-ignore
        const id: string = +context?.params?.id;
        // @ts-ignore
        const subId: string = +context?.params?.subId;
        await groupPermissionService.setNestId(id).delete(subId);

        context.response.status = Status.OK;
        context.response.headers.set("Content-Type", "application/json")
        context.response.body = {
            statusMessage: i18next.t('api.commons.delete'),
        };

    }
}