import { Key, parse, Token } from "path-to-regexp";
import { stringify } from "qs";

type IfTrue<A, T, E> = A extends true ? true extends A ? T : E : E;

export type InferParam<T extends string, M extends [string, string]> =
  T extends `:${infer O}?` ? [M[0], M[1] | O]
  : T extends `:${infer O}*` ? [M[0], M[1] | O]
  : T extends `:${infer O}+` ? [M[0] | O, M[1]]
  : T extends `:${infer O}` ? [M[0] | O, M[1]]
  : M;

export type InferParamGroups<P extends string> =
  P extends `${infer A}/${infer B}` ? InferParam<A, InferParamGroups<B>>
  : P extends `${infer A}&${infer B}` ? InferParam<A, InferParamGroups<B>>
  : InferParam<P, [never, never]>;

export type MergeParamGroups<G extends [string, string]> = G[0] | G[1];

export type RequiredParamNames<G extends [string, string]> = G[0];

export type OptionalParamNames<G extends [string, string]> = G[1];

type SerializedParams<K extends string = string> = Record<K, string>;

type RawParams = Record<string, unknown>; 

type ChildrenMap = Record<string, RouteNode<any, any, any>>;

type ParserMap<K extends string> = Record<K, Parser<any>>;

export type ExtractParserReturnTypes<
  P extends ParserMap<any>,
  F extends keyof P,
> = {
  [K in F]: ReturnType<P[K]["parse"]>;
}

interface RouteFnContext {
  previousQueryParams?: SerializedParams,
  previousPath?: string,
}

type RouteFn<IS_RECURSIVE = false> = <
  T extends string, // extending string here ensures successful literal inference
  PM extends ParserMap<MergeParamGroups<InferParamGroups<T>>>,
  C extends ChildrenMap,
>(
  templateWithQuery: T,
  parserMap: PM,
  children: C,
) => RouteNode<T, PM, C, IS_RECURSIVE>;

type RecursiveRouteFn = RouteFn<true>;

export type RouteNode<
  T extends string,
  PM extends ParserMap<MergeParamGroups<InferParamGroups<T>>>,
  C extends ChildrenMap,
  IS_RECURSIVE = false,
> = {
  parseParams: <G extends InferParamGroups<T>>(
    params: SerializedParams<RequiredParamNames<G>>
      & Partial<SerializedParams<OptionalParamNames<G>>>,
    strict?: boolean, 
  ) => ExtractParserReturnTypes<PM, RequiredParamNames<G>>
    & Partial<ExtractParserReturnTypes<PM, OptionalParamNames<G>>>;
  templateWithQuery: T;
  template: string;
  children: C;
  parserMap: PM;
} & (
  <G extends InferParamGroups<T>>(
    params: ExtractParserReturnTypes<PM, RequiredParamNames<G>>
      & Partial<ExtractParserReturnTypes<PM, OptionalParamNames<G>>>
  ) => {
    $: string;
  } & {
    [K in keyof C]: C[K];
  } & IfTrue<
    IS_RECURSIVE,
    { $self: RouteNode<T, PM, C, true> },
    { }
  >
);

export interface Parser<T> {
  parse: (s: string) => T;
  serialize: (x: T) => string;
}

export const stringParser: Parser<string> = {
  parse: (s) => s,
  serialize: (s) => s,
}
export const floatParser: Parser<number> = {
  parse: (s) => parseFloat(s),
  serialize: (x) => x.toString(),
}
export const intParser: Parser<number> = {
  parse: (s) => parseInt(s),
  serialize: (x) => x.toString(),
}
export const dateParser: Parser<Date> = {
  parse: (s) => new Date(s),
  serialize: (d) => d.toISOString(),
}
export const booleanParser: Parser<boolean> = {
  parse: (s) => s === "true",
  serialize: (b) => b.toString(),
}

const isKey = (x: Token): x is Key => !!(x as Key).name;

const filterParserMap = (
  parserMap: ParserMap<any>,
  tokens: Token[],
): ParserMap<any> =>
  tokens.reduce<ParserMap<any>>((acc, t: Token) =>
    !isKey(t) ? acc : {...acc, [t.name]: parserMap[t.name]},
    {},
  );

