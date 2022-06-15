import {Status, httpErrors} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ServiceInterface} from "../../shared/interfaces/service.interface.ts";
import {isEmpty} from "../../shared/utils/is.empty.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";

import {UrlAggregation} from "../../shared/libraries/urlAggregation.ts";
import {ISetting, ISettingPagination} from "../interfaces/setting.interface.ts";
import {SettingEntity} from "../entities/setting.entity.ts";
import {SettingModel} from "../models/setting.model.ts";
import {AggregatePipeLine} from "../../shared/interfaces/urlAggregationInterface.ts";

export default class SettingService implements ServiceInterface {
    public model = SettingModel;

    public async index(urlAggregation: UrlAggregation): Promise<ISettingPagination> {

        const pipeLine: AggregatePipeLine[] = urlAggregation.decodeQueryParam().getPipeLine();

        const data: ISetting[] | any = await this.model.aggregate(pipeLine);

        return {data, pagination: undefined};

    }

    public async show(id: string): Promise<ISetting[]> {
        if (isEmpty(id)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const dataById: ISetting[] | any = await this.model.aggregate([
            {
                $match: {_id: new Bson.ObjectId(id)}
            }
        ]).toArray();
        if (!dataById) throw new httpErrors.Conflict(i18next.t("api.commons.exist"));

        return dataById;
    }

    public async create(entity: SettingEntity): Promise<void> {
        if (isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const createData: any = await this.model.insertOne(entity);
        if (!createData) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

    }

    public async update(id: string, entity: SettingEntity): Promise<void> {
        if (isEmpty(id) || isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const updateById: any =  await this.model.updateOne({_id: id}, entity);
        if (!updateById) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

    }

    public async delete(id: string): Promise<void> {
        if (isEmpty(id)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        await this.model.deleteOne({_id: id});

    }
}
