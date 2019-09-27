import { stringify, IStringifyOptions } from "qs";

export interface IRouteNode<T> {
  <K extends keyof T>(
    k: K,
    ...params: T[K] extends Fn ? Parameters<T[K]>: []
  ): IRouteNode<T[K] extends Fn ? ReturnType<T[K]> : T[K]>
  str(): string
}

type Fn = (...args: any) => any;

interface IObject {
  [x: string]: string
}

export const QUERY_FORMATTER = Symbol("QUERY_FORMATTER");

export class QueryParams<T extends Record<string, any>> {
  public [QUERY_FORMATTER] = true;

  public constructor(private params: T, private options?: IStringifyOptions) {}

  public toString() {
    return stringify(this.params, {
      addQueryPrefix: true,
      ...this.options,
    });
  }
}

const isQueryParams = (x: any): x is QueryParams<any> =>
  x && x[QUERY_FORMATTER];

const isObject = (x: any): x is IObject =>
  x && typeof x === 'object' && x.constructor === Object;

const getNamedParamValue = (param: {[x: string]: string}) =>
  param[Object.keys(param)[0]];

export const Ruth = <T>(prefix: string = ""): IRouteNode<T> => {
  const subPath: any = function(
    this: {path?: string},
    k: string,
    ...params: any[]
  ) {
    let path: string = k;
  
    if (this && this.path) {
      path = `${this.path}/${path}`;
    }

    for (let p of params) {
      path += `${isQueryParams(p) ? "" : "/"}${isObject(p) ? getNamedParamValue(p) : p}`;
    }

    const str = () => `${prefix}/${path}`;

    return Object.assign(subPath.bind({path}), {str});
  }
  return subPath;
};
