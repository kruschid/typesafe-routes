import { AnyParam } from "./param";
import { int, str } from "./parser";

type If<Condition, Then> = Condition extends true ? Then : never;
type Unwrap<T> = T extends unknown[] ? T[number] : never;

export type RouteSegment = {
  path?: (string | AnyParam)[];
  query?: AnyParam[];
  children?: RouteMap;
};
export type RouteMap = Record<string, RouteSegment>;

/**
 * ToParamMap<{
 *  path?: (string | Param<TName TValue>)[];
 *  query?: Param<TName TValue>[];
 *  children?: RouteMap;
 * }> => {
 *  path: {[TName]: TValue, ...},
 *  query: {[TName]: TValue, ...}
 * }
 */
export type ToParamMap<T extends RouteSegment> = {
  path: ToParamsRecord<Exclude<Unwrap<T["path"]>, string | undefined>>;
  query: ToParamsRecord<Exclude<Unwrap<T["query"]>, undefined>>;
};
type ParamMap = Record<"path" | "query", unknown>;

/**
 * ToParamsRecord<{
 *  kind: "required" | "optional";
 *  name: TName;
 *  parser: Parser<TParseType>
 * } | {...}> => {
 *  [TName]: TParseType,
 *  [TName]?: TParseType,
 *  ...
 * }
 */
export type ToParamsRecord<Params extends AnyParam> = {
  [K in Extract<Params, { kind: "required" }>["name"]]: ReturnType<
    Extract<Params, { name: K }>["parser"]["parse"]
  >;
} & {
  [K in Extract<Params, { kind: "optional" }>["name"]]?: ReturnType<
    Extract<Params, { name: K }>["parser"]["parse"]
  >;
};

/**
 * RoutePath<{
 *  childA: {
 *    ...,
 *    childrend: {
 *      childB: {
 *        ...
 *      }
 *    }
 *  }
 * }> =>
 *  | "childA"
 *  | "childA/*"
 *  | "childA/childB"
 *  | "childA/_childB"
 */
type PathSegment<T extends RouteMap, IsTemplate = false, IsAbsolute = true> = {
  [K in keyof T]: K extends string // filters out symbol and number
    ? T[K]["children"] extends object // has children
      ?
          | K
          | `${K}/${PathSegment<T[K]["children"], IsTemplate>}`
          | If<IsTemplate, `${K}/*`>
          | If<
              IsAbsolute,
              `${K}/_${PathSegment<T[K]["children"], IsTemplate, false>}`
            >
      : K // no children
    : never;
}[keyof T];

/**
 * PathToParamMap<
 *  "segement/segment/segment",
 *  {segment: {..., children: {segment: {..., children: {segment}}}}},
 *  {path: {...}, query: {...}}
 * > => { param: type, ...}
 */
type PathToParamMap<
  Path extends string,
  Route extends RouteMap,
  Params extends ParamMap = ParamMap
> = Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? PathToParamMap<
      Rest,
      Route[Segment]["children"] & {}, // shortcut to exclude undefined
      ToParamMap<Route[Segment]>
    >
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? PathToParamMap<
      Rest,
      Route[Segment]["children"] & {}, // shortcut to exclude undefined
      Params & ToParamMap<Route[Segment]>
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? ToParamMap<Route[Segment]>
  : Params & ToParamMap<Route[Path]>;

/**
 * ExcludeEmptyProperties<{
 *  path: {param: string},
 *  query: {}
 * }> => {
 *  path: {param: string},
 *  query: never,
 * }
 */
type ExcludeEmptyProperties<T> = Pick<
  T,
  {
    [K in keyof T]: keyof T[K] extends never ? never : K;
  }[keyof T]
>;

/**
 * ArgumentsFromParamMap<{
 *  path: {uid: string},
 *  query: {search: string}
 * }> => [
 *  path: {uid: string},
 *  query: {search: string}
 * ]
 */
type ArgumentsFromParamMap<P extends ParamMap> = [
  ...(keyof P["path"] extends never ? [] : [params: P["path"]]),
  ...(keyof P["query"] extends never ? [] : [query: P["query"]])
];

type Routes = <Routes extends RouteMap>(
  routes: Routes
) => {
  template: (path: PathSegment<Routes, true>) => string;
  build: <Path extends PathSegment<Routes>>(
    path: Path,
    options: ExcludeEmptyProperties<PathToParamMap<Path, Routes>>
  ) => string;
  render: <Path extends PathSegment<Routes>>(
    path: Path,
    ...args: ArgumentsFromParamMap<PathToParamMap<Path, Routes>>
  ) => string;
  params: <Path extends PathSegment<Routes>>(
    path: Path
  ) => PathToParamMap<Path, Routes>;
  path: <Path extends PathSegment<Routes>>(
    path: Path
  ) => PathToParamMap<Path, Routes>["path"];
  query: <Path extends PathSegment<Routes>>(
    path: Path
  ) => PathToParamMap<Path, Routes>["query"];
};

export const routes: Routes = null as any;

const testRoutes = routes({
  home: {},
  language: {
    path: [str("lang")],
    query: [str("sdfsd").optional],
    children: {
      user: {
        path: ["user", int("uid").optional, "whatever"],
        children: {
          settings: {
            path: ["settings", int("settingsId")],
          },
        },
      },
    },
  },
});
