import {Status, httpErrors} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ServiceInterface} from "../../shared/interfaces/service.interface.ts";
import {isEmpty} from "../../shared/utils/is.empty.ts";
import {UrlAggregation} from "../../shared/libraries/urlAggregation.ts";
import {IUserPermission, IUserPermissionPagination} from "../interfaces/user.permission.interface.ts";
import {UserPermissionEntity} from "../entities/user.permission.entity.ts";
import {PermissionModel} from "../models/permission.model.ts";
import {IPermission} from "../interfaces/permission.interface.ts";
import {AggregatePipeLine} from "../../shared/interfaces/urlAggregationInterface.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";
import {IGroupPermission} from "../interfaces/group.permission.interface.ts";
import {paginationFields} from "../../shared/utils/pagntaion.fields.ts";
import {IPagination} from "../../shared/interfaces/pagination.ts";

export default class UserPermissionService implements ServiceInterface {
    public model = PermissionModel;
    private nestId: string;
    constructor() {
        this.nestId = "";
    }
    public setNestId(id: string) {
        this.nestId = id;
        return this;
    }
    public async index(urlAggregation: UrlAggregation): Promise<IUserPermissionPagination> {


        const defaultPipeline: AggregatePipeLine[] =
            [
                {
                    $project: {
                        groups: {
                            $slice: ["$groups", urlAggregation.OptionPagination.page
                                , urlAggregation.OptionPagination.limit]
                        },
                        permission: "$name", permissionId: "$_id", _id: 0

                    }

                }
                ,
                { $unwind: "$groups" },

                {
                    $replaceRoot: { newRoot: { $mergeObjects: ["$groups", "$$ROOT"] } }
                },
                { $project: { groups: 0 } },
                {
                    $lookup: {
                        from: "auth_groups",
                        pipeline: [
                            { $project: { _id: 0, name: 1 } }
                        ],
                        localField: "groupId",
                        foreignField: "_id",
                        as: "auth_group"
                    }
                },
                {
                    $addFields: {
                        "group": {
                            "$arrayElemAt": ["$auth_group.name", 0]
                        }
                    }
                },
                {
                    $project: {
                        auth_group: 0
                    }
                }


            ];

        const defaultPagination: AggregatePipeLine[] = [

            {
                $project: {
                    _id: 0,
                    totalDocs: { $size: "$groups" }
                }
            },
            {
                $addFields: paginationFields(urlAggregation.OptionPagination.limit, urlAggregation.OptionPagination.page,10)

            }];

        if (!isEmpty(this.nestId)) {

            defaultPipeline.unshift({ $match: { "_id": new Bson.ObjectId(this.nestId) } });
            defaultPagination.unshift({ $match: { "_id": new Bson.ObjectId(this.nestId) } });
        }



        let pipeLine: AggregatePipeLine[] = urlAggregation.decodeQueryParam().getPipeLine(defaultPipeline);
        const data: IGroupPermission[]| any = await this.model.aggregate(pipeLine);
        pipeLine = urlAggregation.resetPipeLine().decodeQueryParam().getPipeLine(defaultPagination);
        const pagination: IPagination[]|any = await this.model.aggregate(pipeLine);

        return { data: data, pagination: pagination[0] };
    }

    public async show(id: string): Promise<IUserPermission> {
        if (isEmpty(id) && isEmpty(this.nestId))  throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

        const pipeline: AggregatePipeLine[] =
            [
                { $match: { "_id": new  Bson.ObjectId(this.nestId) } },

                { $unwind: "$groups" },
                { $match: { "groups._id":new Bson.ObjectId(id) } },
                { $project: { groups: 1, permission: "$name", permissionId: "$_id", _id: 0 } },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: ["$groups", "$$ROOT"] } }
                },
                { $project: { groups: 0 } },
                {
                    $lookup: {
                        from: "auth_groups",
                        pipeline: [
                            { $project: { _id: 0, name: 1 } }
                        ],
                        localField: "groupId",
                        foreignField: "_id",
                        as: "auth_group"
                    }
                },
                {
                    $addFields: {
                        "group": {
                            "$arrayElemAt": ["$auth_group.name", 0]
                        }
                    }
                },
                { $project: { auth_group: 0 } }


            ];


        const data: IGroupPermission[]|any = await this.model.aggregate(pipeline);

        if (!data) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

        return data;



    }

    public async create(entity: UserPermissionEntity): Promise<void> {
        if (isEmpty(entity) && isEmpty(this.nestId)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

        //
        // const createData: IPermission| any =  await this.model.updateOne({
        //         _id: this.nestId,
        //     }, { $push: { "users": entity } },
        // );
        // if (!createData) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

    }

    public async update(id: string, entity: UserPermissionEntity): Promise<void> {
        if (isEmpty(entity) && isEmpty(this.nestId) && isEmpty(id))  throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));


        await this.model.updateOne({
                _id: this.nestId,
                groups: { $elemMatch: { _id: id } }
            }, { $set: { "users.$": entity } },
             );

    }

    public async delete(id: string): Promise<void> {
        if (isEmpty(id)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));
            await this.model.updateOne({
                _id: this.nestId,
                groups: { $elemMatch: { _id: id } }
            },
            { $pull: { "users": { _id: id } } });

    }
}
