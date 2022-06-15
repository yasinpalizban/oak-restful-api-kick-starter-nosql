import {Status, httpErrors} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ServiceInterface} from "../../shared/interfaces/service.interface.ts";

import {isEmpty} from "../../shared/utils/is.empty.ts";
import {UrlAggregation} from "../../shared/libraries/urlAggregation.ts";
import {IPermission, IPermissionPagination} from "../interfaces/permission.interface.ts";
import {PermissionEntity} from "../entities/permission.entity.ts";
import {IGroup} from "../interfaces/group.interface.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";
import {PermissionModel} from "../models/permission.model.ts";
import {AggregatePipeLine} from "../../shared/interfaces/urlAggregationInterface.ts";

export default class PermissionService implements ServiceInterface {
    public model = PermissionModel;

    public async index(urlAggregation: UrlAggregation): Promise<IPermissionPagination> {


        const defaultPipeline: AggregatePipeLine[] = [{
            $project: { users: 0, groups: 0 }
        }];

        const pipeLine: AggregatePipeLine[] = urlAggregation.decodeQueryParam().getPipeLine(defaultPipeline);
        // @ts-ignore
        const data: IPermission[] = await this.permissionModel.aggregate(pipeLine);


        return { data: data, pagination: undefined };

    }

    public async show(id: string): Promise<IPermission> {
        if (isEmpty(id)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));


        const dataById: IGroup[] | any = await this.model.aggregate([
            {
                $match: {_id: new Bson.ObjectId(id)}
            }
        ]).toArray();
        if (!dataById) throw new httpErrors.Conflict(i18next.t("api.commons.exist"));

        return dataById;
    }

    public async create(entity: PermissionEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

        const createData: any = await this.model.insertOne(entity);
        if (!createData) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

    }

    public async update(id: string, entity: PermissionEntity): Promise<void> {
        if (isEmpty(id) || isEmpty(entity)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

        const updateById: any =  await this.model.updateOne({_id: id}, entity);
        if (!updateById) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));


    }

    public async delete(id: string): Promise<void> {
        if (isEmpty(id)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

          await this.model.deleteOne({_id: id});

    }
}
