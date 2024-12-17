import {
  bool,
  createRoutes,
  InferPathParams,
  InferQueryParams,
  int,
  str,
} from "../src";

type AssertEqual<T, U> = T extends U
  ? U extends T
    ? true
    : "Types are not equal"
  : "Types are not equal";

const assertEqual = <T, U>(value: AssertEqual<T, U>): void => {};

const expectType = <T>(_: T) => {};

const r = createRoutes({
  home: {},
  language: {
    path: [str("lang")],
    children: {
      users: {
        path: ["users"],
        query: [int("page")],
        children: {
          show: {
            path: ["show", int.optional("userId")],
            query: [bool.optional("filter")],
          },
        },
      },
    },
  },
});

//
// path segments
//
assertEqual<keyof typeof r, "~context">(true);
assertEqual<keyof typeof r, "_">(true);
assertEqual<keyof typeof r, "language">(true);
assertEqual<keyof typeof r, "home">(true);
assertEqual<keyof typeof r.language, "~context">(true);
assertEqual<keyof typeof r.language, "_">(true);
assertEqual<keyof typeof r.language, "users">(true);
assertEqual<keyof typeof r.language.users, "~context">(true);
assertEqual<keyof typeof r.language.users, "_">(true);
assertEqual<keyof typeof r.language.users, "show">(true);
// @ts-expect-error
assertEqual<keyof typeof r, "a">(true);

//
// PathParamsRecord
//
assertEqual<InferPathParams<typeof r.home>, {}>(true);
assertEqual<InferPathParams<typeof r.language>, { lang: string }>(true);
assertEqual<
  InferPathParams<typeof r.language.users.show>,
  { lang: string; userId?: number }
>(true);
assertEqual<
  InferPathParams<typeof r.language._.users.show>,
  { userId?: number }
>(true);

//
// QueryParamsRecord
//
// undefined queries in path
assertEqual<InferQueryParams<typeof r.language>, {}>(true);
// defined queries in path
assertEqual<
  InferQueryParams<typeof r.language.users.show>,
  { page: number; filter?: boolean }
>(true);
// relative path
assertEqual<
  InferQueryParams<typeof r.language.users._.show>,
  { page: number; filter?: boolean }
>(true);
