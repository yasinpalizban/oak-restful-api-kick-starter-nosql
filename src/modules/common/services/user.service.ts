import {Status, httpErrors} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ServiceInterface} from "../../shared/interfaces/service.interface.ts";
import {isEmpty} from "../../shared/utils/is.empty.ts";
import {UrlAggregation} from "../../shared/libraries/urlAggregation.ts";
import {IUser, IUserPagination} from "../../auth/interfaces/user.interface.ts";
import {UserEntity} from "../entities/user.entity.ts";
import {UserModel} from "../../auth/models/user.model.ts";
import {GroupModel} from "../../auth/models/group.model.ts";
import {AggregatePipeLine} from "../../shared/interfaces/urlAggregationInterface.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";
import {IGroup} from "../../auth/interfaces/group.interface.ts";

export default class UserService implements ServiceInterface {
    public userModel = UserModel;
    public groupModel = GroupModel;

    public async index(urlAggregation: UrlAggregation): Promise<IUserPagination> {

        const defaultPipeLine: AggregatePipeLine[] = [
            {
                $lookup: {
                    from: "auth_groups",
                    localField: "_id",
                    foreignField: "members.userId",
                    as: "_group"
                }
            },
            {$unwind: "$_group"},
            {
                $addFields: {
                    group: "$_group.name"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    root: {$mergeObjects: "$$ROOT"}
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

        ];
        const pipeLine: AggregatePipeLine[] = urlAggregation.decodeQueryParam().getPipeLine(defaultPipeLine);

        const data: IUser[] | any = this.userModel.aggregate(pipeLine);
        return {data: data, pagination: undefined};
    }

    public async show(id: string): Promise<IUser> {
        if (isEmpty(id)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));


        const dataById: IUser[] | any = await this.userModel.aggregate([
            {
                $match: {_id: new Bson.ObjectId(id)}
            },
            {
                $lookup: {
                    from: "auth_groups",
                    localField: "_id",
                    foreignField: "members.userId",
                    as: "_group"
                }
            },
            {$unwind: "$_group"},
            {
                $addFields: {
                    group: "$_group.name"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    root: {$mergeObjects: "$$ROOT"}
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
        if (!dataById) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));
        return dataById;
    }

    public async create(entity: UserEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        if (entity.email) {
            const isEmailUserValid: IUser | any = await this.userModel.findOne({email: entity.email});
            if (isEmailUserValid) throw new httpErrors.Conflict(i18next.t("auth.youAreEmail"));
        }
        if (entity.phone) {
            const isPhoneUserValid: IUser | any = await this.userModel.findOne({phone: entity.phone});
            if (isPhoneUserValid) throw new httpErrors.Conflict(i18next.t("auth.yourArePhone"));
        }
        const userRole: string = entity.role!;
        delete entity.role;
        const createData: IUser | any = await this.userModel.insertOne(entity);

        if (!createData) throw  new httpErrors.Conflict(i18next.t('api.commons.reject'));

        const newRole: object = {userId: createData._id};

        await this.groupModel.updateOne({name: userRole}, {$push: {"members": newRole}});

    }

    public async update(id: string, entity: UserEntity): Promise<void> {
        if (isEmpty(id) || isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const userRole: string = entity.role!;
        delete entity.role;

        const updateById: IUser | any = await this.userModel.updateOne({_id: id}, {$push: {}});
        if (!updateById) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

        const newRole: object = {userId: updateById._id};

        const oldRole: IGroup | any = await this.groupModel.findOne({"members.userId": id});

        if (userRole != oldRole.name) {
            await this.groupModel.updateOne({_id: oldRole._id}, {$pull: {"members": {userId: id}}});

            await this.groupModel.updateOne({name: userRole}, {$push: {"members": newRole}});

        }

    }

    public async delete(id: string): Promise<void> {
        if (isEmpty(id)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        await this.userModel.deleteOne({_id: id});

    }
}