type ParsedRouteMeta = ReturnType<typeof parseRoute>;
const parseRoute = (
  pathWithQuery: string,
  parserMap: ParserMap<any>,
) => {
  const [pathTemplate, ...queryFragments] = pathWithQuery.split("&");
  const queryTemplate = queryFragments.join("/");
  const pathTokens = parse(pathTemplate).map((t) =>
    isKey(t) ? {
      ...t,
      name: typeof t.name === "string"
        ? t.name.replace(/\//g, "")
        : t.name
    } : t.replace(/\//g, "")
  );
  const queryTokens = parse(queryTemplate);
  const pathParamParsers =  filterParserMap(parserMap, pathTokens);
  const queryParamParsers = filterParserMap(parserMap, queryTokens);
  return {
    pathTemplate,
    pathTokens,
    queryTokens,
    pathParamParsers,
    queryParamParsers,
    parserMap,
  };
}

const stringifyParams = (
  parserMap: ParserMap<any>,
  params: RawParams,
): Record<string, string> =>
  Object.keys(parserMap).reduce((acc, k) => ({
    ...acc, ...(
      params[k] ? {[k]: parserMap[k].serialize(params[k]) } : {}
    ),
  }), {});

export const route: RouteFn = function(
  this: RouteFnContext,
  templateWithQuery,
  parserMap,
  children,
){
  // DEBUG:
  // console.log("route", {templateWithQuery, parserMap});
  const parsedRoute = parseRoute(templateWithQuery, parserMap);
  return new Proxy<any>(() => {}, {
    apply: (_, __, [rawParams]: [RawParams]) =>
      routeWithParams(
        parsedRoute,
        children,
        rawParams,
        this.previousQueryParams ?? {},
        this.previousPath ?? "",
      ),
    get: (target, next, receiver) =>
      ({
        templateWithQuery,
        children,
        parserMap,
        template: parsedRoute.pathTemplate,
        parseParams: paramsParser(parsedRoute),
      } as any)[next] ?? (
        Reflect.get(target, next, receiver)
      )
  });
}

export const recursiveRoute: RecursiveRouteFn = route as any;

const routeWithParams = (
  { pathTokens, pathTemplate, queryParamParsers, pathParamParsers, parserMap }: ParsedRouteMeta,
  children: ChildrenMap,
  rawParams: RawParams,
  previousQueryParams: SerializedParams,
  previousPath: string,
) =>
  new Proxy<any>({}, {
    get: (target, next, receiver) => {
      const pathParams = stringifyParams(pathParamParsers, rawParams);
      const queryParams = {
        ...previousQueryParams,
        ...stringifyParams(queryParamParsers, rawParams),
      };
      return "$" === next
        // full path with search query
        ? `${previousPath}/${stringifyRoute(pathTokens, pathParams, queryParams)}`
        : next === Symbol.toPrimitive ? () =>
          `${previousPath}/${stringifyRoute(pathTokens, pathParams, queryParams)}`
        // recursive reference
        : next === "$self" ? route.call(
            {
              previousPath: `${previousPath}/${stringifyRoute(pathTokens, pathParams)}`,
              previousQueryParams: queryParams,
            } as RouteFnContext,
            pathTemplate,
            parserMap,
            children,
          )
        // child route
        : typeof next == "string" && children[next] ? route.call(
            {
              previousPath: `${previousPath}/${stringifyRoute(pathTokens, pathParams)}`,
              previousQueryParams: queryParams,
            } as RouteFnContext,
            children[next].templateWithQuery,
            children[next].parserMap,
            children[next].children,
          )
        : Reflect.get(target, next,receiver);
    }
  });

const stringifyRoute = (
  pathTokens: Token[],
  params: SerializedParams,
  queryParams?: SerializedParams,
): string =>
  pathTokens.map((t) =>
    isKey(t) ? params[t.name] : t,
  )
  .filter((x) => !!x)
  .map(encodeURIComponent)
  .join("/") + (
    queryParams ? stringify(queryParams, { addQueryPrefix: true }) : ""
  );

const paramsParser = (
  { pathTokens, queryTokens, parserMap }: ParsedRouteMeta,
) => (
  params: SerializedParams,
  strict = false,
): RawParams => {
  const parsedParams = Object.keys(params)
    .reduce<RawParams>((acc, k) => ({
      ...acc,
      ...(parserMap[k] ? {
        [k]: parserMap[k].parse(params[k])
      } : {}),
    }), {});
  if( strict ) {
    pathTokens.concat(queryTokens)
    .forEach((t) => {
      if(isKey(t) && ["", "+"].includes(t.modifier) && !parsedParams[t.name]) {
        throw Error(`[parseParams]: parameter "${t.name}" is required but is not defined`);
      }
    })
  }
  return parsedParams;
}
