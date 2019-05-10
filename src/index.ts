export interface IRouteBuilder<T> {
  <K extends keyof T>(k: K): IRouteBuilder<T[K]>
  str(): string
}

export const routeFactory = <T>(prefix?: string): IRouteBuilder<T> => {
  const subPath: any = function(this: {path: string[]}, k: string) {
    const path = this ? this.path : [];
    const generate = () =>
      [prefix, ...path, k].filter(isDefined).join("/");

    return Object.assign(
      subPath.bind({path: [...path, k]}),
      {
        str: generate.bind({path: [...path, k]}),
      },
    );
  }
  return subPath;
};

const isDefined = (x?: string): boolean => x !== undefined;
