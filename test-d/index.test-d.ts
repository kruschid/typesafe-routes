import { expectType } from "tsd";
import { bool, createRoutes, int, str } from "../src";

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
            path: ["show", int("userId")],
            query: [bool.optional("filter")],
          },
        },
      },
    },
  },
});

//
// template
//
expectType<() => string>(r.language.users.$template);

//
// render
//
expectType<(params: {}) => string>(r.$render);
expectType<
  (params: {
    path: {
      lang: string;
    };
  }) => string
>(r.language.$render);

expectType<
  (params: {
    path: {
      lang: string;
    };
    query: {
      page: number;
    };
  }) => string
>(r.language.users.$render);

expectType<
  (params: {
    query: {
      page: number;
    };
  }) => string
>(r.language._.users.$render);

expectType<
  (params: {
    path: {
      lang: string;
      userId: number;
    };
    query: {
      page: number;
      filter?: boolean | undefined;
    };
  }) => string
>(r.language.users.show.$render);

expectType<
  (params: {
    path: {
      userId: number;
    };
    query: {
      page: number;
      filter?: boolean | undefined;
    };
  }) => string
>(r.language._.users.show.$render);

expectType<
  (params: {
    path: {
      userId: number;
    };
    query: {
      filter?: boolean | undefined;
    };
  }) => string
>(r.language.users._.show.$render);

//
// params
//
expectType<(params: Record<string, any>) => unknown>(r.$parseParams);

expectType<
  (params: Record<string, any>) => {
    lang: string;
  }
>(r.language.$parseParams);

expectType<
  (params: Record<string, any>) => {
    lang: string;
  }
>(r.language.users.$parseParams);

expectType<
  (params: Record<string, any>) => {
    lang: string;
    userId: number;
  }
>(r.language.users.show.$parseParams);

expectType<(params: Record<string, any>) => {}>(
  r.language._.users.$parseParams
);

expectType<
  (params: Record<string, any>) => {
    userId: number;
  }
>(r.language._.users.show.$parseParams);

expectType<
  (params: Record<string, any>) => {
    userId: number;
  }
>(r.language.users._.show.$parseParams);

//
// query
//
expectType<(params: Record<string, any>) => {}>(r.home.$parseQuery);

expectType<(params: Record<string, any>) => {}>(r.language.$parseQuery);

expectType<
  (params: Record<string, any>) => {
    page: number;
  }
>(r.language.users.$parseQuery);

expectType<
  (params: Record<string, any>) => {
    page: number;
    filter?: boolean | undefined;
  }
>(r.language.users.show.$parseQuery);

expectType<
  (params: Record<string, any>) => {
    page: number;
  }
>(r.language._.users.$parseQuery);

expectType<
  (params: Record<string, any>) => {
    page: number;
    filter?: boolean | undefined;
  }
>(r.language._.users.show.$parseQuery);

expectType<
  (params: Record<string, any>) => {
    filter?: boolean | undefined;
  }
>(r.language.users._.show.$parseQuery);

//
// bind
//
// r.bind("language", { path: { lang: "" } })
//   .bind("users", { query: { page: 1 } })
//   .render("show", { path: { userId: 1 }, query: { filter: true } });

//
// from
//
// r.from("language/users", "de/users/5?page=2", {
//   path: { lang: "" },
//   query: { page: 1 },
// }).render("show", { path: { userId: 2 }, query: {} });

//
// replace
//
