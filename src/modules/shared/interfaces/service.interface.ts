import {UrlAggregation} from "../libraries/urlAggregation.ts";


export declare interface ServiceInterface {

  index?(urlAggregation?: UrlAggregation): Promise<any[] | any>;

  show?(id: string): Promise<any>;

  create?(data: any): Promise<void | any>;

  update?(id: string, data: any): Promise<void | any>;

  delete?(id: string, foreignKey?: string): Promise<void>;
}


