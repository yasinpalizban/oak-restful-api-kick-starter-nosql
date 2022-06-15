import dataBaseConnection from "../../../core/database/database.relationship.ts";
import {IIpActivity} from "../interfaces/ip.activity.interface.ts";

export const IpActivityModel = dataBaseConnection.database().collection<IIpActivity>("ip_activity");
