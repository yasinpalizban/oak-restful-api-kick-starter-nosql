import {Status,httpErrors} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ServiceInterface} from "../../shared/interfaces/service.interface.ts";
import {isEmpty} from "../../shared/utils/is.empty.ts";
import {UrlAggregation} from "../../shared/libraries/urlAggregation.ts";
import {IGroup, IGroupPagination} from "../interfaces/group.interface.ts";
import {GroupEntity} from "../entities/group.entity.ts";
import {GroupModel} from "../models/group.model.ts";
import {AggregatePipeLine} from "../../shared/interfaces/urlAggregationInterface.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";

export default class GroupService implements ServiceInterface {
    public model = GroupModel;

    public async index(urlAggregation: UrlAggregation): Promise<IGroupPagination> {

        const pipeLine: AggregatePipeLine[] = urlAggregation.decodeQueryParam().getPipeLine();

        const data: IGroup[] | any = await this.model.aggregate(pipeLine);

        return {data, pagination: undefined};
    }

    public async show(id: string): Promise<IGroup> {
        if (isEmpty(id)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const dataById: IGroup[] | any = await this.model.aggregate([
            {
                $match: {_id: new Bson.ObjectId(id)}
            }
        ]).toArray();
        if (!dataById) throw new httpErrors.Conflict(i18next.t("api.commons.exist"));

        return dataById;

    }

    public async create(entity: GroupEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const createData: any = await this.model.insertOne(entity);
        if (!createData) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

    }

    public async update(id: string, entity: GroupEntity): Promise<void> {
        if (isEmpty(id) || isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const updateById: any =  await this.model.updateOne({_id: id}, entity);
        if (!updateById) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));


    }

    public async delete(id: string): Promise<void> {
        if (isEmpty(id)) throw new httpErrors.BadRequest( i18next.t('api.commons.reject'));

        await this.model.deleteOne({_id: id});

    }
}
