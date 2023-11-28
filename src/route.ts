import { stringify } from "qs";
import { Parser } from "./parser";

type If<C, T, E> = C extends true ? (true extends C ? T : E) : E;

interface ParamNames<
  R extends string = never,
  O extends string = never,
  P extends string = never,
  Q extends string = never
> {
  required: R;
  optional: O;
  path: P;
  query: Q;
}

type AddParam<
  PN extends ParamNames,
  K extends "path" | "query" | "required" | "optional",
  Name extends string
> = {
  [Key in keyof PN]: Key extends K ? PN[Key] | Name : PN[Key];
};

export type InferParam<
  T extends string,
  K extends "path" | "query",
  PG extends ParamNames
> = T extends `:${infer P}?`
  ? AddParam<PG, K | "optional", P>
  : T extends `:${infer P}*`
  ? AddParam<PG, K | "optional", P>
  : T extends `:${infer P}+`
  ? AddParam<PG, K | "required", P>
  : T extends `:${infer P}`
  ? AddParam<PG, K | "required", P>
  : PG;

export type InferParamFromPath<
  P extends string,
  K extends "path" | "query" = "path"
> = P extends `${infer A}/${infer B}`
  ? InferParam<A, K, InferParamFromPath<B, "path">>
  : P extends `${infer A}&${infer B}`
  ? InferParam<A, K, InferParamFromPath<B, "query">>
  : InferParam<P, K, ParamNames>;

export type AllParamNames<
  G extends ParamNames<string, string, string, string>
> = G["required"] | G["optional"];

type SerializedParams<K extends string = string> = Record<K, string>;

type RawParams = Record<string, unknown>;

type ChildrenMap = Record<string, RouteNode<any, any, any>>;

type ParserMap<K extends string> = Record<K, Parser<any>>;

export type ExtractParserReturnTypes<
  P extends ParserMap<any>,
  F extends keyof P
> = {
  [K in F]: ReturnType<P[K]["parse"]>;
};

interface RouteFnContext {
  previousQueryParams?: SerializedParams;
  previousPath?: string;
}

type RouteFn<IS_RECURSIVE = false> = <
  T extends string, // extending string here ensures successful literal inference
  PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>,
  C extends ChildrenMap
>(
  templateWithQuery: T,
  parserMap: PM,
  children: C
) => RouteNode<T, PM, C, IS_RECURSIVE>;

type ParseParamsArguments<
  T extends string,
  Filter extends string,
  G extends InferParamFromPath<T>
> = SerializedParams<G["required"] & Filter> &
  Partial<SerializedParams<G["optional"] & Filter>>;

type ParseParamsReturnTypes<
  PM extends ParserMap<any>,
  Filter extends string,
  G extends InferParamFromPath<any>
> = ExtractParserReturnTypes<PM, G["required"] & Filter> &
  Partial<ExtractParserReturnTypes<PM, G["optional"] & Filter>>;

export type RouteNode<
  T extends string,
  PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>,
  C extends ChildrenMap,
  IS_RECURSIVE = false
> = {
  parseParams: <G extends InferParamFromPath<T>>(
    params: ParseParamsArguments<T, G["path"] | G["query"], G>,
    strict?: boolean
  ) => ParseParamsReturnTypes<PM, G["path"] | G["query"], G>;

  parsePathParams: <G extends InferParamFromPath<T>>(
    params: ParseParamsArguments<T, G["path"], G>,
    strict?: boolean
  ) => ParseParamsReturnTypes<PM, G["path"], G>;

  parseQueryParams: <G extends InferParamFromPath<T>>(
    params: ParseParamsArguments<T, G["query"], G>,
    strict?: boolean
  ) => ParseParamsReturnTypes<PM, G["query"], G>;

  templateWithQuery: T;
  template: T extends `${infer BaseT}&${string}` ? BaseT : T;
  children: C;
  parserMap: PM;
} & (<G extends InferParamFromPath<T>>(
  params: ParseParamsReturnTypes<PM, G["path"] | G["query"], G>
) => {
  $: string;
} & {
  [K in keyof C]: C[K];
} & If<IS_RECURSIVE, { $self: RouteNode<T, PM, C, true> }, {}>);

type Segment = string | Param;

interface Param {
  modifier: "" | "*" | "+" | "?";
  name: string;
}

const isParam = (x: Segment): x is Param => typeof x !== "string";

const filterParserMap = (
  parserMap: ParserMap<any>,
  tokens: Segment[]
): ParserMap<any> =>
  tokens.reduce<ParserMap<any>>(
    (acc, t: Segment) =>
      !isParam(t) ? acc : { ...acc, [t.name]: parserMap[t.name] },
    {}
  );

