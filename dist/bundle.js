/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./client/style.css":
/*!****************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./client/style.css ***!
  \****************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/noSourceMaps.js */ \"./node_modules/css-loader/dist/runtime/noSourceMaps.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, `html,\r\nbody {\r\n    margin: 0;\r\n    padding: 0;\r\n    width: 100%;\r\n    height: 100%;\r\n    overflow: hidden;\r\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\r\n    background: #727272;\r\n    color: #ffffff;\r\n}\r\n\r\n/* HTML dialog styles */\r\n.dialog {\r\n    display: none;\r\n    position: fixed;\r\n    left: 0;\r\n    right: 0;\r\n    top: 0;\r\n    bottom: 0;\r\n    width: fit-content;\r\n    height: fit-content;\r\n    max-height: calc(100% - 4em);\r\n    max-width: calc(100% - 2em);\r\n    padding: 0.5em 1em;\r\n    margin: 2em auto;\r\n    border: none;\r\n    overflow: auto;\r\n    box-shadow: 0 0 0.6em rgba(0, 0, 0, 0.775);\r\n    user-select: text;\r\n    background-color: #ffffff;\r\n    color: #000000;\r\n}\r\n\r\n.dialog.show {\r\n    display: block;\r\n}\r\n\r\n.dialog-backdrop {\r\n    display: none;\r\n    position: fixed;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n    background: rgba(0, 0, 0, 0.4);\r\n}\r\n\r\n.dialog-backdrop.show,\r\n.dialog-backdrop.show .dialog {\r\n    display: block;\r\n}`, \"\"]);\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://nodejs-game-server/./client/style.css?./node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\nmodule.exports = function (cssWithMappingToString) {\n  var list = [];\n\n  // return the list of modules as css string\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = \"\";\n      var needLayer = typeof item[5] !== \"undefined\";\n      if (item[4]) {\n        content += \"@supports (\".concat(item[4], \") {\");\n      }\n      if (item[2]) {\n        content += \"@media \".concat(item[2], \" {\");\n      }\n      if (needLayer) {\n        content += \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\");\n      }\n      content += cssWithMappingToString(item);\n      if (needLayer) {\n        content += \"}\";\n      }\n      if (item[2]) {\n        content += \"}\";\n      }\n      if (item[4]) {\n        content += \"}\";\n      }\n      return content;\n    }).join(\"\");\n  };\n\n  // import a list of modules into the list\n  list.i = function i(modules, media, dedupe, supports, layer) {\n    if (typeof modules === \"string\") {\n      modules = [[null, modules, undefined]];\n    }\n    var alreadyImportedModules = {};\n    if (dedupe) {\n      for (var k = 0; k < this.length; k++) {\n        var id = this[k][0];\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n    for (var _k = 0; _k < modules.length; _k++) {\n      var item = [].concat(modules[_k]);\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        continue;\n      }\n      if (typeof layer !== \"undefined\") {\n        if (typeof item[5] === \"undefined\") {\n          item[5] = layer;\n        } else {\n          item[1] = \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\").concat(item[1], \"}\");\n          item[5] = layer;\n        }\n      }\n      if (media) {\n        if (!item[2]) {\n          item[2] = media;\n        } else {\n          item[1] = \"@media \".concat(item[2], \" {\").concat(item[1], \"}\");\n          item[2] = media;\n        }\n      }\n      if (supports) {\n        if (!item[4]) {\n          item[4] = \"\".concat(supports);\n        } else {\n          item[1] = \"@supports (\".concat(item[4], \") {\").concat(item[1], \"}\");\n          item[4] = supports;\n        }\n      }\n      list.push(item);\n    }\n  };\n  return list;\n};\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \**************************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = function (i) {\n  return i[1];\n};\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/css-loader/dist/runtime/noSourceMaps.js?");

/***/ }),

