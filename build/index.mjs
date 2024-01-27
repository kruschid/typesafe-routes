
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $d9535790cc0e135e$exports = {};

$parcel$export($d9535790cc0e135e$exports, "param", () => $d9535790cc0e135e$export$6f7d1d9d04558207);
$parcel$export($d9535790cc0e135e$exports, "int", () => $d9535790cc0e135e$export$7d260a2a5f8bc19e);
$parcel$export($d9535790cc0e135e$exports, "str", () => $d9535790cc0e135e$export$42d51816ce590c93);
$parcel$export($d9535790cc0e135e$exports, "float", () => $d9535790cc0e135e$export$6b5cd3983e3ee5ab);
$parcel$export($d9535790cc0e135e$exports, "isoDate", () => $d9535790cc0e135e$export$ea0a2d2ae29ba628);
$parcel$export($d9535790cc0e135e$exports, "date", () => $d9535790cc0e135e$export$324d90190a8b822a);
$parcel$export($d9535790cc0e135e$exports, "bool", () => $d9535790cc0e135e$export$87b259aa03e3d267);
$parcel$export($d9535790cc0e135e$exports, "oneOf", () => $d9535790cc0e135e$export$a9a18ae5ba42aeab);
$parcel$export($d9535790cc0e135e$exports, "list", () => $d9535790cc0e135e$export$8837f4fc672e936d);
$parcel$export($d9535790cc0e135e$exports, "json", () => $d9535790cc0e135e$export$7b419323e6ed4f31);
$parcel$export($d9535790cc0e135e$exports, "base64", () => $d9535790cc0e135e$export$b3b2de96497acc47);
const $d9535790cc0e135e$export$6f7d1d9d04558207 = (parser)=>(name)=>({
            name: name,
            kind: "required",
            parser: parser,
            optional: {
                name: name,
                kind: "optional",
                parser: parser
            }
        });
const $d9535790cc0e135e$export$7d260a2a5f8bc19e = $d9535790cc0e135e$export$6f7d1d9d04558207({
    parse: (value)=>{
        const result = parseInt(value, 10);
        if (result !== result) throw new Error(`parameter value is invalid: "${result}"`);
        return result;
    },
    serialize: (value)=>value.toString()
});
const $d9535790cc0e135e$export$42d51816ce590c93 = $d9535790cc0e135e$export$6f7d1d9d04558207({
    parse: (value)=>value,
    serialize: (value)=>value
});
const $d9535790cc0e135e$export$6b5cd3983e3ee5ab = (fractionDigits)=>$d9535790cc0e135e$export$6f7d1d9d04558207({
        parse: (value)=>parseFloat(value),
        serialize: (value)=>value.toFixed(fractionDigits)
    });
const $d9535790cc0e135e$export$ea0a2d2ae29ba628 = $d9535790cc0e135e$export$6f7d1d9d04558207({
    parse: (value)=>new Date(value),
    serialize: (value)=>value.toISOString()
});
const $d9535790cc0e135e$export$324d90190a8b822a = $d9535790cc0e135e$export$6f7d1d9d04558207({
    parse: (value)=>new Date(value),
    serialize: (value)=>value.toISOString().slice(0, 10)
});
const $d9535790cc0e135e$export$87b259aa03e3d267 = $d9535790cc0e135e$export$6f7d1d9d04558207({
    parse: (value)=>value === "true",
    serialize: (value)=>value.toString()
});
const $d9535790cc0e135e$export$a9a18ae5ba42aeab = (...list)=>$d9535790cc0e135e$export$6f7d1d9d04558207({
        parse: (value)=>{
            if (!list.includes(value)) throw new Error(`"${value}" is none of ${list.join(",")}`);
            return value;
        },
        serialize: (value)=>value
    });
const $d9535790cc0e135e$export$8837f4fc672e936d = (_, separator = ";")=>$d9535790cc0e135e$export$6f7d1d9d04558207({
        parse: (value)=>value.split(separator),
        serialize: (options)=>options.join(separator)
    });
const $d9535790cc0e135e$export$7b419323e6ed4f31 = ()=>$d9535790cc0e135e$export$6f7d1d9d04558207({
        parse: (value)=>JSON.parse(value),
        serialize: (value)=>JSON.stringify(value)
    });
const $d9535790cc0e135e$export$b3b2de96497acc47 = ()=>$d9535790cc0e135e$export$6f7d1d9d04558207({
        parse: (value)=>JSON.parse(window.btoa(value)),
        serialize: (value)=>window.atob(JSON.stringify(value))
    });


