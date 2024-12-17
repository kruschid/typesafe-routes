import { Compute } from "ts-toolbelt/out/Any/Compute";
import { OptionalDeep } from "ts-toolbelt/out/Object/Optional";

type Defined<T> = Exclude<T, undefined>;

export type ParamKind = "optional" | "required";

export type AnyParam = Param<string, any, any>;

export interface ParamOptions {
  template?: string;
}

export type Param<N = string, T = any, K extends ParamKind = "required"> = {
  name: N;
  options?: ParamOptions;
  kind: K;
  parser: Parser<T>;
};

export interface Parser<T> {
  parse: (value: string) => T;
  serialize: (value: T) => string;
}

export type RouteNode = {
  path?: (string | AnyParam)[];
  template?: string;
  query?: AnyParam[];
  children?: RouteNodeMap;
  meta?: any;
};
export type RouteNodeMap = Record<string, RouteNode>;

/**
 * ComputeParamRecord<
 *   { kind: "required"; name: "a"; parser: Parser<string> } |
 *   { kind: "optional"; name: "b"; parser: Parser<nubmer> } |
 *   ...
 * > => {
 *  [a]: string,
 *  [b]?: number,
 *  ...
 * }
 */
type ComputeParamRecord<Params extends AnyParam> = Compute<
  {
    [K in Extract<Params, { kind: "required" }>["name"]]: ReturnType<
      Extract<Params, { name: K }>["parser"]["parse"]
    >;
  } & {
    [K in Extract<Params, { kind: "optional" }>["name"]]?: ReturnType<
      Extract<Params, { name: K }>["parser"]["parse"]
    >;
  }
>;

export type InferPathParams<R extends WithContext> = ComputeParamRecord<
  Extract<
    Extract<
      R["~context"]["relativeNodes"][number],
      Required<Pick<RouteNode, "path">> // excludes undefined paths -> allows path to be optional
    >["path"][number],
    AnyParam
  >
>;

export type InferQueryParams<R extends WithContext> = ComputeParamRecord<
  Extract<
    Extract<
      R["~context"]["nodes"][number],
      Required<Pick<RouteNode, "query">> // excludes undefined queries -> allows query to be optional
    >["query"][number],
    AnyParam
  >
>;

export type InferParams<R extends WithContext> = {
  path: InferPathParams<R>;
  query: InferQueryParams<R>;
};

export type RoutesProps<
  Routes extends RouteNodeMap,
  Nodes extends RouteNode[] = [],
  RelativeNodes extends RouteNode[] = []
> = {
  "~context": Context<Nodes, RelativeNodes>;
  "~routes": Routes;
  _: RoutesProps<Routes, Nodes, []>;
} & {
  [Segment in keyof Routes]: RoutesProps<
    Defined<Routes[Segment]["children"]>,
    [...Nodes, Routes[Segment]], // all nodes
    [...RelativeNodes, Routes[Segment]] // relative nodes
  >;
};

export interface Context<
  Nodes extends RouteNode[] = RouteNode[],
  RelativeNodes extends RouteNode[] = RouteNode[]
> {
  nodes: Nodes;
  path: string[];
  relativeNodes: RelativeNodes;
  children?: RouteNodeMap;
  isRelative: boolean;
}

export type CreateRoutes = <Routes extends RouteNodeMap>(
  routes: Routes
) => RoutesProps<Routes>;

export interface WithContext {
  "~context": Context;
}

export type TemplateFn = <R extends WithContext>(route: R) => string;

export type RenderPathFn = <R extends WithContext>(
  route: R,
  params: InferPathParams<R>
) => string;

export type RenderQueryFn = <R extends WithContext>(
  route: R,
  params: InferQueryParams<R>
) => string;

export type RenderFn = <R extends WithContext>(
  route: R,
  params: InferParams<R>
) => string;

export type ParsePathFn = <R extends WithContext>(
  route: R,
  paramsOrPath: Record<string, string> | string
) => InferPathParams<R>;

export type ParseQueryFn = <R extends WithContext>(
  route: R,
  paramsOrQuery: Record<string, string> | string
) => InferQueryParams<R>;

export type ParseLocationFn = <R extends WithContext>(
  route: R,
  paramsOrLocation: Record<string, string> | string
) => InferParams<R>;

export type SafeParsePathFn = <R extends WithContext>(
  route: R,
  paramsOrPath: Record<string, string> | string
) => SafeParseResult<InferPathParams<R>>;

export type SafeParseQueryFn = <R extends WithContext>(
  route: R,
  paramsOrQuery: Record<string, string> | string
) => SafeParseResult<InferQueryParams<R>>;

export type SafeParseLocationFn = <R extends WithContext>(
  route: R,
  paramsOrLocation: Record<string, string> | string
) => SafeParseResult<InferParams<R>>;

export type ReplaceFn = <R extends WithContext>(
  route: R,
  location: string,
  params: OptionalDeep<InferParams<R>>
) => string;

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