/***/ "./client/style.css":
/*!**************************!*\
  !*** ./client/style.css ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ \"./node_modules/style-loader/dist/runtime/styleDomAPI.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ \"./node_modules/style-loader/dist/runtime/insertBySelector.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ \"./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ \"./node_modules/style-loader/dist/runtime/insertStyleElement.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ \"./node_modules/style-loader/dist/runtime/styleTagTransform.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ \"./node_modules/css-loader/dist/cjs.js!./client/style.css\");\n\n      \n      \n      \n      \n      \n      \n      \n      \n      \n\nvar options = {};\n\noptions.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());\noptions.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());\noptions.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, \"head\");\noptions.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());\noptions.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"], options);\n\n\n\n\n       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"].locals : undefined);\n\n\n//# sourceURL=webpack://nodejs-game-server/./client/style.css?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

eval("\n\nvar stylesInDOM = [];\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n  for (var i = 0; i < stylesInDOM.length; i++) {\n    if (stylesInDOM[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n  return result;\n}\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var indexByIdentifier = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3],\n      supports: item[4],\n      layer: item[5]\n    };\n    if (indexByIdentifier !== -1) {\n      stylesInDOM[indexByIdentifier].references++;\n      stylesInDOM[indexByIdentifier].updater(obj);\n    } else {\n      var updater = addElementStyle(obj, options);\n      options.byIndex = i;\n      stylesInDOM.splice(i, 0, {\n        identifier: identifier,\n        updater: updater,\n        references: 1\n      });\n    }\n    identifiers.push(identifier);\n  }\n  return identifiers;\n}\nfunction addElementStyle(obj, options) {\n  var api = options.domAPI(options);\n  api.update(obj);\n  var updater = function updater(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {\n        return;\n      }\n      api.update(obj = newObj);\n    } else {\n      api.remove();\n    }\n  };\n  return updater;\n}\nmodule.exports = function (list, options) {\n  options = options || {};\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDOM[index].references--;\n    }\n    var newLastIdentifiers = modulesToDom(newList, options);\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n      var _index = getIndexByIdentifier(_identifier);\n      if (stylesInDOM[_index].references === 0) {\n        stylesInDOM[_index].updater();\n        stylesInDOM.splice(_index, 1);\n      }\n    }\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

eval("\n\nvar memo = {};\n\n/* istanbul ignore next  */\nfunction getTarget(target) {\n  if (typeof memo[target] === \"undefined\") {\n    var styleTarget = document.querySelector(target);\n\n    // Special case to return head of iframe instead of iframe itself\n    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n      try {\n        // This will throw an exception if access to iframe is blocked\n        // due to cross-origin restrictions\n        styleTarget = styleTarget.contentDocument.head;\n      } catch (e) {\n        // istanbul ignore next\n        styleTarget = null;\n      }\n    }\n    memo[target] = styleTarget;\n  }\n  return memo[target];\n}\n\n/* istanbul ignore next  */\nfunction insertBySelector(insert, style) {\n  var target = getTarget(insert);\n  if (!target) {\n    throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n  }\n  target.appendChild(style);\n}\nmodule.exports = insertBySelector;\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/style-loader/dist/runtime/insertBySelector.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction insertStyleElement(options) {\n  var element = document.createElement(\"style\");\n  options.setAttributes(element, options.attributes);\n  options.insert(element, options.options);\n  return element;\n}\nmodule.exports = insertStyleElement;\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/style-loader/dist/runtime/insertStyleElement.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\n/* istanbul ignore next  */\nfunction setAttributesWithoutAttributes(styleElement) {\n  var nonce =  true ? __webpack_require__.nc : 0;\n  if (nonce) {\n    styleElement.setAttribute(\"nonce\", nonce);\n  }\n}\nmodule.exports = setAttributesWithoutAttributes;\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction apply(styleElement, options, obj) {\n  var css = \"\";\n  if (obj.supports) {\n    css += \"@supports (\".concat(obj.supports, \") {\");\n  }\n  if (obj.media) {\n    css += \"@media \".concat(obj.media, \" {\");\n  }\n  var needLayer = typeof obj.layer !== \"undefined\";\n  if (needLayer) {\n    css += \"@layer\".concat(obj.layer.length > 0 ? \" \".concat(obj.layer) : \"\", \" {\");\n  }\n  css += obj.css;\n  if (needLayer) {\n    css += \"}\";\n  }\n  if (obj.media) {\n    css += \"}\";\n  }\n  if (obj.supports) {\n    css += \"}\";\n  }\n  var sourceMap = obj.sourceMap;\n  if (sourceMap && typeof btoa !== \"undefined\") {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  }\n\n  // For old IE\n  /* istanbul ignore if  */\n  options.styleTagTransform(css, styleElement, options.options);\n}\nfunction removeStyleElement(styleElement) {\n  // istanbul ignore if\n  if (styleElement.parentNode === null) {\n    return false;\n  }\n  styleElement.parentNode.removeChild(styleElement);\n}\n\n/* istanbul ignore next  */\nfunction domAPI(options) {\n  if (typeof document === \"undefined\") {\n    return {\n      update: function update() {},\n      remove: function remove() {}\n    };\n  }\n  var styleElement = options.insertStyleElement(options);\n  return {\n    update: function update(obj) {\n      apply(styleElement, options, obj);\n    },\n    remove: function remove() {\n      removeStyleElement(styleElement);\n    }\n  };\n}\nmodule.exports = domAPI;\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/style-loader/dist/runtime/styleDomAPI.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction styleTagTransform(css, styleElement) {\n  if (styleElement.styleSheet) {\n    styleElement.styleSheet.cssText = css;\n  } else {\n    while (styleElement.firstChild) {\n      styleElement.removeChild(styleElement.firstChild);\n    }\n    styleElement.appendChild(document.createTextNode(css));\n  }\n}\nmodule.exports = styleTagTransform;\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/style-loader/dist/runtime/styleTagTransform.js?");

/***/ }),

