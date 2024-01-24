
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
        const ctx = $32eacec5806efe44$var$pipe(context ?? $32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$withRawParams(params?.path), $32eacec5806efe44$var$withRawQuery(params?.query), $32eacec5806efe44$var$withParsedParams, $32eacec5806efe44$var$withParsedQuery);
        return renderer.render(ctx);
    };
    const bind = (path, params)=>{
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$withRawParams(params.path), $32eacec5806efe44$var$withRawQuery(params.query));
        const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $32eacec5806efe44$export$dfc730c04fdecfcb(pathChildren, renderer, ctx);
    };
    const template = (path)=>renderer.template($32eacec5806efe44$var$createRenderContext(routeMap, path));
    const parseParams = (path, params)=>{
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), typeof params === "string" ? $32eacec5806efe44$var$withRawParamsFromLocationPath(params) : $32eacec5806efe44$var$withRawParams(params), $32eacec5806efe44$var$withParsedParams);
        return ctx.parsedParams;
    };
    const parseQuery = (path, query)=>{
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), typeof query === "string" ? $32eacec5806efe44$var$withRawQueryFromUrlSearch(query) : $32eacec5806efe44$var$withRawQuery(query), $32eacec5806efe44$var$withParsedQuery);
        return ctx.parsedQuery;
    };
    const from = (path, location, overrideParams)=>{
        const [locationPath, locationQuery] = location.split("?");
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$withRawParamsFromLocationPath(locationPath), $32eacec5806efe44$var$withRawQueryFromUrlSearch(locationQuery), $32eacec5806efe44$var$withRawParams(overrideParams.path), $32eacec5806efe44$var$withRawQuery(overrideParams.query));
        const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $32eacec5806efe44$export$dfc730c04fdecfcb(pathChildren, renderer, ctx);
    };
    // basically the same as the from method but returns rendered path with remaining segments appended
    // appends query string as well (if available)
    const replace = (path, location, overrideParams)=>{
        const [locationPath, locationQuery] = location.split("?");
        const ctx = $32eacec5806efe44$var$pipe($32eacec5806efe44$var$createRenderContext(routeMap, path, parentContext), $32eacec5806efe44$var$withRawParamsFromLocationPath(locationPath, true), $32eacec5806efe44$var$withRawParams(overrideParams.path), $32eacec5806efe44$var$withRawQueryFromUrlSearch(locationQuery, true), $32eacec5806efe44$var$withRawQuery(overrideParams.query), $32eacec5806efe44$var$withParsedParams, $32eacec5806efe44$var$withParsedQuery);
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
        path: [],
        query: [],
        isRelative: false,
        rawParams: {},
        rawQuery: {},
        parsedParams: {},
        parsedQuery: {}
    };
    if (!path) return ctx;
    const [absolutePath, relativePath] = path.split("/_");
    const isRelative = typeof relativePath === "string";
    if (isRelative) ctx = {
        ...ctx,
        skippedNodes: ctx.skippedNodes.concat(ctx.nodes),
        nodes: [],
        path: [],
        query: [],
        isRelative: true
    };
    let nextNodeMap = routeMap;
    // skip leading segments in relative path
    if (isRelative) absolutePath.split("/").forEach((nodeName)=>{
        if (!nextNodeMap?.[nodeName]) throw Error(`unknown path segment "${nodeName}" in ${path}`);
        ctx.skippedNodes.push(nextNodeMap[nodeName]);
        nextNodeMap = nextNodeMap[nodeName].children;
    });
    (relativePath ?? absolutePath).split("/").forEach((nodeName, i)=>{
        if (!nextNodeMap) throw Error(`unknown segment ${nodeName}`);
        const nextNode = nextNodeMap[nodeName];
        ctx.nodes.push(nextNode);
        ctx.path.push(...nextNode.path ?? (nextNode.template ? [
            nextNode.template
        ] : []));
        ctx.query.push(...nextNode.query ?? []);
        nextNodeMap = nextNode.children;
    });
    return ctx;
};
const $32eacec5806efe44$var$withRawParamsFromLocationPath = (locationPath = "", includeExtraPath = false)=>(ctx)=>{
        const remaining = locationPath.slice(locationPath[0] === "/" ? 1 : 0).split("/");
        const rawParams = {};
        // keep track of recent optional params since they might contain path segments
        // if a path segment doesn't match the algorithm continues searching in this array
        const recentOptionalParams = [];
        ctx.path.forEach((segment)=>{
            const locationPathSegment = remaining.shift();
            if (typeof segment === "string") {
                if (segment === locationPathSegment) recentOptionalParams.length = 0; // irrelevant from here
                else {
                    // segment might have been swallowed by an optional param
                    let recentParam;
                    let foundMatch = false;
                    while(recentParam = recentOptionalParams.shift())if (rawParams[recentParam] === segment) {
                        delete rawParams[recentParam];
                        // hold segment back for the next iteration
                        locationPathSegment && remaining.unshift(locationPathSegment);
                        foundMatch = true;
                    }
                    if (!foundMatch) throw new Error(`"${locationPath}" doesn't match "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}", missing segment "${segment}"`);
                }
            } else {
                rawParams[segment.name] = locationPathSegment;
                if (segment.kind === "optional") recentOptionalParams.push(segment.name);
                else if (!locationPathSegment) throw new Error(`"${locationPath}" doesn't match "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}", missing parameter "${segment.name}"`);
                else recentOptionalParams.length = 0;
            }
        });
        return {
            ...ctx,
            rawParams: rawParams,
            path: includeExtraPath ? ctx.path.concat(remaining) : ctx.path
        };
    };
