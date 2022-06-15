import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts"
import i18next from 'https://deno.land/x/i18next/index.js';
import {Status, httpErrors} from "https://deno.land/x/oak/mod.ts";
import {CoreConfig} from "../../../core/config/core.config.ts";

import {SmtpClient} from "https://deno.land/x/smtp/mod.ts";
import * as ejs from "https://deno.land/x/dejs@0.10.2/mod.ts";
import {create} from "https://deno.land/x/djwt@v2.4/mod.ts";
import {DataStoredInToken, TokenData} from "../interfaces/jwt.token.interface.ts";
import {IUser} from "../interfaces/user.interface.ts";
import {authConfig} from "../configs/auth.config.ts";
import {AuthEntity} from "../entities/auth.entity.ts";
import {isEmpty} from "../../shared/utils/is.empty.ts";
import {compareDate} from "../../shared/utils/compare.date.ts";
import {getDateNow} from "../../shared/utils/get..date.now.ts";
import {IPermission} from "../interfaces/permission.interface.ts";
import {IUserPermission} from "../interfaces/user.permission.interface.ts";
import {IGroupPermission} from "../interfaces/group.permission.interface.ts";
import {IGroup} from "../interfaces/group.interface.ts";
import {IUserGroup} from "../interfaces/group.user.interface.ts";
import {ILogIn} from "../interfaces/Log.in.interface.ts";
import {RoleType} from "../enums/role.type.enum.ts";
import {sharedConfig} from "../../shared/configs/shared.config.ts";
import {Sms} from "../../shared/libraries/sms.ts";
import {AuthServiceInterface} from "../interfaces/auth.service.interface.ts";
import {UserModel} from "../models/user.model.ts";
import {GroupModel} from "../models/group.model.ts";
import {PermissionModel} from "../models/permission.model.ts";
import {IpActivityModel} from "../models/ip.activity.model.ts";

export default class AuthService implements AuthServiceInterface {
    public userModel = UserModel;
    public groupModel = GroupModel;
    public permissionModel = PermissionModel;
    public ipActivityModel = IpActivityModel;
    public sms = new Sms(sharedConfig.sms.userName, sharedConfig.sms.password, 0);
    public smtpClient = new SmtpClient();

    constructor() {
    }

    public async signUp(entity: AuthEntity): Promise<IUser> {


        if (isEmpty(entity) || (entity.phone == undefined && entity.email == undefined))
            throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        let findUser: IUser | any;

        if (entity.email !== undefined) {
            findUser = await this.userModel.findOne({email: entity.email!, username: entity.username!});
            if (findUser) {
                await this.ipActivityModel.insertOne({
                    success: false,
                    type: 'sign-up',
                    login: entity.login!,
                    ipAddress: entity.ip!,
                    userAgent: entity.userAgent!,
                    userId: findUser._id,
                    date: new Date(getDateNow())
                });
                throw new httpErrors.Conflict(i18next.t('auth.youAreEmail'));
            }

            await this.sendActivationEmail(entity.email!, entity.activeToken!);
        }
        if (entity.phone !== undefined) {
            findUser = await this.userModel.findOne({phone: entity.phone!, username: entity.username!});
            if (findUser) {
                await this.ipActivityModel.insertOne({
                    success: false,
                    type: 'sign-up',
                    login: entity.login!,
                    ipAddress: entity.ip!,
                    userAgent: entity.userAgent!,
                    userId: findUser._id,
                    date: new Date(getDateNow())
                });
                throw new httpErrors.Conflict(i18next.t('auth.yourArePhone'));
            }
            await this.sms.sendActivationCode(entity.phone, CoreConfig.siteAddress);
        }

        const createUser: IUser | any = await this.userModel.insertOne(entity);

        if (!createUser) throw new httpErrors.Conflict(i18next.t('api.commons.reject'));

        await this.ipActivityModel.insertOne({
            success:  true,
            type: 'sign-up',
            login: entity.login!,
            ipAddress: entity.ip!,
            userAgent: entity.userAgent!,
            userId: findUser._id,
            date: new Date(getDateNow())
        });
        const newRole: object = {userId: createUser._id};
        await this.groupModel.updateOne({name: RoleType.Member}, {$push: {"members": newRole}});
        return createUser;
    }

