
function $parcel$exportWildcard(dest, source) {
  Object.keys(source).forEach(function(key) {
    if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) {
      return;
    }

    Object.defineProperty(dest, key, {
      enumerable: true,
      get: function get() {
        return source[key];
      }
    });
  });

  return dest;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $7bf57fe77896cce6$exports = {};

$parcel$export($7bf57fe77896cce6$exports, "param", () => $7bf57fe77896cce6$export$6f7d1d9d04558207);
$parcel$export($7bf57fe77896cce6$exports, "int", () => $7bf57fe77896cce6$export$7d260a2a5f8bc19e);
$parcel$export($7bf57fe77896cce6$exports, "str", () => $7bf57fe77896cce6$export$42d51816ce590c93);
$parcel$export($7bf57fe77896cce6$exports, "float", () => $7bf57fe77896cce6$export$6b5cd3983e3ee5ab);
$parcel$export($7bf57fe77896cce6$exports, "isoDate", () => $7bf57fe77896cce6$export$ea0a2d2ae29ba628);
$parcel$export($7bf57fe77896cce6$exports, "date", () => $7bf57fe77896cce6$export$324d90190a8b822a);
$parcel$export($7bf57fe77896cce6$exports, "bool", () => $7bf57fe77896cce6$export$87b259aa03e3d267);
$parcel$export($7bf57fe77896cce6$exports, "oneOf", () => $7bf57fe77896cce6$export$a9a18ae5ba42aeab);
$parcel$export($7bf57fe77896cce6$exports, "list", () => $7bf57fe77896cce6$export$8837f4fc672e936d);
$parcel$export($7bf57fe77896cce6$exports, "json", () => $7bf57fe77896cce6$export$7b419323e6ed4f31);
$parcel$export($7bf57fe77896cce6$exports, "base64", () => $7bf57fe77896cce6$export$b3b2de96497acc47);
const $7bf57fe77896cce6$export$6f7d1d9d04558207 = (parser)=>(name)=>({
            name: name,
            kind: "required",
            parser: parser,
            optional: {
                name: name,
                kind: "optional",
                parser: parser
            }
        });
const $7bf57fe77896cce6$export$7d260a2a5f8bc19e = $7bf57fe77896cce6$export$6f7d1d9d04558207({
    parse: (value)=>{
        const result = parseInt(value, 10);
        if (result !== result) throw new Error(`parameter value is invalid: "${result}"`);
        return result;
    },
    serialize: (value)=>value.toString()
});
const $7bf57fe77896cce6$export$42d51816ce590c93 = $7bf57fe77896cce6$export$6f7d1d9d04558207({
    parse: (value)=>value,
    serialize: (value)=>value
});
const $7bf57fe77896cce6$export$6b5cd3983e3ee5ab = (fractionDigits)=>$7bf57fe77896cce6$export$6f7d1d9d04558207({
        parse: (value)=>parseFloat(value),
        serialize: (value)=>value.toFixed(fractionDigits)
    });
const $7bf57fe77896cce6$export$ea0a2d2ae29ba628 = $7bf57fe77896cce6$export$6f7d1d9d04558207({
    parse: (value)=>new Date(value),
    serialize: (value)=>value.toISOString()
});
const $7bf57fe77896cce6$export$324d90190a8b822a = $7bf57fe77896cce6$export$6f7d1d9d04558207({
    parse: (value)=>new Date(value),
    serialize: (value)=>value.toISOString().slice(0, 10)
});
const $7bf57fe77896cce6$export$87b259aa03e3d267 = $7bf57fe77896cce6$export$6f7d1d9d04558207({
    parse: (value)=>value === "true",
    serialize: (value)=>value.toString()
});
const $7bf57fe77896cce6$export$a9a18ae5ba42aeab = (...list)=>$7bf57fe77896cce6$export$6f7d1d9d04558207({
        parse: (value)=>{
            if (!list.includes(value)) throw new Error(`"${value}" is none of ${list.join(",")}`);
            return value;
        },
        serialize: (value)=>value
    });
const $7bf57fe77896cce6$export$8837f4fc672e936d = (_, separator = ";")=>$7bf57fe77896cce6$export$6f7d1d9d04558207({
        parse: (value)=>value.split(separator),
        serialize: (options)=>options.join(separator)
    });
