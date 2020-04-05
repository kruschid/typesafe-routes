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
var qs_1 = require("qs");
exports.HAS_QUERY_PARAMS = Symbol("QUERY_PARAMS");
exports.queryParams = function (params) {
    var _a;
    return (__assign((_a = {}, _a[exports.HAS_QUERY_PARAMS] = true, _a), params));
};
var stringifyQueryParams = function (options) { return function (queryParams) {
    return qs_1.stringify(queryParams, options);
}; };
exports.R = function (path, queryParams, renderSearchQuery) {
    var _a;
    if (path === void 0) { path = ""; }
    if (queryParams === void 0) { queryParams = (_a = {}, _a[exports.HAS_QUERY_PARAMS] = true, _a); }
    if (renderSearchQuery === void 0) { renderSearchQuery = stringifyQueryParams({ addQueryPrefix: true }); }
    return new Proxy({}, {
        get: function (target, next, receiver) {
            return typeof next === "symbol" ? Reflect.get(target, next, receiver)
                : next === "$" ? path + renderSearchQuery(queryParams)
                    : nextRoute(path, queryParams, renderSearchQuery, next);
        }
    });
};
var nextRoute = function (path, queryParams, renderSearchQuery, routeName) { return function () {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    path = path + "/" + routeName;
    for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
        var p = params_1[_a];
        if (hasQueryParams(p)) {
            queryParams = __assign(__assign({}, queryParams), p);
        }
        else {
            path += "/" + (isObject(p) ? getParamValue(p) : p);
        }
    }
    return exports.R(path, queryParams, renderSearchQuery);
}; };
var hasQueryParams = function (x) {
    return x && x[exports.HAS_QUERY_PARAMS];
};
var isObject = function (x) {
    return x && typeof x === 'object' && x.constructor === Object;
};
var getParamValue = function (param) {
    return param[Object.keys(param)[0]];
};
//# sourceMappingURL=index.js.map