const $32eacec5806efe44$var$withRawParams = (rawParams)=>(ctx)=>({
            ...ctx,
            rawParams: {
                ...ctx.rawParams,
                ...rawParams
            }
        });
const $32eacec5806efe44$var$withParsedParams = (ctx)=>{
    const parsedParams = {};
    ctx.path.forEach((segment)=>{
        if (typeof segment === "string") return;
        if (ctx.rawParams[segment.name]) parsedParams[segment.name] = segment.parser.parse(ctx.rawParams[segment.name]);
        else if (segment.kind === "required") throw Error(`required path parameter "${segment.name}" was not provided in "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
    });
    return {
        ...ctx,
        parsedParams: parsedParams
    };
};
const $32eacec5806efe44$var$withRawQueryFromUrlSearch = (urlSearchParams = "", includeExtraQuery = false)=>(ctx)=>({
            ...ctx,
            ...$32eacec5806efe44$var$withRawQuery(Object.fromEntries(new URLSearchParams(urlSearchParams)), includeExtraQuery)(ctx)
        });
const $32eacec5806efe44$var$withRawQuery = (queryParams, includeExtraQuery = false)=>(ctx)=>{
        const remaining = {
            ...queryParams
        };
        const rawQuery = {};
        ctx.query.forEach(({ name: name })=>{
            if (name in remaining) {
                rawQuery[name] = remaining[name];
                delete remaining[name];
            }
        });
        return {
            ...ctx,
            rawQuery: {
                ...ctx.rawQuery,
                ...rawQuery,
                ...includeExtraQuery ? remaining : undefined
            },
            query: includeExtraQuery ? ctx.query.concat(Object.keys(remaining).map((name)=>(0, $d9535790cc0e135e$export$42d51816ce590c93)(name).optional)) : ctx.query
        };
    };
const $32eacec5806efe44$var$withParsedQuery = (ctx)=>{
    const parsedQuery = {};
    ctx.query.forEach((segment)=>{
        if (ctx.rawQuery[segment.name]) parsedQuery[segment.name] = segment.parser.parse(ctx.rawQuery[segment.name]);
        else if (segment.kind === "required") throw Error(`required query parameter "${segment.name}" was not provided in "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}"`);
    });
    return {
        ...ctx,
        parsedQuery: {
            ...ctx.parsedQuery,
            ...parsedQuery
        }
    };
};
const $32eacec5806efe44$var$pipe = (initialCtx, ...fns)=>fns.reduce((ctx, fn)=>fn(ctx), initialCtx);


var $03790c0a1faa379a$exports = {};

$parcel$export($03790c0a1faa379a$exports, "defaultRenderer", () => $03790c0a1faa379a$export$6093ee13d2f7fa25);
const $03790c0a1faa379a$export$6093ee13d2f7fa25 = {
    template: ({ path: path, isRelative: isRelative })=>{
        const template = path.map((pathSegment)=>typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}`).join("/");
        return isRelative ? template //relative
         : `/${template}`; // absolute
    },
    render: ({ path: path, query: query, isRelative: isRelative }, params)=>{
        const pathSegments = [];
        const queryRecord = {};
        // path params
        path.forEach((pathSegment)=>{
            if (typeof pathSegment === "string") pathSegments.push(pathSegment);
            else if (pathSegment.kind === "required" && !params.path[pathSegment.name]) throw Error(`required path parameter ${pathSegment.name} was not specified`);
            else if (params.path[pathSegment.name]) pathSegments.push(pathSegment.parser.serialize(params.path[pathSegment.name]));
        });
        // query params
        query.forEach((queryParam)=>{
            if (queryParam.kind === "required" && !params.query[queryParam.name]) throw Error(`required query parameter ${queryParam.name} was not specified`);
            if (params.query[queryParam.name]) queryRecord[queryParam.name] = queryParam.parser.serialize(params.query[queryParam.name]);
        });
        const searchParams = new URLSearchParams(queryRecord).toString();
        return (isRelative ? "" : "/") + pathSegments.join("/") + (searchParams ? `?` : "") + searchParams;
    }
};




export {$d9535790cc0e135e$export$6f7d1d9d04558207 as param, $d9535790cc0e135e$export$7d260a2a5f8bc19e as int, $d9535790cc0e135e$export$42d51816ce590c93 as str, $d9535790cc0e135e$export$6b5cd3983e3ee5ab as float, $d9535790cc0e135e$export$ea0a2d2ae29ba628 as isoDate, $d9535790cc0e135e$export$324d90190a8b822a as date, $d9535790cc0e135e$export$87b259aa03e3d267 as bool, $d9535790cc0e135e$export$a9a18ae5ba42aeab as oneOf, $d9535790cc0e135e$export$8837f4fc672e936d as list, $d9535790cc0e135e$export$7b419323e6ed4f31 as json, $d9535790cc0e135e$export$b3b2de96497acc47 as base64, $32eacec5806efe44$export$dfc730c04fdecfcb as createRoutes, $03790c0a1faa379a$export$6093ee13d2f7fa25 as defaultRenderer};
//# sourceMappingURL=index.mjs.map