const $7bf57fe77896cce6$export$7b419323e6ed4f31 = ()=>$7bf57fe77896cce6$export$6f7d1d9d04558207({
        parse: (value)=>JSON.parse(value),
        serialize: (value)=>JSON.stringify(value)
    });
const $7bf57fe77896cce6$export$b3b2de96497acc47 = ()=>$7bf57fe77896cce6$export$6f7d1d9d04558207({
        parse: (value)=>JSON.parse(window.btoa(value)),
        serialize: (value)=>window.atob(JSON.stringify(value))
    });


var $e654573c7d1ab169$exports = {};


var $d027411d9f32df53$exports = {};

$parcel$export($d027411d9f32df53$exports, "createRoutes", () => $d027411d9f32df53$export$dfc730c04fdecfcb);

const $d027411d9f32df53$export$dfc730c04fdecfcb = (routeMap, renderer = (0, $52e32790be7c44a2$export$6093ee13d2f7fa25), parentContext)=>{
    const render = (path, params, context)=>{
        const ctx = $d027411d9f32df53$var$pipe(context ?? $d027411d9f32df53$var$createRenderContext(routeMap, path, parentContext), $d027411d9f32df53$var$withRawParams(params?.path), $d027411d9f32df53$var$withRawQuery(params?.query), $d027411d9f32df53$var$withParsedParams, $d027411d9f32df53$var$withParsedQuery);
        return renderer.render(ctx);
    };
    const bind = (path, params)=>{
        const ctx = $d027411d9f32df53$var$pipe($d027411d9f32df53$var$createRenderContext(routeMap, path, parentContext), $d027411d9f32df53$var$withRawParams(params.path), $d027411d9f32df53$var$withRawQuery(params.query));
        const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $d027411d9f32df53$export$dfc730c04fdecfcb(pathChildren, renderer, ctx);
    };
    const template = (path)=>renderer.template($d027411d9f32df53$var$createRenderContext(routeMap, path));
    const parseParams = (path, params)=>{
        const ctx = $d027411d9f32df53$var$pipe($d027411d9f32df53$var$createRenderContext(routeMap, path, parentContext), typeof params === "string" ? $d027411d9f32df53$var$withRawParamsFromLocationPath(params) : $d027411d9f32df53$var$withRawParams(params), $d027411d9f32df53$var$withParsedParams);
        return ctx.parsedParams;
    };
    const parseQuery = (path, query)=>{
        const ctx = $d027411d9f32df53$var$pipe($d027411d9f32df53$var$createRenderContext(routeMap, path, parentContext), typeof query === "string" ? $d027411d9f32df53$var$withRawQueryFromUrlSearch(query) : $d027411d9f32df53$var$withRawQuery(query), $d027411d9f32df53$var$withParsedQuery);
        return ctx.parsedQuery;
    };
    const from = (path, location, overrideParams)=>{
        const [locationPath, locationQuery] = location.split("?");
        const ctx = $d027411d9f32df53$var$pipe($d027411d9f32df53$var$createRenderContext(routeMap, path, parentContext), $d027411d9f32df53$var$withRawParamsFromLocationPath(locationPath), $d027411d9f32df53$var$withRawQueryFromUrlSearch(locationQuery), $d027411d9f32df53$var$withRawParams(overrideParams.path), $d027411d9f32df53$var$withRawQuery(overrideParams.query));
        const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $d027411d9f32df53$export$dfc730c04fdecfcb(pathChildren, renderer, ctx);
    };
    // basically the same as the from method but returns rendered path with remaining segments appended
    // appends query string as well (if available)
    const replace = (path, location, overrideParams)=>{
        const [locationPath, locationQuery] = location.split("?");
        const ctx = $d027411d9f32df53$var$pipe($d027411d9f32df53$var$createRenderContext(routeMap, path, parentContext), $d027411d9f32df53$var$withRawParamsFromLocationPath(locationPath, true), $d027411d9f32df53$var$withRawParams(overrideParams.path), $d027411d9f32df53$var$withRawQueryFromUrlSearch(locationQuery, true), $d027411d9f32df53$var$withRawQuery(overrideParams.query), $d027411d9f32df53$var$withParsedParams, $d027411d9f32df53$var$withParsedQuery);
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
const $d027411d9f32df53$var$createRenderContext = (routeMap, path, parentCtx)=>{
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
const $d027411d9f32df53$var$withRawParamsFromLocationPath = (locationPath = "", includeExtraPath = false)=>(ctx)=>{
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
                    if (!foundMatch) throw new Error(`"${locationPath}" doesn't match "${(0, $52e32790be7c44a2$export$6093ee13d2f7fa25).template(ctx)}", missing segment "${segment}"`);
                }
            } else {
                rawParams[segment.name] = locationPathSegment;
                if (segment.kind === "optional") recentOptionalParams.push(segment.name);
                else if (!locationPathSegment) throw new Error(`"${locationPath}" doesn't match "${(0, $52e32790be7c44a2$export$6093ee13d2f7fa25).template(ctx)}", missing parameter "${segment.name}"`);
                else recentOptionalParams.length = 0;
            }
        });
        return {
            ...ctx,
            rawParams: rawParams,
            path: includeExtraPath ? ctx.path.concat(remaining) : ctx.path
        };
    };
