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

export const R = <T extends Route>(
  prevPath: string = "",
  prevQuery: QueryParams<any> = new QueryParams({}, {addQueryPrefix: true}),
): RouteFn<T> =>
  new Proxy<any>({}, {
    get: (target, next, receiver) =>
      typeof next === "symbol" ? Reflect.get(target, next, receiver)
      : next === "$" ? prevPath + prevQuery
      : (...params: Route["params"]) => {
          let [path, query] = [prevPath, prevQuery];
          path = `${path}/${next}`;
          for (let p of params) {
            if( hasQueryParams(p) ) {
              query = p.merge(query)
            } else {
              path += `/${isObject(p) ? getParamValue(p) : p}`;
            }
          }
          return R(path, query);
        },
  });

const hasQueryParams = (x: any): x is QueryParams<any> =>
  x && x[QUERY_FORMATTER];

const isObject = (x: any): x is Record<string, any> =>
  x && typeof x === 'object' && x.constructor === Object;

const getParamValue = (param: Record<string, any>) =>
  param[Object.keys(param)[0]];

export const QUERY_FORMATTER = Symbol("QUERY_FORMATTER");

export class QueryParams<T extends Record<string, any>> {
  public [QUERY_FORMATTER] = true;

  public constructor(
    private params: T,
    private options?: IStringifyOptions,
  ) {}

  public merge(other: QueryParams<any>) {
    this.params = {...this.params, ...other.params};
    this.options = {...this.options, ...other.options};
    return this;
  }

  public toString() {
    return stringify(this.params, this.options)
  }
  }