var $d2d566d7e5ef8617$exports = {};


var $32eacec5806efe44$exports = {};

$parcel$export($32eacec5806efe44$exports, "createRoutes", () => $32eacec5806efe44$export$dfc730c04fdecfcb);

const $32eacec5806efe44$export$dfc730c04fdecfcb = (routeMap, renderer = (0, $03790c0a1faa379a$export$6093ee13d2f7fa25), parentContext)=>{
    const render = (path, params, context)=>{
        const ctx = $32eacec5806efe44$var$pipe(context ?? $32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$addPathParams(params?.path), $32eacec5806efe44$var$addQueryParams(params?.query));
        return renderer.render(ctx);
    };
    const bind = (path, params)=>{
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$addPathParams(params.path), $32eacec5806efe44$var$addQueryParams(params.query));
        const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $32eacec5806efe44$export$dfc730c04fdecfcb(pathChildren, renderer, ctx);
    };
    const template = (path)=>renderer.template($32eacec5806efe44$var$createRenderContext(routeMap, path));
    const parseParams = (path, paramsOrLocation)=>$32eacec5806efe44$var$parsePathParams($32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), typeof paramsOrLocation === "string" ? $32eacec5806efe44$var$addPathParamsFromLocationPath(paramsOrLocation) : $32eacec5806efe44$var$addRawPathParams(paramsOrLocation)));
    const parseQuery = (path, query)=>$32eacec5806efe44$var$parseQueryParams($32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), typeof query === "string" ? $32eacec5806efe44$var$addQueryParamsFromUrlSearch(query) : $32eacec5806efe44$var$addRawQueryParams(query)));
    const from = (path, location, params)=>{
        const [locationPath, locationQuery] = location.split("?");
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$addPathParamsFromLocationPath(locationPath), $32eacec5806efe44$var$addQueryParamsFromUrlSearch(locationQuery), $32eacec5806efe44$var$overrideParams(params));
        const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $32eacec5806efe44$export$dfc730c04fdecfcb(pathChildren, renderer, ctx);
    };
    // basically the same as the from method but returns rendered path with remaining segments appended
    // appends query string as well (if available)
    const replace = (path, location, params)=>{
        const [locationPath, locationQuery] = location.split("?");
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$addPathParamsFromLocationPath(locationPath, true), $32eacec5806efe44$var$addQueryParamsFromUrlSearch(locationQuery, true), $32eacec5806efe44$var$overrideParams(params));
        return renderer.render(ctx);
    };
    return {
        render: render,
        bind: bind,
        template: template,
        parseParams: parseParams,
        parseQuery: parseQuery,
        from: from,
        replace: replace
    };
};
const $32eacec5806efe44$var$createRenderContext = (routeMap, path, parentCtx)=>{
    let ctx = parentCtx ?? {
        skippedNodes: [],
        nodes: [],
        pathSegments: [],
        querySegments: [],
        isRelative: false,
        currentPathSegments: [],
        currentQuerySegments: [],
        pathParams: {},
        queryParams: {}
    };
    if (!path) return ctx;
    const [absolutePath, relativePath] = path.split("/_");
    const isRelative = typeof relativePath === "string";
    if (isRelative) ctx = {
        ...ctx,
        skippedNodes: ctx.skippedNodes.concat(ctx.nodes),
        nodes: [],
        pathSegments: [],
        querySegments: [],
        isRelative: true
    };
    let nextNodeMap = routeMap;
    // skip leading segments in relative path
    if (isRelative) absolutePath.split("/").forEach((nodeName)=>{
        if (!nextNodeMap?.[nodeName]) throw Error(`unknown path segment "${nodeName}" in ${path}`);
        ctx = {
            ...ctx,
            skippedNodes: ctx.skippedNodes.concat(nextNodeMap[nodeName])
        };
        nextNodeMap = nextNodeMap[nodeName].children;
    });
    // resets current segments
    ctx = {
        ...ctx,
        currentPathSegments: [],
        currentQuerySegments: []
    };
    (relativePath ?? absolutePath).split("/").forEach((nodeName, i)=>{
        if (!nextNodeMap) throw Error(`unknown segment ${nodeName}`);
        const nextNode = nextNodeMap[nodeName];
        ctx = {
            ...ctx,
            nodes: ctx.nodes.concat(nextNode),
            pathSegments: ctx.pathSegments.concat(nextNode.path ?? (nextNode.template ? [
                nextNode.template
            ] : [])),
            querySegments: ctx.querySegments.concat(nextNode.query ?? []),
            currentPathSegments: ctx.currentPathSegments.concat(nextNode.path ?? []),
            currentQuerySegments: ctx.currentQuerySegments.concat(nextNode.query ?? [])
        };
        nextNodeMap = nextNode.children;
    });
    return ctx;
};
const $32eacec5806efe44$var$addPathParamsFromLocationPath = (locationPath = "", includeExtraPath = false)=>(ctx)=>{
        const remaining = locationPath.slice(locationPath[0] === "/" ? 1 : 0).split("/");
        const pathParams = {};
        // keep track of recent optional params since they might contain path segments
        // if a path segment doesn't match the algorithm continues searching in this array
        const recentOptionalParams = [];
        ctx.currentPathSegments.forEach((segment)=>{
            const locationPathSegment = remaining.shift();
            if (typeof segment === "string") {
                if (segment === locationPathSegment) recentOptionalParams.length = 0; // irrelevant from here
                else {
                    // segment might have been swallowed by an optional param
                    let recentParam;
                    let foundMatch = false;
                    while(recentParam = recentOptionalParams.shift())if (pathParams[recentParam] === segment) {
                        delete pathParams[recentParam];
                        // hold segment back for the next iteration
                        locationPathSegment && remaining.unshift(locationPathSegment);
                        foundMatch = true;
                    }
                    if (!foundMatch) throw new Error(`"${locationPath}" doesn't match "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}", missing segment "${segment}"`);
                }
            } else {
                if (locationPathSegment != null) {
                    pathParams[segment.name] = locationPathSegment;
                    if (segment.kind === "optional") recentOptionalParams.push(segment.name);
                    else recentOptionalParams.length = 0;
                } else if (segment.kind === "required") throw new Error(`"${locationPath}" doesn't match "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}", missing parameter "${segment.name}"`);
            }
        });
        return {
            ...ctx,
            pathParams: {
                ...ctx.pathParams,
                ...pathParams
            },
            pathSegments: includeExtraPath ? ctx.pathSegments.concat(remaining) : ctx.pathSegments
        };
    };
