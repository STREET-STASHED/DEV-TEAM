"use strict";
(() => {
var exports = {};
exports.id = 822;
exports.ids = [822];
exports.modules = {

/***/ 2885:
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ 730:
/***/ ((module) => {

module.exports = require("next/dist/server/api-utils/node.js");

/***/ }),

/***/ 3076:
/***/ ((module) => {

module.exports = require("next/dist/server/future/route-modules/route-module.js");

/***/ }),

/***/ 1056:
/***/ ((module) => {

module.exports = require("next/dist/server/web/spec-extension/response.js");

/***/ }),

/***/ 1915:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  config: () => (/* binding */ config),
  "default": () => (/* binding */ next_route_loaderkind_PAGES_API_page_2Fapi_2Forders_2Froute_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Forders_2Froute_ts_middlewareConfigBase64_e30_3D_),
  routeModule: () => (/* binding */ routeModule)
});

// NAMESPACE OBJECT: ./pages/api/orders/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  POST: () => (POST)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/pages-api/module.js
var pages_api_module = __webpack_require__(6429);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(7153);
// EXTERNAL MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/helpers.js
var helpers = __webpack_require__(7305);
// EXTERNAL MODULE: ./node_modules/next/dist/server/web/exports/next-response.js
var next_response = __webpack_require__(3141);
// EXTERNAL MODULE: external "@supabase/supabase-js"
var supabase_js_ = __webpack_require__(2885);
;// CONCATENATED MODULE: ./pages/api/orders/route.ts


const supabase = (0,supabase_js_.createClient)("https://ofccxjxowebslrcuynrw.supabase.co", process.env.SUPABASE_SERVICE_ROLE_KEY);
async function POST(req) {
    try {
        const body = await req.json();
        const { buyerId, items, status = "pending" } = body;
        const orderInserts = items.map((item)=>({
                buyer_id: buyerId,
                seller_id: item.seller_id,
                product_name: item.name,
                price: item.price,
                status
            }));
        const { data, error } = await supabase.from("orders").insert(orderInserts);
        if (error) {
            return next_response/* default */.Z.json({
                error: error.message
            }, {
                status: 500
            });
        }
        return next_response/* default */.Z.json({
            data
        }, {
            status: 200
        });
    } catch (err) {
        return next_response/* default */.Z.json({
            error: err.message
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Forders%2Froute&preferredRegion=&absolutePagePath=private-next-pages%2Fapi%2Forders%2Froute.ts&middlewareConfigBase64=e30%3D!
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = pages_api_module.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const next_route_loaderkind_PAGES_API_page_2Fapi_2Forders_2Froute_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Forders_2Froute_ts_middlewareConfigBase64_e30_3D_ = ((0,helpers/* hoist */.l)(route_namespaceObject, "default"));
// Re-export config.
const config = (0,helpers/* hoist */.l)(route_namespaceObject, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: route_kind/* RouteKind */.x.PAGES_API,
        page: "/api/orders/route",
        pathname: "/api/orders/route",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: route_namespaceObject
});

//# sourceMappingURL=pages-api.js.map

/***/ }),

/***/ 3141:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
// This file is for modularized imports for next/server to get fully-treeshaking.

__webpack_unused_export__ = ({
    value: true
});
Object.defineProperty(exports, "Z", ({
    enumerable: true,
    get: function() {
        return _response.NextResponse;
    }
}));
const _response = __webpack_require__(1056);

//# sourceMappingURL=next-response.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [172], () => (__webpack_exec__(1915)));
module.exports = __webpack_exports__;

})();