    public async signIn(entity: AuthEntity): Promise<ILogIn> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        let findUser: IUser[] | any;

        if (entity.username !== undefined) {

            findUser = await this.userModel.findOne({'username': entity.username});

        }
        if (entity.email !== undefined) {
            findUser = await this.userModel.findOne({'email': entity.email});
        }
        if (entity.phone !== undefined) {
            findUser = await this.userModel.findOne({'phone': entity.phone});
        }


        if (!findUser) {
            await this.ipActivityModel.insertOne({
                success: false,
                type: 'sign-in',
                login: entity.login!,
                ipAddress: entity.ip!,
                userAgent: entity.userAgent!,
                userId: findUser._id,
                date: new Date(getDateNow())
            });
            throw new httpErrors.Conflict(i18next.t('auth.accountNotExist'));
        }

        const isPasswordMatching: boolean = await bcrypt.compareSync(entity.password!, findUser[0].password!);

        if (!isPasswordMatching) {
            await this.ipActivityModel.insertOne({
                success: false,
                type: 'sign-in',
                login: entity.login!,
                ipAddress: entity.ip!,
                userAgent: entity.userAgent!,
                userId: findUser._id,
                date: new Date(getDateNow())
            });
            throw new httpErrors.Conflict(i18next.t('auth.accountNotExist'));
        }
        if (findUser[0].status == true) {
            await this.ipActivityModel.insertOne({
                success: false,
                type: 'sign-in',
                login: entity.login!,
                ipAddress: entity.ip!,
                userAgent: entity.userAgent!,
                userId: findUser._id,
                date: new Date(getDateNow())
            });
            throw new httpErrors.Conflict(i18next.t('auth.accountBan'));
        }
        if (findUser[0].active == false) {

            await this.ipActivityModel.insertOne({
                success: false,
                type: 'sign-in',
                login: entity.login!,
                ipAddress: entity.ip!,
                userAgent: entity.userAgent!,
                userId: findUser._id,
                date: new Date(getDateNow())
            });
            throw new httpErrors.Conflict(i18next.t('auth.accountNotConfirm'));
        }
        await this.ipActivityModel.insertOne({
            success: true,
            type: 'sign-in',
            login: entity.login!,
            ipAddress: entity.ip!,
            userAgent: entity.userAgent!,
            userId: findUser._id,
            date: new Date(getDateNow())
        });


        const userGroup: IGroup | any = await this.groupModel.findOne({"members.userId": findUser._id});
        const tokenData: TokenData = await this.createToken(findUser[0], entity.remember ?? false);
        const cookie = this.createCookie(tokenData);
        const permissions: IPermission[] | any = await this.permissionModel.findOne({active: true});
        const permissionUser: IUserPermission[] | any = await this.permissionModel.aggregate(
            [{$match: {"users.userId": findUser._id}},
                {$unwind: "$users"},
                {$project: {_id: 0, users: 1}},
                {$replaceRoot: {newRoot: "$users"}}
            ]);
        const permissionGroup: IGroupPermission[] | any = await this.permissionModel.aggregate(
            [{$match: {"groups.groupId": userGroup._id}},
                {$unwind: "$groups"},
                {$project: {_id: 0, groups: 1}},
                {$replaceRoot: {newRoot: "$groups"}}
            ]);

