export declare type RouteBuilder<T> = <U extends keyof T, V extends undefined, K = U | V>(k?: K) => K extends undefined ? string : RouteBuilder<T[U]>;
export declare const routeBuilder: <T>(prefix?: string | undefined) => RouteBuilder<T>;
