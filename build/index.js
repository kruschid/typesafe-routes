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
exports.recursiveRoute = exports.route = exports.booleanParser = exports.dateParser = exports.intParser = exports.floatParser = exports.stringParser = void 0;
var path_to_regexp_1 = require("path-to-regexp");
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
var isKey = function (x) { return !!x.name; };
var filterParserMap = function (parserMap, tokens) {
    return tokens.reduce(function (acc, t) {
        var _a;
        return !isKey(t) ? acc : __assign(__assign({}, acc), (_a = {}, _a[t.name] = parserMap[t.name], _a));
    }, {});
};
var parseRoute = function (pathWithQuery, parserMap) {
    var _a = pathWithQuery.split("&"), pathTemplate = _a[0], queryFragments = _a.slice(1);
    var queryTemplate = queryFragments.join("/");
    var pathTokens = path_to_regexp_1.parse(pathTemplate).map(function (t) {
        return isKey(t) ? __assign(__assign({}, t), { name: typeof t.name === "string"
                ? t.name.replace(/\//g, "")
                : t.name }) : t.replace(/\//g, "");
    });
    var queryTokens = path_to_regexp_1.parse(queryTemplate);
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
var stringifyParams = function (parserMap, params) {
    return Object.keys(parserMap).reduce(function (acc, k) {
        var _a;
        return (__assign(__assign({}, acc), (params[k] ? (_a = {}, _a[k] = parserMap[k].serialize(params[k]), _a) : {})));
    }, {});
};
var route = function (templateWithQuery, parserMap, children) {
    var _this = this;
    // DEBUG:
    // console.log("route", {templateWithQuery, parserMap});
    var parsedRoute = parseRoute(templateWithQuery, parserMap);
    return new Proxy(function () { }, {
        apply: function (_, __, _a) {
            var _b, _c;
            var rawParams = _a[0];
            return routeWithParams(parsedRoute, children, rawParams, (_b = _this.previousQueryParams) !== null && _b !== void 0 ? _b : {}, (_c = _this.previousPath) !== null && _c !== void 0 ? _c : "");
        },
        get: function (target, next, receiver) {
            var _a;
            return ((_a = {
                templateWithQuery: templateWithQuery,
                children: children,
                parserMap: parserMap,
                template: parsedRoute.pathTemplate,
                parseParams: paramsParser(parsedRoute)
            }[next]) !== null && _a !== void 0 ? _a : (Reflect.get(target, next, receiver)));
        }
    });
};
exports.route = route;
exports.recursiveRoute = exports.route;
var routeWithParams = function (_a, children, rawParams, previousQueryParams, previousPath) {
    var pathTokens = _a.pathTokens, pathTemplate = _a.pathTemplate, queryParamParsers = _a.queryParamParsers, pathParamParsers = _a.pathParamParsers, parserMap = _a.parserMap;
    return new Proxy({}, {
        get: function (target, next, receiver) {
            var pathParams = stringifyParams(pathParamParsers, rawParams);
            var queryParams = __assign(__assign({}, previousQueryParams), stringifyParams(queryParamParsers, rawParams));
            return "$" === next
                // full path with search query
                ? previousPath + "/" + stringifyRoute(pathTokens, pathParams, queryParams)
                : next === Symbol.toPrimitive ? function () {
                    return previousPath + "/" + stringifyRoute(pathTokens, pathParams, queryParams);
                }
                    // recursive reference
                    : next === "$self" ? exports.route.call({
                        previousPath: previousPath + "/" + stringifyRoute(pathTokens, pathParams),
                        previousQueryParams: queryParams
                    }, pathTemplate, parserMap, children)
                        // child route
                        : typeof next == "string" && children[next] ? exports.route.call({
                            previousPath: previousPath + "/" + stringifyRoute(pathTokens, pathParams),
                            previousQueryParams: queryParams
                        }, children[next].templateWithQuery, children[next].parserMap, children[next].children)
                            : Reflect.get(target, next, receiver);
        }
    });
};
var stringifyRoute = function (pathTokens, params, queryParams) {
    return pathTokens.map(function (t) {
        return isKey(t) ? params[t.name] : t;
    })
        .filter(function (x) { return !!x; })
        .map(encodeURIComponent)
        .join("/") + (queryParams ? qs_1.stringify(queryParams, { addQueryPrefix: true }) : "");
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
                if (isKey(t) && ["", "+"].includes(t.modifier) && !parsedParams[t.name]) {
                    throw Error("[parseParams]: parameter \"" + t.name + "\" is required but is not defined");
                }
            });
        }
        return parsedParams;
    };
};
//# sourceMappingURL=index.js.map