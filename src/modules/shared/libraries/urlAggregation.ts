import {
    AggregatePipeLine,
    IOptionPagination, ISearch,
    QueryUrl,
    UrlAggregationInterface
} from "../interfaces/urlAggregationInterface.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import {changeKeyObject, convertFunctionType, convertSignType, parseString} from "../utils/parse.str.helper.ts";
import {SearchFunctionType} from "../enum/search.function.ts";
import {isEmpty} from "../utils/is.empty.ts";

export class UrlAggregation implements UrlAggregationInterface {

    private queryUrl: QueryUrl;
    private _OptionPagination: IOptionPagination;
    private pipeLine: AggregatePipeLine[];


    constructor(queryUrl: string, private isSubDocument: boolean) {


        const parseUri: QueryUrl = queryString.parse(queryUrl,{ arrayFormat: "index" });
        parseUri.sort = parseUri.sort ?? 'id';
        parseUri.order = parseUri.order ?? 1;
        parseUri.page = parseUri.page ?? 1;
        parseUri.limit = parseUri.limit ?? 10;

        if (parseUri.q) {
            parseUri.q = parseString(parseUri.q.toString());
            parseUri.q = queryString.parse(parseUri.q,{ arrayFormat: "index" });
        }

        if (isSubDocument == false) {
            this._OptionPagination = {
                limit: parseUri.limit,
                page: parseUri.page
            };
        } else {
            this._OptionPagination = {
                limit: parseUri.limit,
                page: (parseUri.page - 1) * parseUri.limit
            };
        }


        this.queryUrl = parseUri;
        this.pipeLine = [];
    }


    public getPipeLine(defaultPipeline?: AggregatePipeLine[]): AggregatePipeLine[] {


        if (this.queryUrl.sort) {
            let obj: AggregatePipeLine = { $sort: { $$$: +this.queryUrl.order! } };
            obj = changeKeyObject(obj, "\"$$$\"", "\"" + this.queryUrl.sort + "\"");
            this.pipeLine.push(obj);
        }

        if (this.queryUrl.filed) {
            let temp: object;
            let combine: object = {};
            this.queryUrl.filed.split(",").forEach(filed => {
                temp = { $$$: 1 };
                temp = changeKeyObject(temp, "\"$$$\"", "\"" + filed + "\"");
                Object.assign(combine, temp);
            });

            this.pipeLine.push({ $project: combine });
        }

        if (!isEmpty(defaultPipeline!)) {

            const temp: AggregatePipeLine[] = this.pipeLine;
            this.pipeLine = defaultPipeline!;
            this.pipeLine = [...this.pipeLine, ...temp];

        }

        return this.pipeLine;
    }


    get OptionPagination(): IOptionPagination {
        return this._OptionPagination;
    }

    public subDocumentPagination(): void {


        this._OptionPagination = {
            limit: this.queryUrl.limit!,
            page: (this.queryUrl.page! - 1) * this.queryUrl.limit!
        };

    }


    encodeQueryParam(key: string, value: string, $function: string, sign: string): string {

        let obj: any = {
            $$$: {
                val: value,
                fun: $function,
                sgn: sign
            }
        };

        obj = changeKeyObject(obj, "\"$$$\"", "\"" + key + "\"");

        return "q=" + encodeURIComponent(JSON.stringify(obj));
    }

    decodeQueryParam(): this {


        const arrayParams: any[] = isEmpty(this.queryUrl.q!) ? [] : Object.entries(this.queryUrl.q!);
        for (let i = 0; i < arrayParams.length; i++) {
            let key: string = arrayParams[i][0];

            const valueSearch: ISearch = JSON.parse(arrayParams[i][1]);

            if (convertFunctionType(valueSearch.fun!) == SearchFunctionType.match) {
                //    { $match: { <query> } }
                if (valueSearch?.sgn != undefined) {
                    let obj: any = { $$$: valueSearch.val };
                    obj = changeKeyObject(obj, "\"$$$\"", "\"" + convertSignType(valueSearch.sgn) + "\"");
                    obj = { $$$: obj };
                    obj = changeKeyObject(obj, "\"$$$\"", "\"" + key + "\"");
                    obj = { $$$: obj };
                    obj = changeKeyObject(obj, "\"$$$\"", "\"" + convertFunctionType(valueSearch.fun!) + "\"");
                    this.pipeLine.push(obj);
                } else {

                    let obj: any = { $$$: valueSearch.val };
                    obj = changeKeyObject(obj, "\"$$$\"", "\"" + key + "\"");
                    obj = { $$$: obj };
                    obj = changeKeyObject(obj, "\"$$$\"", "\"" + convertFunctionType(valueSearch.fun!) + "\"");
                    this.pipeLine.push(obj);
                }

            }
            if (convertFunctionType(valueSearch.fun!) == SearchFunctionType.nin ||
                convertFunctionType(valueSearch.fun!) == SearchFunctionType.in) {
                // pattern { field: { $nin: [<value1>, <value2>, ... <valueN> ] } }
                let obj: any = { $$$: valueSearch.val };
                obj = changeKeyObject(obj, "\"$$$\"", "\"" + convertFunctionType(valueSearch.fun!) + "\"");
                obj = { $$$: obj };
                obj = changeKeyObject(obj, "\"$$$\"", "\"" + key + "\"");
                this.pipeLine.push(obj);
            }
            if (convertFunctionType(valueSearch.fun!) == SearchFunctionType.regex) {
                // { <field>: { $regex: /pattern/, $options: '<options>' } }

                let obj: any = { $$$: valueSearch.val, $options: "i" };
                obj = changeKeyObject(obj, "\"$$$\"", "\"" + convertFunctionType(valueSearch.fun!) + "\"");
                obj = { $$$: obj };
                obj = changeKeyObject(obj, "\"$$$\"", "\"" + key + "\"");
                this.pipeLine.push(obj);
            }


        }


        return this;

    }

    public resetPipeLine(): this {
        this.pipeLine = [];
        return this;
    }

}
