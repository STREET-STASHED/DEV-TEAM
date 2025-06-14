"use strict";
(() => {
var exports = {};
exports.id = 811;
exports.ids = [811];
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

/***/ 5973:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  config: () => (/* binding */ config),
  "default": () => (/* binding */ next_route_loaderkind_PAGES_API_page_2Fapi_2Forders_2Fupdate_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Forders_2Fupdate_ts_middlewareConfigBase64_e30_3D_),
  routeModule: () => (/* binding */ routeModule)
});

// NAMESPACE OBJECT: ./pages/api/orders/update.ts
var update_namespaceObject = {};
__webpack_require__.r(update_namespaceObject);
__webpack_require__.d(update_namespaceObject, {
  "default": () => (handler)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/pages-api/module.js
var pages_api_module = __webpack_require__(6429);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(7153);
// EXTERNAL MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/helpers.js
var helpers = __webpack_require__(7305);
// EXTERNAL MODULE: external "@supabase/supabase-js"
var supabase_js_ = __webpack_require__(2885);
;// CONCATENATED MODULE: ./pages/api/orders/update.ts

const supabase = (0,supabase_js_.createClient)("https://ofccxjxowebslrcuynrw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY2N4anhvd2Vic2xyY3V5bnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzIwMDUsImV4cCI6MjA2NTI0ODAwNX0.k8zmGXQC6hXrkXLgEJYVlnFd7WKPWaZpcbGCgL9qsys");
async function handler(req, res) {
    if (req.method !== "PATCH") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const { orderId, status } = req.body;
    if (!orderId || !status) {
        return res.status(400).json({
            error: "Missing orderId or status"
        });
    }
    const { data, error } = await supabase.from("orders").update({
        status
    }).eq("id", orderId);
    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }
    return res.status(200).json({
        message: "Order status updated",
        data
    });
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Forders%2Fupdate&preferredRegion=&absolutePagePath=private-next-pages%2Fapi%2Forders%2Fupdate.ts&middlewareConfigBase64=e30%3D!
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = pages_api_module.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const next_route_loaderkind_PAGES_API_page_2Fapi_2Forders_2Fupdate_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Forders_2Fupdate_ts_middlewareConfigBase64_e30_3D_ = ((0,helpers/* hoist */.l)(update_namespaceObject, "default"));
// Re-export config.
const config = (0,helpers/* hoist */.l)(update_namespaceObject, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: route_kind/* RouteKind */.x.PAGES_API,
        page: "/api/orders/update",
        pathname: "/api/orders/update",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: update_namespaceObject
});

//# sourceMappingURL=pages-api.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [172], () => (__webpack_exec__(5973)));
module.exports = __webpack_exports__;

})();