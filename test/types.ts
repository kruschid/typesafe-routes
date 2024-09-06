import {
  AnyRenderContext,
  bool,
  createRoutes,
  defaultContext,
  int,
  RouteNodeMap,
  str,
} from "../src";

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
expectType<() => string>(r.language.users.show.$template);

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
  (params: Record<string, any> | string) => {
    lang: string;
  }
>(r.language.$parseParams);

expectType<
  (params: Record<string, any> | string) => {
    lang: string;
  }
>(r.language.users.$parseParams);

expectType<
  (params: Record<string, any> | string) => {
    lang: string;
    userId: number;
  }
>(r.language.users.show.$parseParams);

expectType<(params: Record<string, any> | string) => {}>(
  r.language._.users.$parseParams
);

expectType<
  (params: Record<string, any> | string) => {
    userId: number;
  }
>(r.language._.users.show.$parseParams);

expectType<
  (params: Record<string, any> | string) => {
    userId: number;
  }
>(r.language.users._.show.$parseParams);

//
// query
//
expectType<(params: Record<string, any> | string) => {}>(r.home.$parseQuery);

expectType<(params: Record<string, any> | string) => {}>(
  r.language.$parseQuery
);

expectType<
  (params: Record<string, any> | string) => {
    page: number;
  }
>(r.language.users.$parseQuery);

expectType<
  (params: Record<string, any> | string) => {
    page: number;
    filter?: boolean | undefined;
  }
>(r.language.users.show.$parseQuery);

expectType<
  (params: Record<string, any> | string) => {
    page: number;
  }
>(r.language._.users.$parseQuery);

expectType<
  (params: Record<string, any> | string) => {
    page: number;
    filter?: boolean | undefined;
  }
>(r.language._.users.show.$parseQuery);

expectType<
  (params: Record<string, any> | string) => {
    filter?: boolean | undefined;
  }
>(r.language.users._.show.$parseQuery);

//
// bind
//
expectType<
  (params: {
    path: {
      userId: number;
    };
    query: {
      filter?: boolean | undefined;
    };
  }) => string
>(
  r.language.$bind({ path: { lang: "" } }).users.$bind({ query: { page: 1 } })
    .show.$render
);

//
// from
//
expectType<
  (params: {
    path: {
      userId: number;
    };
    query: {
      filter?: boolean | undefined;
    };
  }) => string
>(
  r.language.users.$from("de/users/5?page=2", {
    path: { lang: "" },
    query: { page: 1 },
  }).show.$render
);

//
// replace
//
expectType<
  (
    location: string,
    params: {
      path: {
        lang?: string | undefined;
        userId?: number | undefined;
      };
      query: {
        page?: number | undefined;
        filter?: boolean | undefined;
      };
    }
  ) => string
>(r.language.users.show.$replace);

// @ts-expect-error
expectType<null>(r.language.users.show.$replace);

//
// render options
//

const withOptions = createRoutes(
  {
    home: {},
    language: {
      path: [str("lang")],
      children: {
        users: {
          path: ["users"],
        },
      },
    },
  },
  {
    ...defaultContext,
    renderPath: (ctx: AnyRenderContext) => ({ path: "", query: "" }),
    renderTemplate: (ctx: AnyRenderContext) => ({
      path: [""],
      query: [""],
    }),
  }
);
expectType<
  (params: {}) => {
    path: string;
    query: string;
  }
>(withOptions.home.$render);
expectType<
  () => {
    path: string[];
    query: string[];
  }
>(withOptions.home.$template);

expectType<
  () => {
    path: number[];
    query: number[];
  }
  // @ts-expect-error
>(withOptions.home.$template);

//
// composition
//

const extraRoutes = {
  ...r.$routes,
  extra: {
    path: ["extra"],
    children: r.$routes,
  },
} satisfies RouteNodeMap;

const extra = createRoutes(extraRoutes);

expectType<typeof extraRoutes>(extra.$routes);
// @ts-expect-error
expectType<never>(extra.$routes);
// @ts-expect-error
expectType<string>(extra.$routes);
expectType<typeof r.$routes.language>(extra.$routes.language);
// @ts-expect-error
expectType<never>(extra.$routes.language);
// @ts-expect-error
expectType<string>(extra.$routes.language);
expectType<typeof r.$routes>(extra.$routes.extra.children);
