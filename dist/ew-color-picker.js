(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ewColorPicker = factory());
}(this, (function () { 'use strict';

    var NOT_DOM_ELEMENTS = ['html', 'head', 'meta', 'title', 'link', 'style', 'script'];
    /**
     * 错误对象
     */
    var ERROR_VARIABLE = {
        PICKER_OBJECT_CONFIG_ERROR: 'you should pass a param which is el and el must be a string or a dom element!',
        PICKER_CONFIG_ERROR: 'you should pass a param that it must be a string or a dom element!',
        DOM_OBJECT_ERROR: 'can not find the element by el property,make sure to pass a correct value!',
        DOM_ERROR: 'can not find the element,make sure to pass a correct param!',
        CONFIG_SIZE_ERROR: 'the value must be a string which is one of the normal,medium,small,mini,or must be an object and need to contain width or height property!',
        DOM_NOT_ERROR: 'Do not pass these elements: ' + NOT_DOM_ELEMENTS.join(',') + ' as a param,pass the correct element such as div!',
        PREDEFINE_COLOR_ERROR: 'PredefineColor is a array that is need to contain color value!',
        CONSTRUCTOR_ERROR: 'ewColorPicker is a constructor and should be called with the new keyword',
        DEFAULT_COLOR_ERROR: 'the "defaultColor" is not a invalid color,make sure to use the correct color!'
    };

    var basicDataTypeList = ["Number", "String", "Function", "Undefined"];
    var objDataTypeList = ["Object", "Array", "RegExp"];
    var _toString = Object.prototype.toString;
    var _arrSlice = Array.prototype.slice;
    var _hasOwn = Object.prototype.hasOwnProperty;
    var consoleList = ["warn", "error", "log"];
    navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i);

    var util = Object.create(null);
    /**
     * 基本数据类型判断
     */
    basicDataTypeList.forEach(function (type) {
        util["is" + type] = function (value) { return typeof value === type.toLowerCase(); };
    });
    /**
     * 对象数据类型判断
     */
    objDataTypeList.forEach(function (type) {
        util["isDeep" + type] = function (value) { return _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase(); };
    });
    /**
     * 控制台打印方法
     */
    consoleList.forEach(function (c) {
        util["ew" + c.slice(0, 1).toUpperCase() + c.slice(1)] = function (v) { return console[c]("[ewColorPicker " + c + "]\n" + v); };
    });
    /**
     * 往原型上添加方法
     * @param instance
     * @param method
     * @param func
     * @returns
     */
    util.addMethod = function (instance, method, func) { return (instance.prototype[method] = func); };
    /**
     * 判断是null
     * @param value
     * @returns
     */
    util.isNull = function (value) { return value === null; };
    /**
     * 判断是否是一个对象
     * @param value
     * @returns
     */
    util.isShallowObject = function (value) { return typeof value === "object" && !util.isNull(value); };
    /**
     * 伪数组转数组
     * @param value
     * @returns
     */
    util["ewObjToArray"] = function (value) { return util.isShallowObject(value) ? _arrSlice.call(value) : value; };
    /**
     * 合并对象
     * @param target
     * @param args
     * @returns
     */
    util.ewAssign = function (target, args) {
        if (util.isNull(target)) {
            return;
        }
        if (Object.assign) {
            return Object.assign(target, args);
        }
        else {
            var _ = Object(target);
            for (var j = 1, len = arguments.length; j < len; j++) {
                var source = arguments[j];
                if (source) {
                    for (var key in source) {
                        if (_hasOwn.call(source, key)) {
                            _[key] = source[key];
                        }
                    }
                }
            }
            return _;
        }
    };
    /**
     * 添加类名
     * @param el
     * @param className
     * @returns
     */
    util.addClass = function (el, className) { return el.classList.add(className); };
    /**
     * 移除类名
     * @param el
     * @param className
     * @returns
     */
    util.removeClass = function (el, className) { return el.classList.remove(className); };
    /**
     * 设置样式
     * @param el
     * @param style
     * @returns
     */
    util.setStyle = function (el, style) { return util.ewAssign(el.style, style); };
    /**
     * 判断是否是DOM元素
     * @param el
     * @returns
     */
    util.isDom = function (el) { return util.isShallowObject(HTMLElement) ? el instanceof HTMLElement : (el && util.isShallowObject(el) && el.nodeType === 1 && util.isString(el.nodeName)) || el instanceof HTMLCollection || el instanceof NodeList; };
    /**
     * 深度克隆对象(JSON)
     * @param obj
     * @returns
     */
    util.deepCloneObjByJSON = function (obj) { return JSON.parse(JSON.stringify(obj)); };
    /**
     * 深度克隆对象(递归)
     * @param obj
     * @returns
     */
    util.deepCloneObjByRecursion = function f(obj) {
        if (!util.isShallowObject(obj)) {
            return;
        }
        var cloneObj = util.isDeepArray(obj) ? [] : {};
        for (var k in obj) {
            cloneObj[k] = util.isShallowObject(obj[k]) ? f(obj[k]) : obj[k];
        }
        return cloneObj;
    };
    /**
     * 获取样式
     * @param el
     * @param prop
     * @returns
     */
    util.getStyle = function (el, prop) { return window.getComputedStyle(el, null)[prop]; };
    /**
     * 获取dom元素
     * @param selector
     * @param el
     * @returns
     */
    util.$ = function (selector, el) { return el.querySelector(selector); };
    /**
     * 获取DOMList
     * @param selector
     * @param el
     * @returns
     */
    util.$$ = function (selector, el) { return el.querySelectorAll(selector); };
    /**
     * 添加事件
     * @param element
     * @param type
     * @param handler
     * @param useCapture
     */
    util["on"] = function (element, type, handler, useCapture) {
        if (useCapture === void 0) { useCapture = false; }
        if (element && type && handler) {
            element.addEventListener(type, handler, useCapture);
        }
    };
    /**
     * 移除事件
     * @param element
     * @param type
     * @param handler
     * @param useCapture
     */
    util["off"] = function (element, type, handler, useCapture) {
        if (useCapture === void 0) { useCapture = false; }
        if (element && type && handler) {
            element.removeEventListener(type, handler, useCapture);
        }
    };

    //<reference path="index.d.ts" />
    var ewColorPicker = /** @class */ (function () {
        function ewColorPicker(option) {
            var _newTarget = this.constructor;
            if (util.isUndefined(_newTarget)) {
                return util.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
            }
        }
        ewColorPicker.prototype.render = function () {
        };
        return ewColorPicker;
    }());

    return ewColorPicker;

})));
