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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Redirect = exports.NavLink = exports.Link = exports.useRouteParams = void 0;
var qs_1 = require("qs");
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var useRouteParams = function (r, o) {
    if (o === void 0) { o = {}; }
    var search = (0, react_router_dom_1.useLocation)().search;
    return r.parseParams(__assign(__assign({}, (0, react_router_dom_1.useParams)()), (0, qs_1.parse)(search, __assign({ ignoreQueryPrefix: true }, o))));
};
exports.useRouteParams = useRouteParams;
var Link = function (p) {
    return react_1["default"].createElement(react_router_dom_1.Link, __assign({}, p, { to: p.to.$ }), p.children);
};
exports.Link = Link;
var NavLink = function (p) {
    return react_1["default"].createElement(react_router_dom_1.NavLink, __assign({}, p, { to: p.to.$ }), p.children);
};
exports.NavLink = NavLink;
var Redirect = function (p) {
    return react_1["default"].createElement(react_router_dom_1.Navigate, __assign({}, p, { to: p.to.$ }));
};
exports.Redirect = Redirect;
//# sourceMappingURL=react-router.js.map