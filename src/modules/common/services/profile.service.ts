import {Status, httpErrors} from "https://deno.land/x/oak/mod.ts";
import i18next from 'https://deno.land/x/i18next/index.js';
import {ServiceInterface} from "../../shared/interfaces/service.interface.ts";
import {isEmpty} from "../../shared/utils/is.empty.ts";
import {Bson} from "https://deno.land/x/mongo@v0.29.2/mod.ts";
import {IUser} from "../../auth/interfaces/user.interface.ts";
import {UserEntity} from "../entities/user.entity.ts";
import {authConfig} from "../../auth/configs/auth.config.ts";
import {deleteFile} from "../../shared/utils/delete.file.ts";
import {sharedConfig} from "../../shared/configs/shared.config.ts";
import {UserModel} from "../../auth/models/user.model.ts";

export default class ProfileService implements ServiceInterface {
    public userModel = UserModel;


    public async show(id: string): Promise<IUser> {

        if (isEmpty(id)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser| any = await this.userModel.findOne({ _id: id });
        if (!findUser) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));
        return findUser;

    }

    public async update(id: string, entity: UserEntity): Promise<void> {

        if (isEmpty(id) || isEmpty(entity)) throw new httpErrors.BadRequest(i18next.t('api.commons.reject'));

        const findUser: IUser | any = await this.userModel.findOne({_id: id});
        if (!findUser) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

        const updateUserById = await this.userModel.updateOne({_id: new Bson.ObjectId(id)},entity);
        if (!updateUserById) throw new httpErrors.Conflict(i18next.t('api.commons.exist'));

        if (findUser.image != authConfig.defaultUserProfile && entity.image !== undefined) await deleteFile(sharedConfig.appRoot + findUser.image);



    }

}
