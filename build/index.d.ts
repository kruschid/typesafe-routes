export interface IRouteBuilder<T> {
    <K extends keyof T>(k: K): IRouteBuilder<T[K]>;
    str(): string;
}
export declare const routeFactory: <T>(prefix?: string | undefined) => IRouteBuilder<T>;
