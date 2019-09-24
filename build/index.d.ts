declare type Fn = (...args: any) => any;
export interface IRouteNode<T> {
    <K extends keyof T>(k: K, ...params: T[K] extends Fn ? Parameters<T[K]> : []): IRouteNode<T[K] extends Fn ? ReturnType<T[K]> : T[K]>;
    str(): string;
}
export declare const Ruth: <T>(prefix?: string) => IRouteNode<T>;
export {};
