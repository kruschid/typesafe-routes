import { stringify } from "qs";
import { Parser } from "./parser";

type If<C, T, E> = C extends true ? true extends C ? T : E : E;

interface ParamNames<
  R extends string = string,
  O extends string = string
  > {
  required: R,
  optional: O,
}

type WithOptionalParam<PG extends ParamNames, P extends string> = ParamNames<PG["required"], PG["optional"] | P>;
type WithRequiredParam<PG extends ParamNames, P extends string> = ParamNames<PG["required"] | P, PG["optional"]>;

export type InferParam<
  T extends string,
  PG extends ParamNames
  > =
  T extends `:${infer P}?` ? WithOptionalParam<PG, P>
  : T extends `:${infer P}*` ? WithOptionalParam<PG, P>
  : T extends `:${infer P}+` ? WithRequiredParam<PG, P>
  : T extends `:${infer P}` ? WithRequiredParam<PG, P>
  : PG;

export type InferParamFromPath<P extends string> =
  P extends `${infer A}/${infer B}` ? InferParam<A, InferParamFromPath<B>>
  : P extends `${infer A}&${infer B}` ? InferParam<A, InferParamFromPath<B>>
  : InferParam<P, { required: never, optional: never }>;

export type AllParamNames<G extends ParamNames> = G["required"] | G["optional"];

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
  PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>,
  C extends ChildrenMap,
  >(
  templateWithQuery: T,
  parserMap: PM,
  children: C,
) => RouteNode<T, PM, C, IS_RECURSIVE>;

export type RouteNode<
  T extends string,
  PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>,
  C extends ChildrenMap,
  IS_RECURSIVE = false,
  > = {
    parseParams: <G extends InferParamFromPath<T>>(
      params: SerializedParams<G["required"]>
        & Partial<SerializedParams<G["optional"]>>,
      strict?: boolean,
    ) => ExtractParserReturnTypes<PM, G["required"]>
      & Partial<ExtractParserReturnTypes<PM, G["optional"]>>;
    templateWithQuery: T;
    template: T extends `${infer BaseT}&${string}` ? BaseT : T;
    children: C;
    parserMap: PM;
  } & (
    <G extends InferParamFromPath<T>>(
      params: ExtractParserReturnTypes<PM, G["required"]>
        & Partial<ExtractParserReturnTypes<PM, G["optional"]>>
    ) => {
      $: string;
    } & {
        [K in keyof C]: C[K];
      } & If<
        IS_RECURSIVE,
        { $self: RouteNode<T, PM, C, true> },
        {}
      >
  );

type PathToken = string | PathParam;

interface PathParam {
  modifier: "" | "*" | "+" | "?";
  name: string;
}

const isPathParam = (x: PathToken): x is PathParam => typeof x !== "string";

const filterParserMap = (
  parserMap: ParserMap<any>,
  tokens: PathToken[],
): ParserMap<any> =>
  tokens.reduce<ParserMap<any>>((acc, t: PathToken) =>
    !isPathParam(t) ? acc : { ...acc, [t.name]: parserMap[t.name] },
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
}

const parseTokens = (path: string[]): PathToken[] =>
  path.reduce<PathToken[]>((acc, f) => {
    if (!f) {
      return acc;
    } else if (f.startsWith(":")) {
      const maybeMod = f[f.length - 1];
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
      params[k] || params[k] === 0 ? { [k]: parserMap[k].serialize(params[k]) } : {}
    ),
  }), {});

export function routeFn<
  T extends string, // extending string here ensures successful literal inference
  PM extends ParserMap<AllParamNames<InferParamFromPath<T>>>,
  C extends ChildrenMap,
  >(
    this: RouteFnContext | void,
    templateWithQuery: T,
    parserMap: PM,
    children: C,
): RouteNode<T, PM, C> {
  const parsedRoute = parseRoute(templateWithQuery, parserMap);
  const fn = (
    rawParams: RawParams
  ) => new Proxy<any>({}, {
    get: (target, next, receiver) => {
      const context = this ?? undefined;
      const pathParams = stringifyParams(parsedRoute.pathParamParsers, rawParams);
      const queryParams = {
        ...(context?.previousQueryParams),
        ...stringifyParams(parsedRoute.queryParamParsers, rawParams),
      };
      const isRoot = templateWithQuery[0] === "/" && !context?.previousPath;
      const path = stringifyRoute(
        isRoot,
        parsedRoute.pathTokens,
        pathParams,
        context?.previousPath,
      );
      if (next === "$") {
        return path + stringify(queryParams, { addQueryPrefix: true });
      }
      if (next === "$self") {
        return route.call({
          previousPath: path,
          previousQueryParams: queryParams,
        }, templateWithQuery, parserMap, children);
      }
      if (next === Symbol.toPrimitive) {
        return () => path + stringify(queryParams, { addQueryPrefix: true });
      }
      if (typeof next == "string" && children[next]) {
        return route.call({
          previousPath: path,
          previousQueryParams: queryParams,
        }, children[next].templateWithQuery, children[next].parserMap, children[next].children)
      }
      return Reflect.get(target, next, receiver)
    }
  });

  fn.parseParams = paramsParser(parsedRoute);
  fn.templateWithQuery = templateWithQuery;
  fn.children = children;
  fn.parserMap = parserMap;
  fn.template = parsedRoute.pathTemplate;

  return (fn as RouteNode<T, PM, C>);
}

export const route: RouteFn = routeFn;
export const recursiveRoute: RouteFn<true> = routeFn as RouteFn<true>;

const stringifyRoute = (
  isRoot: boolean,
  pathTokens: PathToken[],
  params: SerializedParams,
  prefixPath = "",
): string => (
  (isRoot ? "/" : "") +
  (prefixPath ? (prefixPath === "/" ? [""] : [prefixPath]) : []).concat(
    pathTokens.reduce<string[]>((acc, t) =>
      isPathParam(t) ? (
        params[t.name] ? acc.concat(encodeURIComponent(params[t.name])) : acc
      ) : (
        acc.concat(t)
      ),
      [],
    )
  )
    .join("/"));

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
    if (strict) {
      pathTokens.concat(queryTokens)
        .forEach((t) => {
          if (isPathParam(t) && ["", "+"].includes(t.modifier) && !parsedParams[t.name]) {
            throw Error(`[parseParams]: parameter "${t.name}" is required but is not defined`);
          }
        })
    }
    return parsedParams;
  }