/***/ "./client/index.js":
/*!*************************!*\
  !*** ./client/index.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ \"./client/style.css\");\n/* harmony import */ var vanjs_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vanjs-core */ \"./node_modules/vanjs-core/src/van.js\");\n// client-side application entry\r\n\r\n\r\nconst {\r\n    div,\r\n    form,\r\n    input,\r\n    label,\r\n    legend,\r\n    canvas,\r\n    fieldset,\r\n} = vanjs_core__WEBPACK_IMPORTED_MODULE_1__[\"default\"].tags;\r\n\r\nconst WS_ADDRESS = \"ws://127.0.0.1:3000/world\"\r\nconst MOVEMENT_KEYS = \"KeyA,KeyD,KeyW,KeyS,ArrowLeft,ArrowRight,ArrowUp,ArrowDown\".split(\",\")\r\n\r\nconst isLoggedIn = vanjs_core__WEBPACK_IMPORTED_MODULE_1__[\"default\"].state(false)\r\n\r\n/** @type {import(\"vanjs-core\").State<import(\"../src/data/Packets.js\").TickPacket>} */\r\nlet world = vanjs_core__WEBPACK_IMPORTED_MODULE_1__[\"default\"].state(null)\r\n\r\n// /** @type {import(\"vanjs-core\").State<any>} */\r\n// let player = van.state(null)\r\n\r\n/** @type {WebSocket} */\r\nlet socket = null\r\n\r\n/** @type {HTMLCanvasElement} */\r\nconst canvasElement = canvas({\r\n    id: 'gameCanvas',\r\n    width: 600,\r\n    height: 400,\r\n})\r\n\r\n/** @type {CanvasRenderingContext2D} */\r\nconst ctx = canvasElement.getContext(\"2d\")\r\n\r\nconst loginDialogVisibility = vanjs_core__WEBPACK_IMPORTED_MODULE_1__[\"default\"].derive(() => isLoggedIn.val ? 'dialog-backdrop' : 'dialog-backdrop show')\r\n\r\n// Login dialog\r\nconst loginDialogElement = div({\r\n    id: 'login-dialog',\r\n    class: loginDialogVisibility,\r\n},\r\n    div({\r\n        class: 'dialog',\r\n    },\r\n        form({\r\n            id: 'base-form',\r\n            autocomplete: 'off',\r\n            onsubmit: (event) => {\r\n                event.preventDefault();\r\n                // @ts-ignore\r\n                const username = document.getElementById(\"username\").value;\r\n                // @ts-ignore\r\n                const password = document.getElementById(\"password\").value;\r\n                // reset the form\r\n                (event.target || document.forms['base-form']).reset();\r\n                // do the login and start the game\r\n                login(username, password);\r\n            },\r\n        },\r\n            fieldset(\r\n                legend('Login'),\r\n                label('Username:'),\r\n                input({\r\n                    type: 'text',\r\n                    name: 'username',\r\n                    id: 'username',\r\n                }),\r\n                label('Password:'),\r\n                input({\r\n                    type: 'password',\r\n                    name: 'password',\r\n                    id: 'password',\r\n                }),\r\n                input({\r\n                    type: 'submit',\r\n                    value: 'Submit',\r\n                }),\r\n            )\r\n        )\r\n    )\r\n)\r\n\r\n// App container\r\nconst App = () => {\r\n    return div(\r\n        canvasElement,\r\n        loginDialogElement\r\n    )\r\n}\r\n\r\n// add the app to the DOM\r\nvanjs_core__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(document.body, App())\r\n\r\n/**\r\n * Logs into the game server with the given username and password.\r\n * If there is no username or password given, an empty string is used.\r\n * If the game is already running, it throws an error.\r\n * @param {string} [username=\"\"] - The username to log in with.\r\n * @param {string} [password=\"\"] - The password to log in with.\r\n * @throws {Error} If the game is already running or if the login fails.\r\n */\r\nasync function login(username = \"\", password = \"\") {\r\n    if (isLoggedIn.val) {\r\n        throw new Error(\"Already logged in.\");\r\n    }\r\n    // sent the POST /login request,\r\n    // then await for token as response {token:string,expires:number}\r\n    // and then start the game\r\n    const response = await fetch(\"/login\", {\r\n        method: \"POST\",\r\n        headers: {\r\n            \"Content-Type\": \"application/json\"\r\n        },\r\n        body: JSON.stringify({ username, password })\r\n    });\r\n    const data = await response.json();\r\n\r\n    if (!data.token) {\r\n        throw new Error(\"Login failed.\");\r\n    }\r\n\r\n    startGame(data.token);\r\n}\r\n\r\n/**\r\n * Starts the game by establishing a WebSocket connection using the provided token.\r\n * Paints the canvas black, sets up event listeners for socket events such as open,\r\n * close, and message, and manages the game state and player interactions.\r\n * \r\n * @param {string} token - The authentication token used to establish the WebSocket connection.\r\n * @throws {Error} If the game is already running.\r\n */\r\nfunction startGame(token) {\r\n    // paint the canvas with black\r\n    fillRect(0, 0, canvasElement.width, canvasElement.height);\r\n\r\n    if (isLoggedIn.val) {\r\n        throw new Error(\"Already logged in.\");\r\n    }\r\n\r\n    socket = new WebSocket(WS_ADDRESS, [\"ws\", \"wss\", `Bearer.${token}`]);\r\n\r\n    socket.addEventListener(\"open\", (event) => {\r\n        // our authentication is already done\r\n        isLoggedIn.val = true;\r\n        window.addEventListener(\"keydown\", windowKeydown);\r\n        console.log('Connection opened.');\r\n    });\r\n\r\n    socket.addEventListener(\"close\", (event) => {\r\n        console.log(\"Connection closed.\");\r\n        isLoggedIn.val = false;\r\n        world.val = null;\r\n        // player.val = null;\r\n        window.removeEventListener(\"keydown\", windowKeydown);\r\n        // paint the canvas with black\r\n        fillRect(0, 0, canvasElement.width, canvasElement.height);\r\n    })\r\n\r\n    socket.addEventListener(\"message\", (event) => {\r\n        try {\r\n            const data = JSON.parse(event.data);\r\n            if (data.type === \"join\") {\r\n                onPlayerJoin(data);\r\n            } else if (data.type === \"tick\") {\r\n                onWorldTick(data);\r\n            }\r\n        } catch (error) {\r\n            console.error(\"Websocket message error:\", error);\r\n        }\r\n    });\r\n}\r\n\r\n/**\r\n * Called when a \"join\" message is received from the server.\r\n * Updates the player state (name, map, direction, x, y) and world state.\r\n * Then calls `drawUpdate` to update the game canvas.\r\n * @param {import(\"../src/data/Packets.js\").TickPacket} data - The message data from the server.\r\n */\r\nfunction onPlayerJoin(data) {\r\n    console.log(\"Message from server:\", data);\r\n    // update player state\r\n    // const { name, map } = data;\r\n    // player.val = { name, map };\r\n    // update world state\r\n    world.val = data;\r\n    // draw the game\r\n    drawUpdate(data);\r\n}\r\n\r\n/**\r\n * Called when a \"tick\" message is received from the server.\r\n * Updates the player state (name, map, direction, x, y) and world state.\r\n * Then calls `drawUpdate` to update the game canvas.\r\n * @param {import(\"../src/data/Packets.js\").TickPacket} data - The message data from the server.\r\n */\r\nfunction onWorldTick(data) {\r\n    // update player state\r\n    // const { name, map } = data;\r\n    // player.val = { name, map };\r\n    // update world state\r\n    world.val = data;\r\n    // draw the game\r\n    drawUpdate(data);\r\n}\r\n\r\n/**\r\n * Called when the window receives a keydown event.\r\n * If the key is a movement key, sends a \"move\" message to the server with the key code.\r\n * @param {KeyboardEvent} event - The keydown event.\r\n * @private\r\n */\r\nfunction windowKeydown(event) {\r\n    // console.log(event.type, event.code, event.key)\r\n    if (MOVEMENT_KEYS.includes(event.code)) {\r\n        socket.send(JSON.stringify({ type: \"move\", code: event.code }));\r\n    }\r\n}\r\n\r\n/**\r\n * Called by the game loop to update the game canvas.\r\n * Updates the canvas size if the width or height have changed.\r\n * Paints the canvas with green.\r\n * Draws all entities in the game world.\r\n * @param {import(\"../src/data/Packets.js\").TickPacket} data - The message data from the server.\r\n */\r\nfunction drawUpdate(data) {\r\n    // update size\r\n    if (data.width) canvasElement.width = data.width;\r\n    if (data.height) canvasElement.height = data.height;\r\n\r\n    // paint the canvas with green\r\n    ctx.fillStyle = \"green\";\r\n    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);\r\n\r\n    // draw the NPCs\r\n    data.entities.forEach((entity) => {\r\n        if (entity.type === 0) { // NPC\r\n            drawRect(\"brown\", entity.x, entity.y, 8, 8);\r\n            // display the entity name as text in the canvas\r\n            ctx.fillStyle = \"white\";\r\n            ctx.font = \"10px Arial\";\r\n            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2)), (entity.y - 2));\r\n        }\r\n        else if (entity.type === 1) { // PLAYER\r\n            drawCircle(\"black\", entity.x, entity.y, 8);\r\n            // display the username as text in the canvas\r\n            ctx.fillStyle = \"white\";\r\n            ctx.font = \"10px Arial\";\r\n            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2.5)), (entity.y - 8));\r\n        }\r\n        else if (entity.type === 2) { // MONSTER\r\n            drawCircle(\"red\", entity.x, entity.y, 8);\r\n            // display the username as text in the canvas\r\n            ctx.fillStyle = \"red\";\r\n            ctx.font = \"10px Arial\";\r\n            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2.5)), (entity.y - 8));\r\n        }\r\n    });\r\n}\r\n\r\n/**\r\n * Fills a rectangle on the canvas with a specified width and height,\r\n * starting from the given x and y coordinates.\r\n * The rectangle is filled with the current fill style color.\r\n *\r\n * @param {number} x - The x-coordinate of the top-left corner of the rectangle.\r\n * @param {number} y - The y-coordinate of the top-left corner of the rectangle.\r\n * @param {number} width - The width of the rectangle.\r\n * @param {number} height - The height of the rectangle.\r\n */\r\nfunction fillRect(x, y, width, height) {\r\n    ctx.fillStyle = \"black\";\r\n    ctx.fillRect(x, y, width, height);\r\n}\r\n\r\n/**\r\n * Draws a rectangle on the canvas with the given dimensions and\r\n * position. The rectangle is filled with the current fill style color,\r\n * or red if no fill color is provided.\r\n *\r\n * @param {string} fill - The fill color of the rectangle.\r\n * @param {number} x - The x-coordinate of the top-left corner of the rectangle.\r\n * @param {number} y - The y-coordinate of the top-left corner of the rectangle.\r\n * @param {number} width - The width of the rectangle.\r\n * @param {number} height - The height of the rectangle.\r\n */\r\nfunction drawRect(fill, x, y, width, height) {\r\n    ctx.beginPath();\r\n    ctx.rect(x, y, width, height);\r\n    ctx.fillStyle = fill || \"red\";\r\n    ctx.fill();\r\n}\r\n\r\n/**\r\n * Draws a circle on the canvas with the given radius and position.\r\n * The circle is filled with the current fill style color,\r\n * or red if no fill color is provided.\r\n *\r\n * @param {string} fill - The fill color of the circle.\r\n * @param {number} x - The x-coordinate of the center of the circle.\r\n * @param {number} y - The y-coordinate of the center of the circle.\r\n * @param {number} radius - The radius of the circle.\r\n */\r\nfunction drawCircle(fill, x, y, radius) {\r\n    ctx.beginPath();\r\n    ctx.arc(x, y, radius, 0, 2 * Math.PI);\r\n    ctx.fillStyle = fill || \"red\";\r\n    ctx.fill();\r\n}\n\n//# sourceURL=webpack://nodejs-game-server/./client/index.js?");

