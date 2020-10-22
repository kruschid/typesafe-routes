"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.recursiveRoute = exports.route = exports.routeFn = exports.booleanParser = exports.dateParser = exports.intParser = exports.floatParser = exports.stringParser = void 0;
var qs_1 = require("qs");
exports.stringParser = {
    parse: function (s) { return s; },
    serialize: function (s) { return s; }
};
exports.floatParser = {
    parse: function (s) { return parseFloat(s); },
    serialize: function (x) { return x.toString(); }
};
exports.intParser = {
    parse: function (s) { return parseInt(s); },
    serialize: function (x) { return x.toString(); }
};
exports.dateParser = {
    parse: function (s) { return new Date(s); },
    serialize: function (d) { return d.toISOString(); }
};
exports.booleanParser = {
    parse: function (s) { return s === "true"; },
    serialize: function (b) { return b.toString(); }
};
var isPathParam = function (x) { return typeof x !== "string"; };
var filterParserMap = function (parserMap, tokens) {
    return tokens.reduce(function (acc, t) {
        var _a;
        return !isPathParam(t) ? acc : __assign(__assign({}, acc), (_a = {}, _a[t.name] = parserMap[t.name], _a));
    }, {});
};
var parseRoute = function (pathWithQuery, parserMap) {
    var _a = pathWithQuery.split("&"), pathTemplate = _a[0], queryFragments = _a.slice(1);
    var pathTokens = parseTokens(pathTemplate.split("/"));
    var queryTokens = parseTokens(queryFragments);
    var pathParamParsers = filterParserMap(parserMap, pathTokens);
    var queryParamParsers = filterParserMap(parserMap, queryTokens);
    return {
        pathTemplate: pathTemplate,
        pathTokens: pathTokens,
        queryTokens: queryTokens,
        pathParamParsers: pathParamParsers,
        queryParamParsers: queryParamParsers,
        parserMap: parserMap
    };
};
var parseTokens = function (path) {
    return path.reduce(function (acc, f) {
        if (!f) {
            return acc;
        }
        else if (f.startsWith(":")) {
            var maybeMod = f[f.length - 1];
            var modifier = maybeMod === "+" || maybeMod === "*" || maybeMod === "?"
                ? maybeMod : "";
            return acc.concat({
                modifier: modifier,
                name: f.slice(1, modifier ? f.length - 1 : undefined)
            });
        }
        return acc.concat(f);
    }, []);
};
var stringifyParams = function (parserMap, params) {
    return Object.keys(parserMap).reduce(function (acc, k) {
        var _a;
        return (__assign(__assign({}, acc), (params[k] ? (_a = {}, _a[k] = parserMap[k].serialize(params[k]), _a) : {})));
    }, {});
};
function routeFn(templateWithQuery, parserMap, children) {
    var _this = this;
    var parsedRoute = parseRoute(templateWithQuery, parserMap);
    // DEBUG:
    // console.log("routeFn", {templateWithQuery, parserMap, parsedRoute});
    var fn = function (rawParams) { return new Proxy({}, { get: function (target, next, receiver) {
            var pathParams = stringifyParams(parsedRoute.pathParamParsers, rawParams);
            var queryParams = __assign(__assign({}, _this.previousQueryParams), stringifyParams(parsedRoute.queryParamParsers, rawParams));
            var path = stringifyRoute(parsedRoute.pathTokens, pathParams, _this.previousPath);
            return next === "$" ? (path + qs_1.stringify(queryParams, { addQueryPrefix: true })) : next === Symbol.toPrimitive ? (function () { return path + qs_1.stringify(queryParams, { addQueryPrefix: true }); }) : next === "$self" ? (exports.route.call({
                previousPath: path,
                previousQueryParams: queryParams
            }, templateWithQuery, parserMap, children)) : typeof next == "string" && children[next] ? (exports.route.call({
                previousPath: path,
                previousQueryParams: queryParams
            }, children[next].templateWithQuery, children[next].parserMap, children[next].children)) : Reflect.get(target, next, receiver);
        } }); };
    fn.parseParams = paramsParser(parsedRoute);
    fn.templateWithQuery = templateWithQuery,
        fn.children = children,
        fn.parserMap = parserMap,
        fn.template = parsedRoute.pathTemplate;
    return fn;
}
exports.routeFn = routeFn;
exports.route = routeFn;
exports.recursiveRoute = routeFn;
var stringifyRoute = function (pathTokens, params, prefixPath) {
    if (prefixPath === void 0) { prefixPath = ""; }
    return [prefixPath].concat(pathTokens.reduce(function (acc, t) {
        return isPathParam(t) ? (params[t.name] ? acc.concat(encodeURIComponent(params[t.name])) : acc) : (acc.concat(t));
    }, []))
        .join("/");
};
var paramsParser = function (_a) {
    var pathTokens = _a.pathTokens, queryTokens = _a.queryTokens, parserMap = _a.parserMap;
    return function (params, strict) {
        if (strict === void 0) { strict = false; }
        var parsedParams = Object.keys(params)
            .reduce(function (acc, k) {
            var _a;
            return (__assign(__assign({}, acc), (parserMap[k] ? (_a = {},
                _a[k] = parserMap[k].parse(params[k]),
                _a) : {})));
        }, {});
        if (strict) {
            pathTokens.concat(queryTokens)
                .forEach(function (t) {
                if (isPathParam(t) && ["", "+"].includes(t.modifier) && !parsedParams[t.name]) {
                    throw Error("[parseParams]: parameter \"" + t.name + "\" is required but is not defined");
                }
            });
        }
        return parsedParams;
    };
};
//# sourceMappingURL=index.js.map