type Fn = (...args: any) => any;

export interface IRouteNode<T> {
  <K extends keyof T>(
    k: K,
    ...params: T[K] extends Fn ? Parameters<T[K]>: []
  ): IRouteNode<T[K] extends Fn ? ReturnType<T[K]> : T[K]>
  str(): string
}

interface IObject {
  [x: string]: string
}

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
      path += `/${isObject(p) ? getNamedParamValue(p) : p}`;
    }

    const str = () => `${prefix}/${path}`;

    return Object.assign(subPath.bind({path}), {str});
  }
  return subPath;
};
