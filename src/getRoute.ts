import { A } from "ts-toolbelt";
import { ParamKind, Parser, isoDate, str } from "./param";
import {
  ExcludeEmptyProperties,
  ParamRecordMap,
  RouteNodeMap,
  RouteNodeToParamRecordMap,
} from "./routes";

type ComputeParamRecordMap<Params extends ParamRecordMap> = A.Compute<
  ExcludeEmptyProperties<Params>
>;

type ComputePartialParamRecordMap<Params extends ParamRecordMap> = A.Compute<
  ExcludeEmptyProperties<{
    path: Partial<Params["path"]>;
    query: Partial<Params["query"]>;
  }>
>;

type RoutesContext<
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap = ParamRecordMap
> = {
  [Segment in keyof Routes]: RoutesContext<
    Routes[Segment]["children"] & {}, // shortcut to exclude undefined
    Params & RouteNodeToParamRecordMap<Routes[Segment]>
  >;
} & {
  _: RoutesContext<Routes>;
  $template: () => string;
  $render: (params: ComputeParamRecordMap<Params>) => string;
  $parseParams: (params: Record<string, any>) => Params["path"];
  $parseQuery: (params: Record<string, any>) => Params["query"];
  $bind: (params: ComputeParamRecordMap<Params>) => RoutesContext<Routes>;
  $from: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => RoutesContext<Routes>;
  $replace: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => string;
};

type CreateRoutes = <Routes extends RouteNodeMap>(
  routes: Routes
) => RoutesContext<Routes>;

const createRoutes: CreateRoutes = (routeMap) => {
  const proxy = (
    absolutePath: string[],
    relativePath: string[],
    subRouteMap?: RouteNodeMap
  ) =>
    new Proxy(
      {
        $template: () => "",
        $render: (params: Record<string, unknown>) =>
          console.log(absolutePath, relativePath, subRouteMap),
        // and so on ...
      },
      {
        get(target, p, receiver) {
          if (p === "_") {
            return proxy(
              [...absolutePath, p],
              [p], // reset node path
              subRouteMap
            );
          }
          if (typeof p === "string" && subRouteMap?.[p]) {
            return proxy(
              [...absolutePath, p],
              [...relativePath, p], // append node to path
              subRouteMap?.[p].children
            );
          }
          return Reflect.get(target, p, receiver);
        },
      }
    );

  return proxy([], [], routeMap);
};

const routes = createRoutes({
  home: {},
  blog: {
    path: ["blog", str("lang")],
    children: {
      "*": {
        template: "**",
      },
      category: {
        path: ["category", str("cid")],
        children: {
          "*": {
            template: "**",
          },
          date: {
            path: [isoDate("date")],
          },
        },
      },
    },
  },
});

routes.blog.category.date.$render({
  path: { cid: "", date: new Date(), lang: "" },
});

routes.blog
  .$bind({ path: { lang: "" } })
  .category.$bind({ path: { cid: "" } })
  .date.$render({
    path: { date: new Date() },
  });

routes.blog.category._.date.$render({ path: { date: new Date() } });
routes.home.$render({});
