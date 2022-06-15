import dataBaseConnection from "../../../core/database/database.relationship.ts";
import {IPermission} from "../interfaces/permission.interface.ts";
export const PermissionModel = dataBaseConnection.database().collection<IPermission>("permission");
