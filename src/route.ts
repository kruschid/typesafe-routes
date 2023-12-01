import { Param } from "./param";
import { int } from "./parser";

type ParserMap<Params extends Param[]> = {
  [K in Params[number]["name"]]: Extract<Params[number], { name: K }>["parser"];
};

type ParamsRecord<
  Params extends Param<any, any, any>[],
  Required = Extract<Params[number], { kind: "required" }>["name"],
  Optional = Extract<Params[number], { kind: "optional" }>["name"]
> = (Required extends string
  ? {
      [K in Required]: ReturnType<
        Extract<Params[number], { name: K }>["parser"]["parse"]
      >;
    }
  : {}) &
  (Optional extends string
    ? {
        [K in Optional]?: ReturnType<
          Extract<Params[number], { name: K }>["parser"]["parse"]
        >;
      }
    : {});

type RouteTag = <
  Params extends Param<any, any, any>[] // inference breaks if this is not extended from an array
>(
  strings: TemplateStringsArray,
  ...params: Params
) => <
  Query extends Param<any, any, any>[],
  Hash extends Param<any, any, any>[],
  State extends Param<any, any, any>[]
>(options?: {
  query?: Query;
  hash?: Hash;
  state?: State;
}) => {
  // $: {
  //   parserMap: ParserMap<Params>;
  //   params: ParamsRecord<Params>;
  //   query: ParamsRecord<Query>;
  //   hash: ParamsRecord<Params>;
  //   state: ParamsRecord<Params>;
  //   template: Template<P>;
  //   params: Params;
  //   render
  //   renderPath
  //   renderQuery
  // };
} & RenderFn<Params, Query, Hash, State>;

type RenderFn<
  Params extends Param<any, any, any>[],
  Query extends Param<any, any, any>[],
  Hash extends Param<any, any, any>[],
  State extends Param<any, any, any>[]
> = (
  // options: RenderOptions<Params, Query, Hash, State>
  ...options: [
    ...(keyof ParamsRecord<Params> extends string
      ? [params: ParamsRecord<Params>]
      : []),
    ...(keyof ParamsRecord<Query> extends string
      ? [query: ParamsRecord<Query>]
      : []),
    ...(keyof ParamsRecord<Hash> extends string
      ? [hash: ParamsRecord<Hash>]
      : []),
    ...(keyof ParamsRecord<State> extends string
      ? [state: ParamsRecord<State>]
      : [])
  ]
) => any;

type RenderOptions<
  Params extends ParamsRecord<any>,
  Query extends ParamsRecord<any>,
  Hash extends ParamsRecord<any>,
  State extends ParamsRecord<any>
> = [
  ...(keyof Params extends string ? [params: Params] : []),
  ...(keyof Query extends string ? [query: Query] : []),
  ...(keyof Hash extends string ? [hash: Hash] : []),
  ...(keyof State extends string ? [state: State] : [])
];

const route: RouteTag = (strings, ...params) => {
  return null as any;
};

const r = route`user/details/*`;
const t = r({
  query: [int("search"), int("test").optional],
});

type XX = Param<any, any, any>[]; // (Param<"search", number, any> | Param<"test", number, "optional">)[]; //
// type XX = (Param<"search", number, any> | Param<"test", number, "optional">)[];
type XXX = Param<any, any, any>[] extends XX ? never : XX;

// t({ hash: {}, query: { search: 1 } });

t({ search: 1 }, {}, {});

const rr = route`user/details/${int("f")}/*`;
const tt = rr({
  // query: [int("abc")],
  state: [int("sd")],
});

tt({ f: 1 }, { abc: 1 }, { sd: 1 });

// easier to read
// no recursive types necessary
const ttt = route`user/${int("id")}/details/${int("limit").optional}/*`({
  query: [int("search"), int("test")],
  hash: [int("hash")],
  state: [int("state"), int("whatever").optional],
  // children: {
  //   settings: route`settings/${int("page")}`({
  //     query: [int("lala").optional],
  //     children: {
  //       privacy: route`privacy/${int("section").optional}`({}),
  //     },
  //   }),
  // },
});

ttt({ id: 1 }, { search: 2, test: 3 }, { hash: 1 }, { state: 1 });

type X = [
  ...[a: { name: "1" }],
  ...[b: { name: "2" }],
  ...[],
  ...[c: { name: 3 }, { name: 4 }],
  ...(5 extends number ? [d: { name: 5 }] : []),
  ...(6 extends string ? [e: { name: 6 }] : [])
];

const f = (...x: X) => null;

f({ name: "1" }, { name: "2" }, { name: 3 }, { name: 4 }, { name: 5 });

type ParamsRecordEmpty = ParamsRecord<Param<any, any, any>[]>;

type T = keyof ParamsRecordEmpty;

type ParamsRecordWithOptional = ParamsRecord<
  (Param<"id", number, "required"> | Param<"name", string, "optional">)[]
>;
type ParamsRecordWithOptionalKeys = keyof ParamsRecordWithOptional;

type QueryRecordWithOptional = ParamsRecord<
  (Param<"search", string, "required"> | Param<"filter", string, "optional">)[]
>;
type QueryRecordWithOptionalKeys = keyof QueryRecordWithOptional;

type ParamsOptionsWithOptional = RenderOptions<
  ParamsRecordWithOptional,
  QueryRecordWithOptional,
  never,
  never
>;

type KK = keyof Param<any, any, any>[];

const fn = (...p: ParamsOptionsWithOptional) => null;

fn({ id: 1 }, { search: "", filter: "" });
