import { int, str } from "./parser";
import { ParamMap, RouteContext, route } from "./route";

export type RouteMap = Record<string, RouteContext<any, any>>;

type RootTemplateSegment<
  T extends RouteMap,
  IsTemplate = false
> = `/${TemplateSegment<T, IsTemplate>}`;

type TemplateSegment<T extends RouteMap, IsTemplate = false> = {
  [K in keyof T]: K extends string
    ? T[K] extends object // has children
      ?
          | K
          | (IsTemplate extends true ? `${K}/*` : never)
          | `${K}/${TemplateSegment<T[K]["child"], IsTemplate>}`
          | `${K}/_${PartialTemplateSegment<T[K]["child"], IsTemplate>}`
      : K
    : never;
}[keyof T];

type PartialTemplateSegment<T extends RouteMap, IsTemplate = false> = {
  [K in keyof T]: K extends string
    ? T[K] extends object // has children
      ?
          | K
          | (IsTemplate extends true ? `${K}/*` : never)
          | `${K}/${PartialTemplateSegment<T[K]["child"], IsTemplate>}`
      : K
    : never;
}[keyof T];

type RenderOptions<
  Path extends string,
  Route extends RouteMap,
  Options extends ParamMap = ParamMap
> = Path extends `/${infer Rest}` // root segment
  ? RenderOptions<Rest, Route>
  : Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? RenderOptions<Rest, Route[Segment]["child"], Route[Segment]["params"]>
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? RenderOptions<
      Rest,
      Route[Segment]["child"],
      Options & Route[Segment]["params"]
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? Route[Segment]["params"]
  : Options & Route[Path]["params"];

type TrimRenderOptions<T> = Pick<
  T,
  {
    [K in keyof T]: keyof T[K] extends never ? never : K;
  }[keyof T]
>;

type RenderArguments<P extends ParamMap> = [
  ...([keyof P["params"]] extends [never] ? [] : [params: P["params"]]),
  ...([keyof P["query"]] extends [never] ? [] : [query: P["query"]]),
  ...([keyof P["state"]] extends [never] ? [] : [state: P["state"]]),
  ...([keyof P["hash"]] extends [never] ? [] : [hash: P["hash"]])
];

type Routes = <ChildRoutes extends RouteMap>(
  routes: ChildRoutes
) => {
  template: (path: RootTemplateSegment<ChildRoutes, true>) => string;
  vrender: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path,
    options: TrimRenderOptions<RenderOptions<Path, ChildRoutes>>
  ) => string;
  render: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path,
    ...args: RenderArguments<RenderOptions<Path, ChildRoutes>>
  ) => string;
  parse: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path
  ) => TrimRenderOptions<RenderOptions<Path, ChildRoutes>>;
  params: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path
  ) => RenderOptions<Path, ChildRoutes>["params"];
  query: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path
  ) => RenderOptions<Path, ChildRoutes>["query"];
  hash: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path
  ) => RenderOptions<Path, ChildRoutes>["hash"];
  state: <Path extends RootTemplateSegment<ChildRoutes>>(
    path: Path
  ) => RenderOptions<Path, ChildRoutes>["state"];
};

const routes: Routes = null as any;

// prettier-ignore
const r = routes({
  home: route`home`
    .query(int("lalaa"))
    .hash(str("haha"))
    .children({
      news: route`news/${int("newsId")}`
        .query(int("blob").optional),
      weather: route`${str("weather")}`
        .query(int("loloo"))
        .children({
          berlin: route`berlin/${int("berlin")}`,
        }),
    }),
  users: route``,
});

r.template("/home/weather/berlin");
r.template("/home/_weather/berlin/*");
r.vrender("/home", { query: { lalaa: 2 }, hash: { haha: "SDFDS" } });
r.vrender("/home/weather/_berlin", {
  params: { berlin: 2334 },
});
r.render(
  "/home/_weather/berlin",
  { berlin: 123, weather: "sddf" },
  { loloo: 2321 }
);
r.render("/home/_news", { newsId: 123 }, {});
r.vrender("/home/_news", { params: { newsId: 1 }, query: {} });

r.parse("/home/weather/berlin");
r.params("/home/weather/berlin").berlin;
