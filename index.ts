export type RouteBuilder<T> = <K extends keyof T>(k?: K) =>
  T[K] extends never ? string : RouteBuilder<T[K]>;

export const routeBuilder = <T>(prefix?: string): RouteBuilder<T> => function(
  this: {cb: (x?: string) => string[]} | undefined,
  k?: string,
): string | RouteBuilder<any> {
  return k === undefined
    ? this!.cb().filter(isDefined).join("/")
    : routeBuilder().bind({
        cb: (x: string) =>
          this && this.cb ? [...this.cb(k), x] : [prefix, k, x],
      });
} as any;

const isDefined = (x?: string): boolean => x !== undefined;