        return {
            cookie: cookie,
            findUser: findUser,
            role: userGroup,
            jwt: tokenData,
            permissions: permissions,
            permissionUser: permissionUser,
            permissionGroup: permissionGroup,
        };
    }

    public async signOut(entity: IUser): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser | any = await this.userModel.findOne({'id': entity._id});
        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.youAreEmail'));

    }

    public async forgot(entity: AuthEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        let findUser: IUser | any;

        if (entity.username !== undefined) {
            findUser = await this.userModel.findOne({'username': entity.username});
            if (!findUser) {
                await this.ipActivityModel.insertOne({
                    success: false,
                    type: 'forgot',
                    login: entity.login!,
                    ipAddress: entity.ip!,
                    userAgent: entity.userAgent!,
                    userId: findUser._id,
                    date: new Date(getDateNow())
                });
                throw new httpErrors.Conflict(i18next.t('auth.youAreNotUserName'));
            }

            if (findUser.email !== undefined) {
                await this.sendForgotEmail(findUser.email, entity.resetToken!);
            } else {
                await this.sms.sendActivationCode(entity.phone!, CoreConfig.siteAddress);
            }
        }
        if (entity.email !== undefined) {
            findUser = await this.userModel.findOne({'email': entity.email});
            if (!findUser) {
                await this.ipActivityModel.insertOne({
                    success: false,
                    type: 'forgot',
                    login: entity.login!,
                    ipAddress: entity.ip!,
                    userAgent: entity.userAgent!,
                    userId: findUser._id,
                    date: new Date(getDateNow())
                });
                throw new httpErrors.Conflict(i18next.t('auth.youAreNotEmail'));
            }
            await this.sendForgotEmail(findUser.email, entity.resetToken!);
        }
        if (entity.phone !== undefined) {
            findUser = await this.userModel.findOne({'phone': entity.phone});
            if (!findUser) {

                await this.ipActivityModel.insertOne({
                    success: false,
                    type: 'forgot',
                    login: entity.login!,
                    ipAddress: entity.ip!,
                    userAgent: entity.userAgent!,
                    userId: findUser._id,
                    date: new Date(getDateNow())
                });
                throw new httpErrors.Conflict(i18next.t('auth.yourAreNotPhone'));
            }
            await this.sms.sendActivationCode(entity.phone, CoreConfig.siteAddress);
        }
        await this.userModel.updateOne({_id: findUser._id}, entity);
    }

    public async activationViaEmail(entity: AuthEntity): Promise<true> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser | any = await this.userModel.findOne({
            activeToken: entity.activeToken!,
            active: false,
            email: entity.email!,
        });
        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.youAreNotUsername'));
        if (compareDate(findUser.activeExpires, new Date())) throw new httpErrors.Conflict(i18next.t('auth.tokenExpire'));

        await this.userModel.updateOne(
            {_id: findUser._id},
            {
                active: true,
                activeToken: null,
                activeExpires: null,
            }
        );
        return true;
    }

    public async sendActivateCodeViaEmail(entity: AuthEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser | any = await this.userModel.findOne({'email': entity.email!});
        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.youAreNotEmail'));
        await this.sendActivationEmail(findUser.email, entity.activeToken!);
        await this.userModel.updateOne({_id: findUser._id}, entity);
    }

    public async activationViaSms(entity: AuthEntity): Promise<true> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const isValid = await this.sms.isActivationCodeValid(entity.phone!, entity.activeToken!);

        if (!isValid) throw new httpErrors.Conflict(i18next.t('auth.tokenExpire'));

        const findUser: IUser | any = await this.userModel.findOne({phone: entity.phone!, active: false});
        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.youAreNotAccount'));

        await this.userModel.updateOne(
            {_id: findUser._id},
            {
                active: true,
                activeToken: null,
                activeExpires: null,
            }
        );
        return true;
    }

    public async sendActivateCodeViaSms(entity: AuthEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser | any = await this.userModel.findOne({'phone': entity.phone!});
        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.youAreNotEmail'));
        await this.sms.sendActivationCode(entity.phone!, CoreConfig.siteAddress);
        await this.userModel.updateOne({_id: findUser._id}, entity);
    }

    public async resetPasswordViaEmail(entity: AuthEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser | any = await this.userModel.findOne({'email': entity.email!});
        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.youAreNotEmail'));

        await this.userModel.updateOne({_id: findUser._id},
            {
                resetAt: entity.resetAt!,
                password: entity.password!,
                resetToken: null,
                resetExpires: null,
            },
        );
    }

    public async resetPasswordViaSms(entity: AuthEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const isValid = await this.sms.isActivationCodeValid(entity.phone!, entity.resetToken!);

        if (!isValid) throw new httpErrors.Conflict(i18next.t('auth.tokenExpire'));

        const findUser: IUser | any = await this.userModel.findOne({'phone': entity.phone!});

        if (!findUser) throw new httpErrors.Conflict(i18next.t('auth.yourAreNotPhone'));

        await this.userModel.updateOne({_id: findUser._id},
            {
                resetAt: entity.resetAt!,
                password: entity.password!,
                resetToken: null,
                resetExpires: null,
            }
        );
    }

    public async createToken(user: IUser, isRemember: boolean): Promise<TokenData> {

        // @ts-ignore
        const key = await crypto.subtle.generateKey(
            {name: "HMAC", hash: "SHA-512"},
            true,
            ["sign"],
        );


        const secretKey: any = CoreConfig.jwt.secretKey;
        const maxAge: number = isRemember ? 2 * authConfig.time.day : 2 * authConfig.time.hour;
        const date = new Date();
        date.setSeconds(maxAge);
        const expire: number = Math.floor(date.getTime() / 1000);
        const token: string = await create({alg: "HS512", typ: "JWT"}, {
            id: user._id,
            exp: maxAge,
        }, key);
        return {expire: expire, maxAge: maxAge, token: token};
    }

    public createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.maxAge};`;
    }

    public async sendForgotEmail(email: string, hash: string): Promise<void> {
        await this.smtpClient.connect({
            hostname: CoreConfig.email.host,
            port: CoreConfig.email.port,
            username: CoreConfig.email.auth.user,
            password: CoreConfig.email.auth.pass
        });
        const mailContext = {
            siteAddress: CoreConfig.siteAddress,
            emailForgotTitle: i18next.t('auth.emailForgotTitle'),
            emailForgotGuide: i18next.t('auth.emailForgotGuide'),
            emailActivateHash: i18next.t('auth.emailActivateHash'),
            hash: hash,
            emailForgotVisit: i18next.t('auth.emailForgotVisit'),
            emailActivateIgnore: i18next.t('auth.emailActivateIgnore'),
            emailForgotResetFrom: i18next.t('auth.emailForgotResetFrom'),
        };
        const template = await ejs.renderFile('./dist/modules/auth/views/forgot.html', mailContext);


        await this.smtpClient.send({
            from: CoreConfig.email.fromEmail,
            to: email,
            subject: CoreConfig.siteAddress + ' (' + i18next.t('api.events.emailForgot') + ')',
            content: "Mail Content",
            html: template.toString(),
        });

        await this.smtpClient.close();

        if (this.smtpClient) {
            throw new httpErrors.Conflict(i18next.t('auth.emailSendErrorActivation'));

        }
    }

    public async sendActivationEmail(email: string, hash: string): Promise<void> {


        const mailContext = {
            siteAddress: CoreConfig.siteAddress,
            emailActivateTitle: i18next.t('auth.emailActivateTitle'),
            emailActivateGuide: i18next.t('auth.emailActivateGuide'),
            emailActivateHash: i18next.t('auth.emailActivateHash'),
            hash: hash,
            emailActivationPage: i18next.t('auth.emailActivationPage'),
            emailActivateIgnore: i18next.t('auth.emailActivateIgnore'),
            emailActivateAccount: i18next.t('auth.emailActivateAccount'),
        };

        const template = await ejs.renderFile('./dist/modules/auth/views/activation.html', mailContext);


        await this.smtpClient.connect({
            hostname: CoreConfig.email.host,
            port: CoreConfig.email.port,
            username: CoreConfig.email.auth.user,
            password: CoreConfig.email.auth.pass
        });

        await this.smtpClient.send({
            from: CoreConfig.email.fromEmail,
            to: email,
            subject: CoreConfig.siteAddress + ' (' + i18next.t('api.events.emailActivation') + ')',
            content: "Mail Content",
            html: template.toString(),
        });

        await this.smtpClient.close();

        if (this.smtpClient) {
            throw new httpErrors.Conflict(i18next.t('auth.emailSendErrorActivation'));

        }
    }
}
