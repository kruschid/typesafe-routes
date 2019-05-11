export interface IRouteBuilder<T> {
  <K extends keyof T>(k: K): IRouteBuilder<T[K]>
  str(): string
}

export const routeFactory = <T>(prefix: string = ""): IRouteBuilder<T> => {
  const subPath: any = function(this: {path: string}, k: string) {
    const path = this && this.path ? `${this.path}/${k}` : k;
    const generate = () => `${prefix}/${path}`;

    return Object.assign(subPath.bind({path}), {
      str: generate.bind({path}),
    });
  }
  return subPath;
};
