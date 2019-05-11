"use strict";
exports.__esModule = true;
exports.routeFactory = function (prefix) {
    var subPath = function (k) {
        var path = this ? this.path : [];
        var generate = function () {
            return [prefix].concat(path, [k]).filter(isDefined).join("/");
        };
        return Object.assign(subPath.bind({ path: path.concat([k]) }), {
            str: generate.bind({ path: path.concat([k]) })
        });
    };
    return subPath;
};
var isDefined = function (x) { return x !== undefined; };
//# sourceMappingURL=index.js.map