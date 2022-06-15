import dataBaseConnection from "../../../core/database/database.relationship.ts";
import {IGroup} from "../interfaces/group.interface.ts";

export const GroupModel = dataBaseConnection.database().collection<IGroup>("groups");
