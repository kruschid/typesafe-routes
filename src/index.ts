import { stringify, IStringifyOptions } from "qs";

export type WithParams<T> = {
  [K in keyof T]: T[K] extends Fn
    ? {
        params: UnionToIntersection<ExcludeString<Parameters<T[K]>>[number]>;
        children: WithParams<ReturnType<T[K]>>;
      }
    : WithParams<T[K]>
}
type ExcludeString<T> = T extends string[] ? never: T;

type Fn = (...args: any) => any;

// thank you @jcalz <3 (https://stackoverflow.com/a/50375286)
type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never

export const QUERY_FORMATTER = Symbol("QUERY_FORMATTER");

export class QueryParams<T extends Record<string, any>> {
  public [QUERY_FORMATTER] = true;

  public constructor(private params: T, private options?: IStringifyOptions) {}

  public toString() {
    return stringify(this.params, this.options);
  }
}

export const Ruth = <T extends Record<string, any>>(
  t: T,
  prefix: string = "",
): T => {
  // parameterized node may return void (in case of recursion)
  t = t || {};

  const f: Record<string, any> = new class F {
    toString(){ return prefix }
  };

  Object.keys(t).forEach((k) => {
    f[k] = !hasParams(t[k])
      ? Ruth(t[k], `${prefix}/${k}`)
      : (...p: any[]) => Ruth(t[k](), `${prefix}/${renderParams(k, p)}`);
  })
  return f as T;
}

const hasParams = (x: any) =>
  typeof x === "function";

const renderParams = (prefix: string, params: any[]) => {
  let path = prefix;
  for (let p of params) {
    path += `${hasQueryParams(p) ? "?" : "/"}${isObject(p) ? getNamedParamValue(p) : p}`;
  }
  return path;
};

const hasQueryParams = (x: any): x is QueryParams<any> =>
  x && x[QUERY_FORMATTER];

const isObject = (x: any): x is Record<string, any> =>
  x && typeof x === 'object' && x.constructor === Object;

const getNamedParamValue = (param: Record<string, any>) =>
  param[Object.keys(param)[0]];
