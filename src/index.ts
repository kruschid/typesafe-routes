import { stringify, IStringifyOptions } from "qs";

export type Route = {
  name: string
  params: Array<string | Record<string, any>>
  children?: Route
}

export type RouteFn<T extends Route> = {
  // since T could be a tagged union we need to extract the specific type by name via Extract
  [N in T["name"]]: <K extends Route = Extract<T, {name: N}>>(
    ...params: K["params"]
  ) => RouteFn<NonNullable<K["children"]>>
} & {
  $: string
}

export type RouteParams<T extends Route> = UnionToIntersection<ExcludeString<T["params"]>[number]>;

type ExcludeString<T> = T extends string[] ? never: T;

// thank you @jcalz <3 (https://stackoverflow.com/a/50375286)
type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;

export const HAS_QUERY_PARAMS = Symbol("QUERY_PARAMS");

export type QueryParams<T extends Record<string, any>> = T & {
  [HAS_QUERY_PARAMS]: true
}

export const queryParams = <T extends Record<string, any>>(params: T): QueryParams<T> => ({
  [HAS_QUERY_PARAMS]: true,
  ...params,
});

const stringifyQueryParams = (
  options: IStringifyOptions
) => <T>(
  queryParams: QueryParams<T>,
) =>
  stringify(queryParams, options);

export const R = <T extends Route>(
  path: string = "",
  queryParams: QueryParams<any> = {[HAS_QUERY_PARAMS]: true},
  renderSearchQuery: ReturnType<typeof stringifyQueryParams> = stringifyQueryParams({addQueryPrefix: true}),
): RouteFn<T> =>
  new Proxy<any>({}, {
    get: (target, next, receiver) =>
      typeof next === "symbol" ? Reflect.get(target, next, receiver)
      : next === "$" ? path + renderSearchQuery(queryParams)
      : nextRoute(path, queryParams, renderSearchQuery, next)
  });

const nextRoute = (
  path: string,
  queryParams: QueryParams<Record<string, any>>,
  renderSearchQuery: <T>(params: QueryParams<T>) => string,
  routeName: string | number,
) => (
  ...params: Route["params"]
) => {
  path = `${path}/${routeName}`;
  for (let p of params) {
    if( hasQueryParams(p) ) {
      queryParams = {...queryParams, ...p}
    } else {
      path += `/${isObject(p) ? getParamValue(p) : p}`;
    }
  }
  return R(path, queryParams, renderSearchQuery);
};

const hasQueryParams = (x: any): x is QueryParams<Record<string, any>> =>
  x && x[HAS_QUERY_PARAMS];

const isObject = (x: any): x is Record<string, any> =>
  x && typeof x === 'object' && x.constructor === Object;

const getParamValue = (param: Record<string, any>) =>
  param[Object.keys(param)[0]];
