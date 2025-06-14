"use strict";
exports.id = 368;
exports.ids = [368];
exports.modules = {

/***/ 1368:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _context_CartContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5592);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);




const CartDrawer = ()=>{
    const { cartItems, removeFromCart, updateQuantity, clearCart, decreaseQuantity, isCartOpen, toggleCart } = (0,_context_CartContext__WEBPACK_IMPORTED_MODULE_2__/* .useCart */ .j)();
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();
    if (!isCartOpen) return null;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "flex justify-between items-center p-4 border-b",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                        className: "text-lg font-bold",
                        children: "Your Cart"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                        onClick: toggleCart,
                        className: "text-red-500 hover:text-red-700",
                        children: "Close"
                    })
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "p-4 overflow-y-auto max-h-[calc(100vh-100px)]",
                children: cartItems.length === 0 ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                    children: "Your cart is empty."
                }) : /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    children: [
                        cartItems.map((item, index)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "mb-4 border-b pb-4",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                        className: "font-semibold text-gray-800",
                                        children: item.name
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Price: $",
                                            item.price.toFixed(2)
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "flex items-center mt-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                onClick: ()=>decreaseQuantity(item.name),
                                                className: "px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200",
                                                children: "-"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                                className: "px-4",
                                                children: item.quantity
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                onClick: ()=>updateQuantity(item.name, item.quantity + 1),
                                                className: "px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200",
                                                children: "+"
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                onClick: ()=>removeFromCart(item.name),
                                                className: "ml-auto text-red-500 text-sm hover:underline",
                                                children: "Remove"
                                            })
                                        ]
                                    })
                                ]
                            }, index)),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                            className: "mt-6 w-full bg-black text-white py-2 rounded hover:bg-gray-800",
                            onClick: async ()=>{
                                try {
                                    const res = await fetch("/api/checkout-session", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            items: cartItems
                                        })
                                    });
                                    const data = await res.json();
                                    if (data.url) {
                                        router.push(data.url);
                                    } else {
                                        console.error("Checkout session failed:", data);
                                    }
                                } catch (error) {
                                    console.error("Error creating checkout session:", error);
                                }
                            },
                            children: "Checkout"
                        }),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                            className: "mt-3 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700",
                            onClick: clearCart,
                            children: "Clear Cart"
                        })
                    ]
                })
            })
        ]
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CartDrawer);


/***/ })

};
;