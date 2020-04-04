import { IStringifyOptions } from "qs";
export declare type Route = {
    name: string;
    params: Array<string | Record<string, any>>;
    children?: Route;
};
export declare type RouteFn<T extends Route> = {
    [N in T["name"]]: <K extends Route = Extract<T, {
        name: N;
    }>>(...params: K["params"]) => RouteFn<NonNullable<K["children"]>>;
} & {
    $: string;
};
export declare type RouteParams<T extends Route> = UnionToIntersection<ExcludeString<T["params"]>[number]>;
declare type ExcludeString<T> = T extends string[] ? never : T;
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
export declare const R: <T extends Route>(prevPath?: string, prevQuery?: QueryParams<any>) => RouteFn<T>;
export declare const QUERY_FORMATTER: unique symbol;
export declare class QueryParams<T extends Record<string, any>> {
    private params;
    private options?;
    [QUERY_FORMATTER]: boolean;
    constructor(params: T, options?: IStringifyOptions | undefined);
    merge(other: QueryParams<any>): this;
    toString(): string;
}
export {};
