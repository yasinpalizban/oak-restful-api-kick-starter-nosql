import {Context, Response, Status} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ErrorType} from "../enums/error.type.enum.ts";
import {RequestWithUser} from "../interfaces/reqeust.with.user.interface.ts";
import {CoreConfig} from "../../../core/config/core.config.ts";
import {DataStoredInToken} from "../interfaces/jwt.token.interface.ts";
import {IUser} from "../interfaces/user.interface.ts";

import {isEmpty} from "../../shared/utils/is.empty.ts";
import {RoleRouteService} from "../services/role.route.service.ts";
import {IGroup} from "../interfaces/group.interface.ts";
import {ILogIn} from "../interfaces/Log.in.interface.ts";
import {IPermission} from "../interfaces/permission.interface.ts";
import {routeController} from "../utils/route.controller.ts";
import {IUserPermission} from "../interfaces/user.permission.interface.ts";
import {IGroupPermission} from "../interfaces/group.permission.interface.ts";
import {verify, decode} from "https://deno.land/x/djwt@v2.4/mod.ts";
import {UserModel} from "../models/user.model.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";
import {PermissionModel} from "../models/permission.model.ts";
import {GroupModel} from "../models/group.model.ts";
export const authMiddleware = async (context: RequestWithUser , next: () => Promise<unknown>) => {
    try {

        const Authorization = await context.request.headers.get('Authorization')?.split('Bearer ')[1] || await context.cookies.get('Authorization') || null;

        if (isEmpty(Authorization!)) {

            context.response.status = Status.Unauthorized;
            context.response.headers.set("Content-Type", "application/json");
            return context.response.body = {
                error: i18next.t('middleWear.authToken'),
                type: ErrorType.Login,
            };
        }

        const ruleRoute = new RoleRouteService();
        const secretKey: any = CoreConfig.jwt.secretKey;
        // @ts-ignore
        const key = await crypto.subtle.generateKey(
            {name: "HMAC", hash: "SHA-512"},
            true,
            [ "verify"],
        );

         // await verify(Authorization!, key);
        const [header, payload, signature] = decode(Authorization!);
        // @ts-ignore
        const userId = payload.id;

        let findUser: ILogIn[]|any = await UserModel.aggregate([
            {
                $match: { "_id": new Bson.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "auth_groups",
                    localField: "_id",
                    foreignField: "members.userId",
                    as: "_group"
                }
            },
            { $unwind: "$_group" },
            {
                $addFields: {
                    role: {
                        _id: "$_group._id",
                        name: "$_group.name"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    root: { $mergeObjects: "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$root", "$$ROOT"]
                    }
                }
            },
            {
                $project: {
                    root: 0,
                    _group: 0
                }
            }
        ]);

        if (isEmpty(findUser)) {
            context.response.status = Status.NotModified;
            context.response.headers.set("Content-Type", "application/json");
            return context.response.body = {
                error: i18next.t('middleWear.youAlreadySignedIn'),
                type: ErrorType.Login,
            };
        }


        const userLoggedIn: ILogIn = {
            findUser: findUser[0],
        };


        context.user = userLoggedIn;


        const controllerName = routeController(context.request.url.pathname);
        const permissions: IPermission | any = await PermissionModel.findOne({active: true, name: controllerName});

        if (isEmpty(permissions)) {
            const controllerRole: [] | null = ruleRoute.getRoleAccess(controllerName);

            if (controllerRole == null) {
                return next();
            }
            for (const role of controllerRole) {
                if (role == findUser[0]?.role?.name) {
                    return next();
                }
            }
        } else {
            const typeMethod = context.request.method;
            const userPermission: IUserPermission[] = permissions["users"];
            const groupPermission: IGroupPermission[] = permissions["groups"];

            for (const isUser of userPermission) {
                if (isUser.userId == userLoggedIn.findUser?._id && isUser.actions.search(typeMethod.toLowerCase()) !== -1) {
                    return next();
                }
            }

            for (const isGroup of groupPermission) {
                if (isGroup.groupId == userLoggedIn?.role?._id && isGroup.actions.search(typeMethod.toLowerCase()) !== -1) {
                    return next();
                }
            }
        }

        context.response.status = Status.Unauthorized;
        context.response.headers.set("Content-Type", "application/json");
        return context.response.body = {
            error: i18next.t('middleWear.notEnoughPrivilege'),
            type: ErrorType.Login,
        };
    } catch (error) {

        context.response.status = Status.Unauthorized;
        context.response.headers.set("Content-Type", "application/json");
        return context.response.body = {
            error: i18next.t('middleWear.wrongAuth'),
            type: ErrorType.Login,
        };
    }
};


