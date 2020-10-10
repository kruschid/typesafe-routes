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

type PathToken = string | PathParam;

interface PathParam {
  modifier: "" | "*" | "+" | "?";
  name: string;
}

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

const isPathParam = (x: PathToken): x is PathParam => typeof x !== "string";

const filterParserMap = (
  parserMap: ParserMap<any>,
  tokens: PathToken[],
): ParserMap<any> =>
  tokens.reduce<ParserMap<any>>((acc, t: PathToken) =>
    !isPathParam(t) ? acc : {...acc, [t.name]: parserMap[t.name]},
    {},
  );

type ParsedRouteMeta = ReturnType<typeof parseRoute>;
const parseRoute = (
  pathWithQuery: string,
  parserMap: ParserMap<any>,
) => {
  const [pathTemplate, ...queryFragments] = pathWithQuery.split("&");
  const pathTokens = parseTokens(pathTemplate.split("/"));
  const queryTokens = parseTokens(queryFragments);
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

const parseTokens = (path: string[]): PathToken[] =>
  path.reduce<PathToken[]>((acc, f) => {
    if(!f) {
      return acc;
    } else if(f.startsWith(":")) {
      const maybeMod = f[f.length-1];
      const modifier = maybeMod === "+" || maybeMod === "*" || maybeMod === "?"
        ? maybeMod : "";
      return acc.concat({
        modifier,
        name: f.slice(1, modifier ? f.length - 1 : undefined)
      });
    }
    return acc.concat(f);
  }, []);

const stringifyParams = (
  parserMap: ParserMap<any>,
  params: RawParams,
): Record<string, string> =>
  Object.keys(parserMap).reduce((acc, k) => ({
    ...acc, ...(
      params[k] ? {[k]: parserMap[k].serialize(params[k]) } : {}
    ),
  }), {});

export function routeFn<
  T extends string, // extending string here ensures successful literal inference
  PM extends ParserMap<MergeParamGroups<InferParamGroups<T>>>,
  C extends ChildrenMap,
>(
  this: RouteFnContext,
  templateWithQuery: T,
  parserMap: PM,
  children: C,
): RouteNode<T, PM, C>{
  const parsedRoute = parseRoute(templateWithQuery, parserMap);
  // DEBUG:
  // console.log("routeFn", {templateWithQuery, parserMap, parsedRoute});
  const fn = (
    rawParams: RawParams
  ) => new Proxy<any>({}, { get: (target, next, receiver) => {
    const pathParams = stringifyParams(parsedRoute.pathParamParsers, rawParams);
    const queryParams = {
      ...this.previousQueryParams,
      ...stringifyParams(parsedRoute.queryParamParsers, rawParams),
    };
    const path = stringifyRoute(parsedRoute.pathTokens, pathParams, this.previousPath);
    return next === "$" ? (
        path + stringify(queryParams, { addQueryPrefix: true })
      ) : next === Symbol.toPrimitive ? (
        () => path + stringify(queryParams, { addQueryPrefix: true })
      ) : next === "$self" ? (
        route.call<RouteFnContext, [T, PM, C], RouteNode<T, PM, C>>({
          previousPath: path,
          previousQueryParams: queryParams,
        }, templateWithQuery, parserMap, children)
      ) : typeof next == "string" && children[next] ? (
        route.call<RouteFnContext, [T, PM, C], RouteNode<any, any, any>>({
          previousPath: path,
          previousQueryParams: queryParams,
        }, children[next].templateWithQuery, children[next].parserMap, children[next].children)
      ) : Reflect.get(target, next,receiver)
  }});
  fn.parseParams = paramsParser(parsedRoute);
  fn.templateWithQuery = templateWithQuery,
  fn.children = children,
  fn.parserMap = parserMap,
  fn.template = parsedRoute.pathTemplate;

  return (fn as any);
}

export const route: RouteFn = routeFn;
export const recursiveRoute: RouteFn<true> = routeFn as RouteFn<true>;

const stringifyRoute = (
  pathTokens: PathToken[],
  params: SerializedParams,
  prefixPath = "",
): string =>
  [prefixPath].concat(
    pathTokens.reduce<string[]>((acc, t) =>
      isPathParam(t) ? (
        params[t.name] ? acc.concat(encodeURIComponent(params[t.name])) : acc
      ) : (
        acc.concat(t)
      ),
      [],
    )
  )
  .join("/");

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
      if(isPathParam(t) && ["", "+"].includes(t.modifier) && !parsedParams[t.name]) {
        throw Error(`[parseParams]: parameter "${t.name}" is required but is not defined`);
      }
    })
  }
  return parsedParams;
}
