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
var _a;
exports.__esModule = true;
var qs_1 = require("qs");
exports.R = function (prevPath, prevQuery) {
    if (prevPath === void 0) { prevPath = ""; }
    if (prevQuery === void 0) { prevQuery = new QueryParams({}, { addQueryPrefix: true }); }
    return new Proxy({}, {
        get: function (target, next, receiver) {
            return typeof next === "symbol" ? Reflect.get(target, next, receiver)
                : next === "$" ? prevPath + prevQuery
                    : function () {
                        var params = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            params[_i] = arguments[_i];
                        }
                        var _b = [prevPath, prevQuery], path = _b[0], query = _b[1];
                        path = path + "/" + next;
                        for (var _c = 0, params_1 = params; _c < params_1.length; _c++) {
                            var p = params_1[_c];
                            if (hasQueryParams(p)) {
                                query = p.merge(query);
                            }
                            else {
                                path += "/" + (isObject(p) ? getParamValue(p) : p);
                            }
                        }
                        return exports.R(path, query);
                    };
        }
    });
};
var hasQueryParams = function (x) {
    return x && x[exports.QUERY_FORMATTER];
};
var isObject = function (x) {
    return x && typeof x === 'object' && x.constructor === Object;
};
var getParamValue = function (param) {
    return param[Object.keys(param)[0]];
};
exports.QUERY_FORMATTER = Symbol("QUERY_FORMATTER");
var QueryParams = /** @class */ (function () {
    function QueryParams(params, options) {
        this.params = params;
        this.options = options;
        this[_a] = true;
    }
    QueryParams.prototype.merge = function (other) {
        this.params = __assign(__assign({}, this.params), other.params);
        this.options = __assign(__assign({}, this.options), other.options);
        return this;
    };
    QueryParams.prototype.toString = function () {
        return qs_1.stringify(this.params, this.options);
    };
    return QueryParams;
}());
exports.QueryParams = QueryParams;
_a = exports.QUERY_FORMATTER;
//# sourceMappingURL=index.js.map