const $32eacec5806efe44$var$addPathParams = (params)=>(ctx)=>{
        if (!params) return ctx;
        const pathParams = {};
        ctx.currentPathSegments.forEach((segment)=>{
            if (typeof segment === "string") return;
            if (params[segment.name] != null) pathParams[segment.name] = segment.parser.serialize(params[segment.name]);
            else if (segment.kind === "required") throw Error(`required path parameter "${segment.name}" was not provided in "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
        });
        return {
            ...ctx,
            pathParams: {
                ...ctx.pathParams,
                ...pathParams
            }
        };
    };
const $32eacec5806efe44$var$addRawPathParams = (params)=>(ctx)=>({
            ...ctx,
            pathParams: {
                ...ctx.pathParams,
                ...params
            }
        });
const $32eacec5806efe44$var$parsePathParams = (ctx)=>{
    const parsedParams = {};
    ctx.pathSegments.forEach((segment)=>{
        if (typeof segment === "string") return;
        const value = ctx.pathParams[segment.name];
        if (value != null) parsedParams[segment.name] = segment.parser.parse(value);
        else if (segment.kind === "required") throw Error(`parsePathParams: required path parameter "${segment.name}" was not provided in "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
    });
    return parsedParams;
};
const $32eacec5806efe44$var$addQueryParamsFromUrlSearch = (urlSearchParams = "", includeExtraQuery = false)=>(ctx)=>({
            ...ctx,
            ...$32eacec5806efe44$var$addQueryParams(Object.fromEntries(new URLSearchParams(urlSearchParams)), includeExtraQuery)(ctx)
        });
const $32eacec5806efe44$var$addQueryParams = (source, includeExtraQuery = false)=>(ctx)=>{
        const remaining = {
            ...source
        };
        const queryParams = {};
        ctx.currentQuerySegments.forEach(({ name: name, parser: parser, kind: kind })=>{
            if (remaining[name] != null) {
                queryParams[name] = parser.serialize(remaining[name]);
                delete remaining[name];
            } else if (kind === "required") throw Error(`parsePathParams: required path parameter "${name}" was not provided in "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
        });
        return {
            ...ctx,
            queryParams: {
                ...ctx.queryParams,
                ...queryParams,
                ...includeExtraQuery ? remaining : undefined
            },
            querySegments: includeExtraQuery ? ctx.querySegments.concat(Object.keys(remaining).map((name)=>(0, $d9535790cc0e135e$export$42d51816ce590c93)(name).optional)) : ctx.querySegments
        };
    };
const $32eacec5806efe44$var$addRawQueryParams = (params)=>(ctx)=>({
            ...ctx,
            queryParams: {
                ...ctx.queryParams,
                ...params
            }
        });
const $32eacec5806efe44$var$parseQueryParams = (ctx)=>{
    const parsedQuery = {};
    ctx.querySegments.forEach((segment)=>{
        const value = ctx.queryParams[segment.name];
        if (value != null) parsedQuery[segment.name] = segment.parser.parse(value);
        else if (segment.kind === "required") throw Error(`parseQueryParams: required query parameter "${segment.name}" was not provided in "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
    });
    return parsedQuery;
};
const $32eacec5806efe44$var$overrideParams = (params)=>(ctx)=>{
        const pathParams = {
            ...ctx.pathParams
        };
        if (params?.path) ctx.currentPathSegments.forEach((segment)=>{
            if (typeof segment !== "string" && segment.name in params.path) {
                if (params.path[segment.name] != null) pathParams[segment.name] = segment.parser.serialize(params.path[segment.name]);
                else if (segment.kind === "optional") delete pathParams[segment.name];
                else throw Error(`overrideParams: required path parameter "${segment.name}" can not be removed from "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
            }
        });
        const queryParams = {
            ...ctx.queryParams
        };
        if (params?.query) ctx.currentQuerySegments.forEach(({ name: name, kind: kind, parser: parser })=>{
            if (name in params.query) {
                if (params.query[name] != null) queryParams[name] = parser.serialize(params.query[name]);
                else if (kind === "optional") delete queryParams[name];
                else throw Error(`overrideParams: required query parameter "${name}" can not be removed from "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
            }
        });
        return {
            ...ctx,
            pathParams: pathParams,
            queryParams: queryParams
        };
    };
const $32eacec5806efe44$var$pipe = (initialCtx, ...fns)=>fns.reduce((ctx, fn)=>fn(ctx), initialCtx);


var $03790c0a1faa379a$exports = {};

$parcel$export($03790c0a1faa379a$exports, "defaultRenderer", () => $03790c0a1faa379a$export$6093ee13d2f7fa25);
const $03790c0a1faa379a$export$6093ee13d2f7fa25 = {
    template: ({ pathSegments: pathSegments, isRelative: isRelative })=>{
        const template = pathSegments.map((pathSegment)=>typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}`).join("/");
        return isRelative ? template //relative
         : `/${template}`; // absolute
    },
    render: ({ pathSegments: pathSegments, isRelative: isRelative, pathParams: pathParams, queryParams: queryParams })=>{
        const path = [];
        // path params
        pathSegments.forEach((pathSegment)=>{
            if (typeof pathSegment === "string") path.push(pathSegment);
            else if (pathParams[pathSegment.name] != null) path.push(pathParams[pathSegment.name]);
        });
        const searchParams = new URLSearchParams(queryParams).toString();
        return (isRelative ? "" : "/") + path.join("/") + (searchParams ? `?` : "") + searchParams;
    }
};




export {$d9535790cc0e135e$export$6f7d1d9d04558207 as param, $d9535790cc0e135e$export$7d260a2a5f8bc19e as int, $d9535790cc0e135e$export$42d51816ce590c93 as str, $d9535790cc0e135e$export$6b5cd3983e3ee5ab as float, $d9535790cc0e135e$export$ea0a2d2ae29ba628 as isoDate, $d9535790cc0e135e$export$324d90190a8b822a as date, $d9535790cc0e135e$export$87b259aa03e3d267 as bool, $d9535790cc0e135e$export$a9a18ae5ba42aeab as oneOf, $d9535790cc0e135e$export$8837f4fc672e936d as list, $d9535790cc0e135e$export$7b419323e6ed4f31 as json, $d9535790cc0e135e$export$b3b2de96497acc47 as base64, $32eacec5806efe44$export$dfc730c04fdecfcb as createRoutes, $03790c0a1faa379a$export$6093ee13d2f7fa25 as defaultRenderer};
//# sourceMappingURL=index.mjs.map
