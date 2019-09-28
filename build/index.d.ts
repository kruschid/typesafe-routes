import { IStringifyOptions } from "qs";
export declare type WithParams<T> = {
    [K in keyof T]: T[K] extends Fn ? {
        params: UnionToIntersection<ExcludeString<Parameters<T[K]>>[number]>;
        children: WithParams<ReturnType<T[K]>>;
    } : WithParams<T[K]>;
};
declare type ExcludeString<T> = T extends string[] ? never : T;
declare type Fn = (...args: any) => any;
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
export declare const QUERY_FORMATTER: unique symbol;
export declare class QueryParams<T extends Record<string, any>> {
    private params;
    private options?;
    [QUERY_FORMATTER]: boolean;
    constructor(params: T, options?: IStringifyOptions | undefined);
    toString(): string;
}
export declare const Ruth: <T extends Record<string, any>>(t: T, prefix?: string) => T;
export {};
