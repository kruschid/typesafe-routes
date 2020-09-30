declare type IfTrue<A, T, E> = A extends true ? true extends A ? T : E : E;
export declare type InferParam<T extends string, M extends [string, string]> = T extends `:${infer O}?` ? [M[0], M[1] | O] : T extends `:${infer O}*` ? [M[0], M[1] | O] : T extends `:${infer O}+` ? [M[0] | O, M[1]] : T extends `:${infer O}` ? [M[0] | O, M[1]] : M;
export declare type InferParamGroups<P extends string> = P extends `${infer A}/${infer B}` ? InferParam<A, InferParamGroups<B>> : P extends `${infer A}&${infer B}` ? InferParam<A, InferParamGroups<B>> : InferParam<P, [never, never]>;
export declare type MergeParamGroups<G extends [string, string]> = G[0] | G[1];
export declare type RequiredParamNames<G extends [string, string]> = G[0];
export declare type OptionalParamNames<G extends [string, string]> = G[1];
declare type SerializedParams<K extends string = string> = Record<K, string>;
declare type ChildrenMap = Record<string, RouteNode<any, any, any>>;
declare type ParserMap<K extends string> = Record<K, Parser<any>>;
export declare type ExtractParserReturnTypes<P extends ParserMap<any>, F extends keyof P> = {
    [K in F]: ReturnType<P[K]["parse"]>;
};
declare type RouteFn<IS_RECURSIVE = false> = <T extends string, // extending string here ensures successful literal inference
PM extends ParserMap<MergeParamGroups<InferParamGroups<T>>>, C extends ChildrenMap>(templateWithQuery: T, parserMap: PM, children: C) => RouteNode<T, PM, C, IS_RECURSIVE>;
declare type RecursiveRouteFn = RouteFn<true>;
export declare type RouteNode<T extends string, PM extends ParserMap<MergeParamGroups<InferParamGroups<T>>>, C extends ChildrenMap, IS_RECURSIVE = false> = {
    parseParams: <G extends InferParamGroups<T>>(params: SerializedParams<RequiredParamNames<G>> & Partial<SerializedParams<OptionalParamNames<G>>>, strict?: boolean) => ExtractParserReturnTypes<PM, RequiredParamNames<G>> & Partial<ExtractParserReturnTypes<PM, OptionalParamNames<G>>>;
    templateWithQuery: T;
    template: string;
    children: C;
    parserMap: PM;
} & (<G extends InferParamGroups<T>>(params: ExtractParserReturnTypes<PM, RequiredParamNames<G>> & Partial<ExtractParserReturnTypes<PM, OptionalParamNames<G>>>) => {
    $: string;
} & {
    [K in keyof C]: C[K];
} & IfTrue<IS_RECURSIVE, {
    $self: RouteNode<T, PM, C, true>;
}, {}>);
export interface Parser<T> {
    parse: (s: string) => T;
    serialize: (x: T) => string;
}
export declare const stringParser: Parser<string>;
export declare const floatParser: Parser<number>;
export declare const intParser: Parser<number>;
export declare const dateParser: Parser<Date>;
export declare const booleanParser: Parser<boolean>;
export declare const route: RouteFn;
export declare const recursiveRoute: RecursiveRouteFn;
export {};
