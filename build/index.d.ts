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
export declare const HAS_QUERY_PARAMS: unique symbol;
export declare type QueryParams<T extends Record<string, any>> = T & {
    [HAS_QUERY_PARAMS]: true;
};
export declare const queryParams: <T extends Record<string, any>>(params: T) => QueryParams<T>;
export declare const R: <T extends Route>(path?: string, queryParams?: any, renderSearchQuery?: <T_1>(queryParams: QueryParams<T_1>) => string) => RouteFn<T>;
export {};
