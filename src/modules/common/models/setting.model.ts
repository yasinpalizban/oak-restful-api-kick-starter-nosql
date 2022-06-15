import dataBaseConnection from "../../../core/database/database.relationship.ts";
import {ISetting} from "../interfaces/setting.interface.ts";
export const SettingModel = dataBaseConnection.database().collection<ISetting>("settings");
