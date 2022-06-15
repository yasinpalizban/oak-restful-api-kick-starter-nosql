import {IUser} from "../interfaces/user.interface.ts";
import dataBaseConnection from "../../../core/database/database.relationship.ts";
export const UserModel = dataBaseConnection.database().collection<IUser>("user");
