"use strict";
var _a;
exports.__esModule = true;
var qs_1 = require("qs");
exports.QUERY_FORMATTER = Symbol("QUERY_FORMATTER");
var QueryParams = /** @class */ (function () {
    function QueryParams(params, options) {
        this.params = params;
        this.options = options;
        this[_a] = true;
    }
    QueryParams.prototype.toString = function () {
        return qs_1.stringify(this.params, this.options);
    };
    return QueryParams;
}());
exports.QueryParams = QueryParams;
_a = exports.QUERY_FORMATTER;
exports.R = function (t, prefix) {
    if (prefix === void 0) { prefix = ""; }
    // parameterized node may return void (in case of recursion)
    t = t || {};
    var f = new /** @class */ (function () {
        function F() {
        }
        F.prototype.toString = function () { return prefix; };
        return F;
    }());
    Object.keys(t).forEach(function (k) {
        f[k] = !hasParams(t[k])
            ? exports.R(t[k], prefix + "/" + k)
            : function () {
                var p = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    p[_i] = arguments[_i];
                }
                return exports.R(t[k](), prefix + "/" + renderParams(k, p));
            };
    });
    return f;
};
var hasParams = function (x) {
    return typeof x === "function";
};
var renderParams = function (prefix, params) {
    var path = prefix;
    for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var p = params_1[_i];
        path += "" + (hasQueryParams(p) ? "?" : "/") + (isObject(p) ? getNamedParamValue(p) : p);
    }
    return path;
};
var hasQueryParams = function (x) {
    return x && x[exports.QUERY_FORMATTER];
};
var isObject = function (x) {
    return x && typeof x === 'object' && x.constructor === Object;
};
var getNamedParamValue = function (param) {
    return param[Object.keys(param)[0]];
};
//# sourceMappingURL=index.js.map