type ParsedRouteMeta = ReturnType<typeof parseRoute>;
const parseRoute = (pathWithQuery: string, parserMap: ParserMap<any>) => {
  const [pathTemplate, ...queryFragments] = pathWithQuery.split("&");
  const pathTokens = parseTokens(pathTemplate.split("/"));
  const queryTokens = parseTokens(queryFragments);
  const pathParamParsers = filterParserMap(parserMap, pathTokens);
  const queryParamParsers = filterParserMap(parserMap, queryTokens);
  return {
    pathTemplate,
    pathTokens,
    queryTokens,
    pathParamParsers,
    queryParamParsers,
    parserMap,
  };
};

const parseTokens = (path: string[]): Segment[] =>
  path.reduce<Segment[]>((acc, f) => {
    if (!f) {
      return acc;
    } else if (f.startsWith(":")) {
      const maybeMod = f[f.length - 1];
      const modifier =
        maybeMod === "+" || maybeMod === "*" || maybeMod === "?"
          ? maybeMod
          : "";
      return acc.concat({
        modifier,
        name: f.slice(1, modifier ? f.length - 1 : undefined),
      });
    }
    return acc.concat(f);
  }, []);

const stringifyParams = (
  parserMap: ParserMap<any>,
  params: RawParams
): Record<string, string> =>
  Object.keys(parserMap).reduce(
    (acc, k) => ({
      ...acc,
      ...(params[k] || params[k] === 0
        ? { [k]: parserMap[k].serialize(params[k]) }
        : {}),
    }),
    {}
  );

export function routeFn<
  T extends string, // extending string here ensures successful literal inference
  PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>,
  C extends ChildrenMap
>(
  this: RouteFnContext | void,
  templateWithQuery: T,
  parserMap: PM,
  children: C
): RouteNode<T, PM, C> {
  const parsedRoute = parseRoute(templateWithQuery, parserMap);
  const fn = (rawParams: RawParams) =>
    new Proxy<any>(
      {},
      {
        get: (target, next, receiver) => {
          const context = this ?? undefined;
          const pathParams = stringifyParams(
            parsedRoute.pathParamParsers,
            rawParams
          );
          const queryParams = {
            ...context?.previousQueryParams,
            ...stringifyParams(parsedRoute.queryParamParsers, rawParams),
          };
          const isRoot = templateWithQuery[0] === "/" && !context?.previousPath;
          const path = stringifyRoute(
            isRoot,
            parsedRoute.pathTokens,
            pathParams,
            context?.previousPath
          );
          if (next === "$") {
            return path + stringify(queryParams, { addQueryPrefix: true });
          }
          if (next === "$self") {
            return route.call(
              {
                previousPath: path,
                previousQueryParams: queryParams,
              },
              templateWithQuery,
              parserMap,
              children
            );
          }
          if (next === Symbol.toPrimitive) {
            return () =>
              path + stringify(queryParams, { addQueryPrefix: true });
          }
          if (typeof next == "string" && children[next]) {
            return route.call(
              {
                previousPath: path,
                previousQueryParams: queryParams,
              },
              children[next].templateWithQuery,
              children[next].parserMap,
              children[next].children
            );
          }
          return Reflect.get(target, next, receiver);
        },
      }
    );

  fn.parseParams = paramsParser(parsedRoute);
  fn.parsePathParams = paramsParser(parsedRoute, "path");
  fn.parseQueryParams = paramsParser(parsedRoute, "query");
  fn.templateWithQuery = templateWithQuery;
  fn.children = children;
  fn.parserMap = parserMap;
  fn.template = parsedRoute.pathTemplate;

  return fn as RouteNode<T, PM, C>;
}

export const route: RouteFn = routeFn;
export const recursiveRoute: RouteFn<true> = routeFn as RouteFn<true>;

const stringifyRoute = (
  isRoot: boolean,
  pathTokens: Segment[],
  params: SerializedParams,
  prefixPath = ""
): string =>
  (isRoot ? "/" : "") +
  (prefixPath ? (prefixPath === "/" ? [""] : [prefixPath]) : [])
    .concat(
      pathTokens.reduce<string[]>(
        (acc, t) =>
          isParam(t)
            ? params[t.name]
              ? acc.concat(encodeURIComponent(params[t.name]))
              : acc
            : acc.concat(t),
        []
      )
    )
    .join("/");

const paramsParser =
  (
    { pathTokens, queryTokens, parserMap }: ParsedRouteMeta,
    type?: "path" | "query"
  ) =>
  (params: SerializedParams, strict?: boolean): RawParams => {
    const tokens = [
      ...(!type || type === "path" ? pathTokens : []),
      ...(!type || type === "query" ? queryTokens : []),
    ];

    const parsedParams = tokens.reduce<RawParams>((acc, t) => {
      if (!isParam(t)) {
        return acc;
      }
      if (strict && ["", "+"].includes(t.modifier) && !params[t.name]) {
        throw Error(
          `[parseParams]: parameter "${t.name}" is required but is not defined`
        );
      }
      if (!parserMap[t.name] || !params[t.name]) {
        return acc;
      }
      return {
        ...acc,
        [t.name]: parserMap[t.name].parse(params[t.name]),
      };
    }, {});

    return parsedParams;
  };