/***/ }),

/***/ "./node_modules/vanjs-core/src/van.js":
/*!********************************************!*\
  !*** ./node_modules/vanjs-core/src/van.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.\n\n// Global variables - aliasing some builtin symbols to reduce the bundle size.\nlet protoOf = Object.getPrototypeOf\nlet changedStates, derivedStates, curDeps, curNewDerives, alwaysConnectedDom = {isConnected: 1}\nlet gcCycleInMs = 1000, statesToGc, propSetterCache = {}\nlet objProto = protoOf(alwaysConnectedDom), funcProto = protoOf(protoOf), _undefined\n\nlet addAndScheduleOnFirst = (set, s, f, waitMs) =>\n  (set ?? (setTimeout(f, waitMs), new Set)).add(s)\n\nlet runAndCaptureDeps = (f, deps, arg) => {\n  let prevDeps = curDeps\n  curDeps = deps\n  try {\n    return f(arg)\n  } catch (e) {\n    console.error(e)\n    return arg\n  } finally {\n    curDeps = prevDeps\n  }\n}\n\nlet keepConnected = l => l.filter(b => b._dom?.isConnected)\n\nlet addStatesToGc = d => statesToGc = addAndScheduleOnFirst(statesToGc, d, () => {\n  for (let s of statesToGc)\n    s._bindings = keepConnected(s._bindings),\n    s._listeners = keepConnected(s._listeners)\n  statesToGc = _undefined\n}, gcCycleInMs)\n\nlet stateProto = {\n  get val() {\n    curDeps?._getters?.add(this)\n    return this.rawVal\n  },\n\n  get oldVal() {\n    curDeps?._getters?.add(this)\n    return this._oldVal\n  },\n\n  set val(v) {\n    curDeps?._setters?.add(this)\n    if (v !== this.rawVal) {\n      this.rawVal = v\n      this._bindings.length + this._listeners.length ?\n        (derivedStates?.add(this), changedStates = addAndScheduleOnFirst(changedStates, this, updateDoms)) :\n        this._oldVal = v\n    }\n  },\n}\n\nlet state = initVal => ({\n  __proto__: stateProto,\n  rawVal: initVal,\n  _oldVal: initVal,\n  _bindings: [],\n  _listeners: [],\n})\n\nlet bind = (f, dom) => {\n  let deps = {_getters: new Set, _setters: new Set}, binding = {f}, prevNewDerives = curNewDerives\n  curNewDerives = []\n  let newDom = runAndCaptureDeps(f, deps, dom)\n  newDom = (newDom ?? document).nodeType ? newDom : new Text(newDom)\n  for (let d of deps._getters)\n    deps._setters.has(d) || (addStatesToGc(d), d._bindings.push(binding))\n  for (let l of curNewDerives) l._dom = newDom\n  curNewDerives = prevNewDerives\n  return binding._dom = newDom\n}\n\nlet derive = (f, s = state(), dom) => {\n  let deps = {_getters: new Set, _setters: new Set}, listener = {f, s}\n  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom\n  s.val = runAndCaptureDeps(f, deps, s.rawVal)\n  for (let d of deps._getters)\n    deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener))\n  return s\n}\n\nlet add = (dom, ...children) => {\n  for (let c of children.flat(Infinity)) {\n    let protoOfC = protoOf(c ?? 0)\n    let child = protoOfC === stateProto ? bind(() => c.val) :\n      protoOfC === funcProto ? bind(c) : c\n    child != _undefined && dom.append(child)\n  }\n  return dom\n}\n\nlet tag = (ns, name, ...args) => {\n  let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args]\n  let dom = ns ? document.createElementNS(ns, name) : document.createElement(name)\n  for (let [k, v] of Object.entries(props)) {\n    let getPropDescriptor = proto => proto ?\n      Object.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :\n      _undefined\n    let cacheKey = name + \",\" + k\n    let propSetter = propSetterCache[cacheKey] ??= getPropDescriptor(protoOf(dom))?.set ?? 0\n    let setter = k.startsWith(\"on\") ?\n      (v, oldV) => {\n        let event = k.slice(2)\n        dom.removeEventListener(event, oldV)\n        dom.addEventListener(event, v)\n      } :\n      propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k)\n    let protoOfV = protoOf(v ?? 0)\n    k.startsWith(\"on\") || protoOfV === funcProto && (v = derive(v), protoOfV = stateProto)\n    protoOfV === stateProto ? bind(() => (setter(v.val, v._oldVal), dom)) : setter(v)\n  }\n  return add(dom, children)\n}\n\nlet handler = ns => ({get: (_, name) => tag.bind(_undefined, ns, name)})\n\nlet update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove()\n\nlet updateDoms = () => {\n  let iter = 0, derivedStatesArray = [...changedStates].filter(s => s.rawVal !== s._oldVal)\n  do {\n    derivedStates = new Set\n    for (let l of new Set(derivedStatesArray.flatMap(s => s._listeners = keepConnected(s._listeners))))\n      derive(l.f, l.s, l._dom), l._dom = _undefined\n  } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length)\n  let changedStatesArray = [...changedStates].filter(s => s.rawVal !== s._oldVal)\n  changedStates = _undefined\n  for (let b of new Set(changedStatesArray.flatMap(s => s._bindings = keepConnected(s._bindings))))\n    update(b._dom, bind(b.f, b._dom)), b._dom = _undefined\n  for (let s of changedStatesArray) s._oldVal = s.rawVal\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n  tags: new Proxy(ns => new Proxy(tag, handler(ns)), handler()),\n  hydrate: (dom, f) => update(dom, bind(f, dom)),\n  add, state, derive,\n});\n\n\n//# sourceURL=webpack://nodejs-game-server/./node_modules/vanjs-core/src/van.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./client/index.js");
/******/ 	
/******/ })()
;