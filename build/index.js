"use strict";
exports.__esModule = true;
exports.routeFactory = function (prefix) {
    if (prefix === void 0) { prefix = ""; }
    var subPath = function (k) {
        var path = this && this.path ? this.path + "/" + k : k;
        var generate = function () { return prefix + "/" + path; };
        return Object.assign(subPath.bind({ path: path }), {
            str: generate.bind({ path: path })
        });
    };
    return subPath;
};
//# sourceMappingURL=index.js.map