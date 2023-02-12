import { Parser } from "./parser";
declare type If<C, T, E> = C extends true ? true extends C ? T : E : E;
interface ParamNames<R extends string = string, O extends string = string> {
    required: R;
    optional: O;
}
declare type WithOptionalParam<PG extends ParamNames, P extends string> = ParamNames<PG["required"], PG["optional"] | P>;
declare type WithRequiredParam<PG extends ParamNames, P extends string> = ParamNames<PG["required"] | P, PG["optional"]>;
export declare type InferParam<T extends string, PG extends ParamNames> = T extends `:${infer P}?` ? WithOptionalParam<PG, P> : T extends `:${infer P}*` ? WithOptionalParam<PG, P> : T extends `:${infer P}+` ? WithRequiredParam<PG, P> : T extends `:${infer P}` ? WithRequiredParam<PG, P> : PG;
export declare type InferParamFromPath<P extends string> = P extends `${infer A}/${infer B}` ? InferParam<A, InferParamFromPath<B>> : P extends `${infer A}&${infer B}` ? InferParam<A, InferParamFromPath<B>> : InferParam<P, {
    required: never;
    optional: never;
}>;
export declare type AllParamNames<G extends ParamNames> = G["required"] | G["optional"];
declare type SerializedParams<K extends string = string> = Record<K, string>;
declare type ChildrenMap = Record<string, RouteNode<any, any, any>>;
declare type ParserMap<K extends string> = Record<K, Parser<any>>;
export declare type ExtractParserReturnTypes<P extends ParserMap<any>, F extends keyof P> = {
    [K in F]: ReturnType<P[K]["parse"]>;
};
interface RouteFnContext {
    previousQueryParams?: SerializedParams;
    previousPath?: string;
}
declare type RouteFn<IS_RECURSIVE = false> = <T extends string, // extending string here ensures successful literal inference
PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>, C extends ChildrenMap>(templateWithQuery: T, parserMap: PM, children: C) => RouteNode<T, PM, C, IS_RECURSIVE>;
export declare type RouteNode<T extends string, PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>, C extends ChildrenMap, IS_RECURSIVE = false> = {
    parseParams: <G extends InferParamFromPath<T>>(params: SerializedParams<G["required"]> & Partial<SerializedParams<G["optional"]>>, strict?: boolean) => ExtractParserReturnTypes<PM, G["required"]> & Partial<ExtractParserReturnTypes<PM, G["optional"]>>;
    templateWithQuery: T;
    template: T extends `${infer BaseT}&${string}` ? BaseT : T;
    children: C;
    parserMap: PM;
} & (<G extends InferParamFromPath<T>>(params: ExtractParserReturnTypes<PM, G["required"]> & Partial<ExtractParserReturnTypes<PM, G["optional"]>>) => {
    $: string;
} & {
    [K in keyof C]: C[K];
} & If<IS_RECURSIVE, {
    $self: RouteNode<T, PM, C, true>;
}, {}>);
export declare function routeFn<T extends string, // extending string here ensures successful literal inference
PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>, C extends ChildrenMap>(this: RouteFnContext | void, templateWithQuery: T, parserMap: PM, children: C): RouteNode<T, PM, C>;
export declare const route: RouteFn;
export declare const recursiveRoute: RouteFn<true>;
export {};
