"use strict";
exports.__esModule = true;
exports.booleanParser = exports.dateParser = exports.intParser = exports.floatParser = exports.stringParser = void 0;
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
//# sourceMappingURL=parser.js.map