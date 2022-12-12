"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/blog";
exports.ids = ["pages/blog"];
exports.modules = {

/***/ "./pages/blog.js":
/*!***********************!*\
  !*** ./pages/blog.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   \"getStaticProps\": () => (/* binding */ getStaticProps),\n/* harmony export */   \"loadPosts\": () => (/* binding */ loadPosts)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n\nconst POSTS_QUERY = `\n  query QueryPosts {\n    posts {\n      title\n      id\n    }\n  }\n`;\nasync function loadPosts() {\n    const res = await fetch(\"https://dev.api-blog.dalejsalter.com/\", {\n        method: \"POST\",\n        body: JSON.stringify({\n            query: POSTS_QUERY\n        }, null, 2),\n        headers: {\n            \"Content-Type\": \"application/json\"\n        }\n    });\n    const data = await res.json();\n    console.log(JSON.stringify(data, null, 2));\n    return data.data.posts;\n}\nfunction Blog({ posts  }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"ul\", {\n        children: posts.map((post)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"li\", {\n                children: post.title\n            }, post.id, false, {\n                fileName: \"/Volumes/Code/dale-repo/blog-frontend-next/pages/blog.js\",\n                lineNumber: 30,\n                columnNumber: 9\n            }, this))\n    }, void 0, false, {\n        fileName: \"/Volumes/Code/dale-repo/blog-frontend-next/pages/blog.js\",\n        lineNumber: 28,\n        columnNumber: 5\n    }, this);\n}\nasync function getStaticProps() {\n    const posts = await loadPosts();\n    return {\n        props: {\n            posts\n        }\n    };\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Blog);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9ibG9nLmpzLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFNQSxjQUFjLENBQUM7Ozs7Ozs7QUFPckIsQ0FBQztBQUVNLGVBQWVDLFlBQVk7SUFDaEMsTUFBTUMsTUFBTSxNQUFNQyxNQUFNLHlDQUF5QztRQUMvREMsUUFBUTtRQUNSQyxNQUFNQyxLQUFLQyxTQUFTLENBQUM7WUFBRUMsT0FBT1I7UUFBWSxHQUFHLElBQUksRUFBRTtRQUNuRFMsU0FBUztZQUNQLGdCQUFnQjtRQUNsQjtJQUNGO0lBRUEsTUFBTUMsT0FBTyxNQUFNUixJQUFJUyxJQUFJO0lBRTNCQyxRQUFRQyxHQUFHLENBQUNQLEtBQUtDLFNBQVMsQ0FBQ0csTUFBTSxJQUFJLEVBQUU7SUFFdkMsT0FBT0EsS0FBS0EsSUFBSSxDQUFDSSxLQUFLO0FBQ3hCLENBQUM7QUFFRCxTQUFTQyxLQUFLLEVBQUVELE1BQUssRUFBRSxFQUFFO0lBQ3ZCLHFCQUNFLDhEQUFDRTtrQkFDRUYsTUFBTUcsR0FBRyxDQUFDLENBQUNDLHFCQUNWLDhEQUFDQzswQkFBa0JELEtBQUtFLEtBQUs7ZUFBcEJGLEtBQUtHLEVBQUU7Ozs7Ozs7Ozs7QUFJeEI7QUFFTyxlQUFlQyxpQkFBaUI7SUFDckMsTUFBTVIsUUFBUSxNQUFNYjtJQUVwQixPQUFPO1FBQUVzQixPQUFPO1lBQUVUO1FBQU07SUFBRTtBQUM1QixDQUFDO0FBRUQsaUVBQWVDLElBQUlBLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvLi9wYWdlcy9ibG9nLmpzP2NiYjQiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUE9TVFNfUVVFUlkgPSBgXG4gIHF1ZXJ5IFF1ZXJ5UG9zdHMge1xuICAgIHBvc3RzIHtcbiAgICAgIHRpdGxlXG4gICAgICBpZFxuICAgIH1cbiAgfVxuYFxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFBvc3RzKCkge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9kZXYuYXBpLWJsb2cuZGFsZWpzYWx0ZXIuY29tLycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHF1ZXJ5OiBQT1NUU19RVUVSWSB9LCBudWxsLCAyKSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gIH0pXG5cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKClcblxuICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSlcblxuICByZXR1cm4gZGF0YS5kYXRhLnBvc3RzXG59XG5cbmZ1bmN0aW9uIEJsb2coeyBwb3N0cyB9KSB7XG4gIHJldHVybiAoXG4gICAgPHVsPlxuICAgICAge3Bvc3RzLm1hcCgocG9zdCkgPT4gKFxuICAgICAgICA8bGkga2V5PXtwb3N0LmlkfT57cG9zdC50aXRsZX08L2xpPlxuICAgICAgKSl9XG4gICAgPC91bD5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RhdGljUHJvcHMoKSB7XG4gIGNvbnN0IHBvc3RzID0gYXdhaXQgbG9hZFBvc3RzKClcblxuICByZXR1cm4geyBwcm9wczogeyBwb3N0cyB9IH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmxvZ1xuIl0sIm5hbWVzIjpbIlBPU1RTX1FVRVJZIiwibG9hZFBvc3RzIiwicmVzIiwiZmV0Y2giLCJtZXRob2QiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsInF1ZXJ5IiwiaGVhZGVycyIsImRhdGEiLCJqc29uIiwiY29uc29sZSIsImxvZyIsInBvc3RzIiwiQmxvZyIsInVsIiwibWFwIiwicG9zdCIsImxpIiwidGl0bGUiLCJpZCIsImdldFN0YXRpY1Byb3BzIiwicHJvcHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/blog.js\n");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/blog.js"));
module.exports = __webpack_exports__;

})();