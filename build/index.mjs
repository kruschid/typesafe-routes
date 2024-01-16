
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

const $32eacec5806efe44$export$dfc730c04fdecfcb = (routeMap, renderer = (0, $03790c0a1faa379a$export$6093ee13d2f7fa25), prevSegments, prevParams = {
    path: {},
    query: {}
})=>{
    const template = (path)=>{
        const ctx = $32eacec5806efe44$var$compilePath(routeMap, path);
        return renderer.template(ctx);
    };
    const render = (path, params, context)=>{
        const ctx = context ?? $32eacec5806efe44$var$compilePath(routeMap, path, prevSegments);
        return renderer.render(ctx, $32eacec5806efe44$var$mergeParams(prevParams, params));
    };
    const bind = (path, params)=>{
        const ctx = $32eacec5806efe44$var$compilePath(routeMap, path, prevSegments);
        const currSegmentChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        return $32eacec5806efe44$export$dfc730c04fdecfcb(currSegmentChildren, renderer, ctx, $32eacec5806efe44$var$mergeParams(prevParams, params));
    };
    const parseParams = (path, params, maybeContext)=>{
        const parsedParams = {};
        const ctx = maybeContext ?? $32eacec5806efe44$var$compilePath(routeMap, path);
        ctx.path.forEach((segment)=>{
            if (typeof segment === "string") return;
            if (params[segment.name]) parsedParams[segment.name] = segment.parser.parse(params[segment.name]);
            else if (segment.kind === "required") throw Error(`required path parameter "${segment.name}" was not provided for "${path}"`);
        });
        return parsedParams;
    };
    const parseQuery = (path, params, maybeContext)=>{
        const parsedParams = {};
        const ctx = maybeContext ?? $32eacec5806efe44$var$compilePath(routeMap, path);
        const paramsRecord = typeof params === "string" ? Object.fromEntries(new URLSearchParams(params)) : params;
        ctx.query.forEach((segment)=>{
            if (paramsRecord[segment.name]) parsedParams[segment.name] = segment.parser.parse(paramsRecord[segment.name]);
            else if (segment.kind === "required") throw Error(`required path parameter "${segment.name}" was not provided for "${path}"`);
        });
        return parsedParams;
    };
    const from = (path, location, overwriteParams)=>{
        // build context from path
        const ctx = $32eacec5806efe44$var$compilePath(routeMap, path);
        const lastNodeChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};
        const { parsedParams: parsedParams } = $32eacec5806efe44$var$matchLocation(path, location, ctx, parseParams, parseQuery);
        return $32eacec5806efe44$export$dfc730c04fdecfcb(lastNodeChildren, renderer, ctx, $32eacec5806efe44$var$mergeParams(prevParams, parsedParams, overwriteParams));
    };
    const replace = (path, location, overwriteParams)=>{
        // basically the same as the from method but returns rendered path with remaining segments appended
        // appends query string as well (if available)
        const ctx = $32eacec5806efe44$var$compilePath(routeMap, path);
        const { parsedParams: parsedParams, tail: tail } = $32eacec5806efe44$var$matchLocation(path, location, ctx, parseParams, parseQuery);
        const ctxWithTail = {
            ...ctx,
            path: ctx.path.concat(tail.path),
            query: ctx.query.concat(tail.query)
        };
        return render(path, $32eacec5806efe44$var$mergeParams(prevParams, parsedParams, overwriteParams), ctxWithTail);
    };
    return {
        template: template,
        bind: bind,
        render: render,
        parseParams: parseParams,
        parseQuery: parseQuery,
        from: from,
        replace: replace
    };
};
const $32eacec5806efe44$var$compilePath = (routeMap, path, parentCtx)=>{
    const ctx = parentCtx ?? {
        skippedNodes: [],
        nodes: [],
        path: [],
        query: [],
        isRelative: false
    };
    if (!path) return ctx;
    const [absolutePath, relativePath] = path.split("/_");
    const isRelative = typeof relativePath === "string";
    if (isRelative) {
        ctx.skippedNodes = ctx.skippedNodes.concat(ctx.nodes);
        ctx.nodes = [];
        ctx.path = [];
        ctx.query = [];
        ctx.isRelative = true;
    }
    let nextNodeMap = routeMap;
    // skip leading segments in relative path
    if (isRelative) absolutePath.split("/").forEach((nodeName)=>{
        if (!nextNodeMap?.[nodeName]) throw Error(`unknown path segment "${nodeName}" in ${path}`);
        ctx.skippedNodes.push(nextNodeMap);
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
    // extract  path segments and query params and determine if path is relative
    return ctx;
};
const $32eacec5806efe44$var$matchLocation = (path, location, ctx, parseParams, parseQuery)=>{
    const [pathname, queryString] = location.split("?");
    const remainingPathSegments = pathname.slice(pathname[0] === "/" ? 1 : 0).split("/");
    const rawPathParams = {};
    // keep track of recent optional params since they might contain path segments
    // if a path segment doesn't match the algorithm continues searching in this array
    const recentOptionalParams = [];
    ctx.path.forEach((segment)=>{
        const pathnameSegment = remainingPathSegments.shift();
        if (typeof segment === "string") {
            if (segment === pathnameSegment) recentOptionalParams.length = 0; // irrelevant from here
            else {
                // segment might have been swallowed by an optional param
                let recentParam;
                let foundMatch = false;
                while(recentParam = recentOptionalParams.shift())if (rawPathParams[recentParam] === segment) {
                    delete rawPathParams[recentParam];
                    // hold segment back for the next iteration
                    pathnameSegment && remainingPathSegments.unshift(pathnameSegment);
                    foundMatch = true;
                }
                if (!foundMatch) throw new Error(`"${pathname}" doesn't match "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}", missing segment "${segment}"`);
            }
        } else {
            rawPathParams[segment.name] = pathnameSegment;
            if (segment.kind === "optional") recentOptionalParams.push(segment.name);
            else if (!pathnameSegment) throw new Error(`"${pathname}" doesn't match "${(0, $03790c0a1faa379a$export$6093ee13d2f7fa25).template(ctx)}", missing parameter "${segment.name}"`);
            else recentOptionalParams.length = 0;
        }
    });
    const rawQueryParams = Object.fromEntries(new URLSearchParams(queryString));
    const parsedParams = {
        path: parseParams(path, rawPathParams, ctx),
        query: parseQuery(path, rawQueryParams, ctx)
    };
    // contains all the remaining path segments and query params
    const tail = {
        path: remainingPathSegments,
        query: Object.entries(rawQueryParams).flatMap(([name, value])=>{
            if (!parsedParams.query[name]) {
                parsedParams.query[name] = value;
                return (0, $d9535790cc0e135e$export$42d51816ce590c93)(name).optional; // context requires a parser, string parser is just the identity function
            }
            return [];
        })
    };
    return {
        parsedParams: parsedParams,
        tail: tail
    };
};
const $32eacec5806efe44$var$mergeParams = (...args)=>{
    const result = {
        path: {},
        query: {}
    };
    args.forEach((next)=>{
        result.path = {
            ...result.path,
            ...next?.path
        };
        result.query = {
            ...result.query,
            ...next?.query
        };
    });
    return result;
};


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
