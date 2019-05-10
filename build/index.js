"use strict";
exports.__esModule = true;
exports.routeBuilder = function (prefix) { return function (k) {
    var _this = this;
    return k === undefined
        ? this.cb().filter(isDefined).join("/")
        : exports.routeBuilder().bind({
            cb: function (x) {
                return _this && _this.cb ? _this.cb(k).concat([x]) : [prefix, k, x];
            }
        });
}; };
var isDefined = function (x) { return x !== undefined; };
//# sourceMappingURL=index.js.map