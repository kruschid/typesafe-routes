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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.Redirect = exports.NavLink = exports.Link = exports.useRouteParams = void 0;
var React = __importStar(require("react"));
var qs_1 = require("qs");
var react_router_dom_1 = require("react-router-dom");
var useRouteParams = function (r, o) {
    if (o === void 0) { o = {}; }
    var search = react_router_dom_1.useLocation().search;
    return r.parseParams(__assign(__assign({}, react_router_dom_1.useParams()), qs_1.parse(search, __assign({ ignoreQueryPrefix: true }, o))));
};
exports.useRouteParams = useRouteParams;
var Link = function (p) {
    return React.createElement(react_router_dom_1.Link, __assign({}, p, { to: p.to.$ }), p.children);
};
exports.Link = Link;
var NavLink = function (p) {
    return React.createElement(react_router_dom_1.NavLink, __assign({}, p, { to: p.to.$ }), p.children);
};
exports.NavLink = NavLink;
var Redirect = function (p) {
    return React.createElement(react_router_dom_1.Redirect, __assign({}, p, { to: p.to.$ }));
};
exports.Redirect = Redirect;
//# sourceMappingURL=react-router.js.map