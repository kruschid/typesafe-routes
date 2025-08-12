import { InferPathParams, WithContext } from "../types";

export type ParsePathFn = <R extends WithContext>(
  route: R,
  paramsOrPath: Record<string, string | string[]>,
) => InferPathParams<R>;

export const parsePath: ParsePathFn = () => {
  return {} as any;
};