const $d027411d9f32df53$var$withRawParams = (rawParams)=>(ctx)=>({
            ...ctx,
            rawParams: {
                ...ctx.rawParams,
                ...rawParams
            }
        });
const $d027411d9f32df53$var$withParsedParams = (ctx)=>{
    const parsedParams = {};
    ctx.path.forEach((segment)=>{
        if (typeof segment === "string") return;
        if (ctx.rawParams[segment.name]) parsedParams[segment.name] = segment.parser.parse(ctx.rawParams[segment.name]);
        else if (segment.kind === "required") throw Error(`required path parameter "${segment.name}" was not provided in "${(0, $52e32790be7c44a2$export$6093ee13d2f7fa25).template(ctx)}"`);
    });
    return {
        ...ctx,
        parsedParams: parsedParams
    };
};
const $d027411d9f32df53$var$withRawQueryFromUrlSearch = (urlSearchParams = "", includeExtraQuery = false)=>(ctx)=>({
            ...ctx,
            ...$d027411d9f32df53$var$withRawQuery(Object.fromEntries(new URLSearchParams(urlSearchParams)), includeExtraQuery)(ctx)
        });
const $d027411d9f32df53$var$withRawQuery = (queryParams, includeExtraQuery = false)=>(ctx)=>{
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
            query: includeExtraQuery ? ctx.query.concat(Object.keys(remaining).map((name)=>(0, $7bf57fe77896cce6$export$42d51816ce590c93)(name).optional)) : ctx.query
        };
    };
const $d027411d9f32df53$var$withParsedQuery = (ctx)=>{
    const parsedQuery = {};
    ctx.query.forEach((segment)=>{
        if (ctx.rawQuery[segment.name]) parsedQuery[segment.name] = segment.parser.parse(ctx.rawQuery[segment.name]);
        else if (segment.kind === "required") throw Error(`required query parameter "${segment.name}" was not provided in "${(0, $52e32790be7c44a2$export$6093ee13d2f7fa25).template(ctx)}"`);
    });
    return {
        ...ctx,
        parsedQuery: {
            ...ctx.parsedQuery,
            ...parsedQuery
        }
    };
};
const $d027411d9f32df53$var$pipe = (initialCtx, ...fns)=>fns.reduce((ctx, fn)=>fn(ctx), initialCtx);


var $52e32790be7c44a2$exports = {};

$parcel$export($52e32790be7c44a2$exports, "defaultRenderer", () => $52e32790be7c44a2$export$6093ee13d2f7fa25);
const $52e32790be7c44a2$export$6093ee13d2f7fa25 = {
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


$parcel$exportWildcard(module.exports, $7bf57fe77896cce6$exports);
$parcel$exportWildcard(module.exports, $e654573c7d1ab169$exports);
$parcel$exportWildcard(module.exports, $d027411d9f32df53$exports);
$parcel$exportWildcard(module.exports, $52e32790be7c44a2$exports);


//# sourceMappingURL=index.cjs.map
