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
exports.id = "pages/post/[id]";
exports.ids = ["pages/post/[id]"];
exports.modules = {

/***/ "./pages/post/[id].js":
/*!****************************!*\
  !*** ./pages/post/[id].js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Post),\n/* harmony export */   \"getStaticPaths\": () => (/* binding */ getStaticPaths),\n/* harmony export */   \"getStaticProps\": () => (/* binding */ getStaticProps)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n\nconst POSTS_QUERY = `\n  query QueryPosts {\n    posts {\n      title\n      id\n    }\n  }\n`;\nconst POST_QUERY = `\n  query QueryPost($id: ID!) {\n    post(id: $id) {\n      title\n      id\n    }\n  }\n`;\nasync function getStaticPaths() {\n    const res = await fetch(\"https://dev.api-blog.dalejsalter.com/\", {\n        method: \"POST\",\n        body: JSON.stringify({\n            query: POSTS_QUERY\n        }, null, 2),\n        headers: {\n            \"Content-Type\": \"application/json\"\n        }\n    });\n    const data = await res.json();\n    const paths = data.data.posts.map((post)=>({\n            params: {\n                id: post.id\n            }\n        }));\n    // { fallback: false } means other routes should 404\n    return {\n        paths,\n        fallback: false\n    };\n}\nasync function getStaticProps(context) {\n    console.log(\"context\", context);\n    const res = await fetch(\"https://dev.api-blog.dalejsalter.com/\", {\n        method: \"POST\",\n        body: JSON.stringify({\n            query: POST_QUERY,\n            variables: {\n                id: context.params.id\n            }\n        }, null, 2),\n        headers: {\n            \"Content-Type\": \"application/json\"\n        }\n    });\n    const data = await res.json();\n    return {\n        props: {\n            post: data.data.post\n        }\n    };\n}\nfunction Post({ post  }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n        style: {\n            color: \"white\"\n        },\n        children: post.title || \"undefined\"\n    }, void 0, false, {\n        fileName: \"/Volumes/Code/dale-repo/blog-frontend-next/pages/post/[id].js\",\n        lineNumber: 57,\n        columnNumber: 10\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9wb3N0L1tpZF0uanMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUFBLE1BQU1BLGNBQWMsQ0FBQzs7Ozs7OztBQU9yQixDQUFDO0FBRUQsTUFBTUMsYUFBYSxDQUFDOzs7Ozs7O0FBT3BCLENBQUM7QUFFTSxlQUFlQyxpQkFBaUI7SUFDckMsTUFBTUMsTUFBTSxNQUFNQyxNQUFNLHlDQUF5QztRQUMvREMsUUFBUTtRQUNSQyxNQUFNQyxLQUFLQyxTQUFTLENBQUM7WUFBRUMsT0FBT1Q7UUFBWSxHQUFHLElBQUksRUFBRTtRQUNuRFUsU0FBUztZQUNQLGdCQUFnQjtRQUNsQjtJQUNGO0lBRUEsTUFBTUMsT0FBTyxNQUFNUixJQUFJUyxJQUFJO0lBRTNCLE1BQU1DLFFBQVFGLEtBQUtBLElBQUksQ0FBQ0csS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQ0MsT0FBVTtZQUMzQ0MsUUFBUTtnQkFBRUMsSUFBSUYsS0FBS0UsRUFBRTtZQUFDO1FBQ3hCO0lBRUEsb0RBQW9EO0lBQ3BELE9BQU87UUFBRUw7UUFBT00sVUFBVSxLQUFLO0lBQUM7QUFDbEMsQ0FBQztBQUVNLGVBQWVDLGVBQWVDLE9BQU8sRUFBRTtJQUM1Q0MsUUFBUUMsR0FBRyxDQUFDLFdBQVdGO0lBRXZCLE1BQU1sQixNQUFNLE1BQU1DLE1BQU0seUNBQXlDO1FBQy9EQyxRQUFRO1FBQ1JDLE1BQU1DLEtBQUtDLFNBQVMsQ0FBQztZQUFFQyxPQUFPUjtZQUFZdUIsV0FBVztnQkFBRU4sSUFBSUcsUUFBUUosTUFBTSxDQUFDQyxFQUFFO1lBQUM7UUFBRSxHQUFHLElBQUksRUFBRTtRQUN4RlIsU0FBUztZQUNQLGdCQUFnQjtRQUNsQjtJQUNGO0lBRUEsTUFBTUMsT0FBTyxNQUFNUixJQUFJUyxJQUFJO0lBRTNCLE9BQU87UUFDTGEsT0FBTztZQUFFVCxNQUFNTCxLQUFLQSxJQUFJLENBQUNLLElBQUk7UUFBQztJQUNoQztBQUNGLENBQUM7QUFFYyxTQUFTVSxLQUFLLEVBQUVWLEtBQUksRUFBRSxFQUFFO0lBQ3JDLHFCQUFPLDhEQUFDVztRQUFHQyxPQUFPO1lBQUVDLE9BQU87UUFBUTtrQkFBSWIsS0FBS2MsS0FBSyxJQUFJOzs7Ozs7QUFDdkQsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy8uL3BhZ2VzL3Bvc3QvW2lkXS5qcz80OTRhIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBPU1RTX1FVRVJZID0gYFxuICBxdWVyeSBRdWVyeVBvc3RzIHtcbiAgICBwb3N0cyB7XG4gICAgICB0aXRsZVxuICAgICAgaWRcbiAgICB9XG4gIH1cbmBcblxuY29uc3QgUE9TVF9RVUVSWSA9IGBcbiAgcXVlcnkgUXVlcnlQb3N0KCRpZDogSUQhKSB7XG4gICAgcG9zdChpZDogJGlkKSB7XG4gICAgICB0aXRsZVxuICAgICAgaWRcbiAgICB9XG4gIH1cbmBcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0YXRpY1BhdGhzKCkge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9kZXYuYXBpLWJsb2cuZGFsZWpzYWx0ZXIuY29tLycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHF1ZXJ5OiBQT1NUU19RVUVSWSB9LCBudWxsLCAyKSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gIH0pXG5cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKClcblxuICBjb25zdCBwYXRocyA9IGRhdGEuZGF0YS5wb3N0cy5tYXAoKHBvc3QpID0+ICh7XG4gICAgcGFyYW1zOiB7IGlkOiBwb3N0LmlkIH0sXG4gIH0pKVxuXG4gIC8vIHsgZmFsbGJhY2s6IGZhbHNlIH0gbWVhbnMgb3RoZXIgcm91dGVzIHNob3VsZCA0MDRcbiAgcmV0dXJuIHsgcGF0aHMsIGZhbGxiYWNrOiBmYWxzZSB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdGF0aWNQcm9wcyhjb250ZXh0KSB7XG4gIGNvbnNvbGUubG9nKCdjb250ZXh0JywgY29udGV4dClcblxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9kZXYuYXBpLWJsb2cuZGFsZWpzYWx0ZXIuY29tLycsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHF1ZXJ5OiBQT1NUX1FVRVJZLCB2YXJpYWJsZXM6IHsgaWQ6IGNvbnRleHQucGFyYW1zLmlkIH0gfSwgbnVsbCwgMiksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICB9KVxuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpXG5cbiAgcmV0dXJuIHtcbiAgICBwcm9wczogeyBwb3N0OiBkYXRhLmRhdGEucG9zdCB9LFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBvc3QoeyBwb3N0IH0pIHtcbiAgcmV0dXJuIDxoMSBzdHlsZT17eyBjb2xvcjogJ3doaXRlJyB9fT57cG9zdC50aXRsZSB8fCAndW5kZWZpbmVkJ308L2gxPlxufVxuIl0sIm5hbWVzIjpbIlBPU1RTX1FVRVJZIiwiUE9TVF9RVUVSWSIsImdldFN0YXRpY1BhdGhzIiwicmVzIiwiZmV0Y2giLCJtZXRob2QiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsInF1ZXJ5IiwiaGVhZGVycyIsImRhdGEiLCJqc29uIiwicGF0aHMiLCJwb3N0cyIsIm1hcCIsInBvc3QiLCJwYXJhbXMiLCJpZCIsImZhbGxiYWNrIiwiZ2V0U3RhdGljUHJvcHMiLCJjb250ZXh0IiwiY29uc29sZSIsImxvZyIsInZhcmlhYmxlcyIsInByb3BzIiwiUG9zdCIsImgxIiwic3R5bGUiLCJjb2xvciIsInRpdGxlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/post/[id].js\n");

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
var __webpack_require__ = require("../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/post/[id].js"));
module.exports = __webpack_exports__;

})();