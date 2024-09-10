export type SafeParseResult<T> =
  | { success: true; result: T }
  | { success: false; error: Error };

export const safeCall = <T extends (...args: any[]) => any>(
  fn: T,
  ...params: Parameters<T>
): SafeParseResult<ReturnType<T>> => {
  try {
    const result = fn(...params);
    return {
      success: true,
      result,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error(err === "string" ? err : `unknown error: ${err}`),
    };
  }
};
