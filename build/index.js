"use strict";
exports.__esModule = true;
var isObject = function (x) {
    return x && typeof x === 'object' && x.constructor === Object;
};
var getNamedParamValue = function (param) {
    return param[Object.keys(param)[0]];
};
exports.Ruth = function (prefix) {
    if (prefix === void 0) { prefix = ""; }
    var subPath = function (k) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var path = k;
        if (this && this.path) {
            path = this.path + "/" + path;
        }
        for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
            var p = params_1[_a];
            path += "/" + (isObject(p) ? getNamedParamValue(p) : p);
        }
        var str = function () { return prefix + "/" + path; };
        return Object.assign(subPath.bind({ path: path }), { str: str });
    };
    return subPath;
};
//# sourceMappingURL=index.js.map