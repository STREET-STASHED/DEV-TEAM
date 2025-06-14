"use strict";
exports.id = 534;
exports.ids = [534];
exports.modules = {

/***/ 7534:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _context_CartContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5592);



const ProductCard = ({ product })=>{
    const { addToCart } = (0,_context_CartContext__WEBPACK_IMPORTED_MODULE_2__/* .useCart */ .j)();
    const handleAddToCart = ()=>{
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        };
        addToCart(newItem);
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "product-card border p-4 rounded shadow",
        children: [
            product.image && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                src: product.image,
                alt: product.name,
                className: "w-full h-48 object-cover mb-4 rounded"
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                className: "text-lg font-semibold",
                children: product.name
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", {
                className: "text-gray-700 mb-2",
                children: [
                    "$",
                    product.price.toFixed(2)
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                onClick: handleAddToCart,
                className: "bg-black text-white px-4 py-2 rounded",
                children: "Add to Cart"
            })
        ]
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductCard);


/***/ })

};
;