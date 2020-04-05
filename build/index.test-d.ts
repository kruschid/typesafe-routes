import { expectError, expectType } from "tsd";
import { R, RouteFn, RouteParams, QueryParams, queryParams } from ".";

interface NoParams {
  name: "a"
  params: []
  children: WithParams
}

interface WithParams {
  name: "b"
  params: [{id: number}]
  children:
    | WithParams
    | WithParamsOverloaded
}

interface WithParamsOverloaded {
  name: "c"
  params:
    | []
    | [":n"]
    | [{n: number}, {s: string}, {b: boolean}]
    | [QueryParams<{name: string}>]
  children: NoParams
}

const r = R<NoParams>();

expectType<string>(r.a().$);
expectType<string>(r.a().b({id: 1}).$);
expectType<string>(r.a().b({id: 1}).c().$);
expectType<string>(r.a().b({id: 1}).b({id: 2}).b({id: 3}).$);
expectType<string>(r.a().b({id: 1}).b({id: 2}).b({id: 3}).c(":n").$);
expectType<RouteFn<WithParams>>(r.a());
expectType<RouteFn<WithParams | WithParamsOverloaded>>(r.a().b({id: 1}));
expectType<RouteFn<WithParams | WithParamsOverloaded>>(r.a().b({id: 1}).b({id: 4}));
expectType<RouteFn<NoParams>>(r.a().b({id: 1}).b({id: 4}).c());
expectError(r.a("invalid"));
expectError(r.a().b());
expectError(r.a().b({id: 1}).b());
expectError(r.a().b({id: 1}).c(""));
expectError(r.a().b({id: 1}).c({}));
expectError(r.a().b({id: 1}).c(4));

expectType<RouteParams<NoParams>>({} as unknown);
expectType<RouteParams<WithParams>>({
  id: 4,
});

expectError<RouteParams<WithParamsOverloaded>>({
  b: true,
  s: ""
});
expectError<RouteParams<WithParams>>({
  id: "",
});

// query params
expectType<RouteParams<WithParamsOverloaded>>(
  Object.assign(
    { b: true },
    { n: 1 },
    { s: "" },
    queryParams({name: ""}),
  ),
);
expectError<RouteParams<WithParamsOverloaded>>(
  Object.assign(
    { b: true },
    { n: 1 },
    { s: "" },
    queryParams({name: 1}),
  ),
);
expectError<RouteParams<WithParamsOverloaded>>(
  Object.assign(
    { b: true },
    { n: 1 },
    { s: "" },
    queryParams({text: ""}),
  ),
);