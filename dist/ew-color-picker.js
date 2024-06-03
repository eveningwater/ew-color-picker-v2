/*!
 * ew-color-picker.js v2.0.0
 * (c) 2024-2024 eveningwater 
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ewColorPicker = factory());
})(this, (function () { 'use strict';

    const NOT_DOM_ELEMENTS = ['html', 'head', 'meta', 'title', 'link', 'style', 'script'];
    /**
     * 错误对象
     */
    const ERROR_VARIABLE = {
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

    const basicDataTypeList = ["Number", "String", "Function", "Undefined"];
    const objDataTypeList = ["Object", "Array", "RegExp"];
    const _toString = Object.prototype.toString;
    const _arrSlice = Array.prototype.slice;
    const _hasOwn = Object.prototype.hasOwnProperty;
    const consoleList = ["warn", "error", "log"];
    navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i);

    const util = Object.create(null);
    /**
     * 基本数据类型判断
     */
    basicDataTypeList.forEach(type => {
      util["is" + type] = value => typeof value === type.toLowerCase();
    });
    /**
     * 对象数据类型判断
     */
    objDataTypeList.forEach(type => {
      util["isDeep" + type] = value => _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase();
    });
    /**
     * 控制台打印方法
     */
    consoleList.forEach(c => {
      util["ew" + c.slice(0, 1).toUpperCase() + c.slice(1)] = (...v) => console[c](...v);
    });
    /**
     * 判断是null
     * @param value
     * @returns
     */
    util.isNull = value => value === null;
    /**
     * 判断是否是一个对象
     * @param value
     * @returns
     */
    util.isShallowObject = value => typeof value === "object" && !util.isNull(value);
    /**
     * 伪数组转数组
     * @param value
     * @returns
     */
    util["ewObjToArray"] = value => util.isShallowObject(value) ? _arrSlice.call(value) : value;
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
      } else {
        const _ = Object(target);
        for (let j = 1, len = arguments.length; j < len; j++) {
          const source = arguments[j];
          if (source) {
            for (let key in source) {
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
     * 创建节点
     * @param tag
     * @returns
     */
    util.create = tag => document.createElement(tag);
    /**
     * 根据字符串模板创建节点
     * @param temp
     * @returns
     */
    util.createByTemplate = temp => {
      const element = util.create("div");
      element.innerHTML = temp;
      return element.firstElementChild;
    };
    /**
     * 添加类名
     * @param el
     * @param className
     * @returns
     */
    util.addClass = (el, className) => el.classList.add(className);
    /**
     * 移除类名
     * @param el
     * @param className
     * @returns
     */
    util.removeClass = (el, className) => el.classList.remove(className);
    /**
     * 设置样式
     * @param el
     * @param style
     * @returns
     */
    util.setStyle = (el, style = {}) => util.ewAssign(el.style, style);
    /**
     * 设置属性
     * @param el
     * @param values
     * @returns
     */
    util.setAttr = (el, values) => {
      if (!util.isShallowObject(values)) {
        return;
      }
      for (const [key, value] of Object.entries(values)) {
        el.setAttribute(key, `${value}`);
      }
    };
    /**
     * 设置单个属性
     * @param el
     * @param key
     * @param value
     * @returns
     */
    util.setSingleAttr = (el, key, value) => util.setAttr(el, {
      [key]: value
    });
    /**
     * 获取属性
     * @param el
     * @param key
     * @returns
     */
    util.getAttr = (el, key) => el.getAttribute(key);
    /**
     * 判断是否是DOM元素
     * @param el
     * @returns
     */
    util.isDom = el => util.isShallowObject(HTMLElement) ? el instanceof HTMLElement : el && util.isShallowObject(el) && el.nodeType === 1 && util.isString(el.nodeName) || el instanceof HTMLCollection || el instanceof NodeList;
    /**
     * 深度克隆对象(JSON)
     * @param obj
     * @returns
     */
    util.deepCloneObjByJSON = obj => JSON.parse(JSON.stringify(obj));
    /**
     * 深度克隆对象(递归)
     * @param obj
     * @returns
     */
    util.deepCloneObjByRecursion = function f(obj) {
      if (!util.isShallowObject(obj)) {
        return;
      }
      let cloneObj = util.isDeepArray(obj) ? [] : {};
      for (let k in obj) {
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
    util.getStyle = (el, prop) => window.getComputedStyle(el, null)[prop];
    /**
     * 获取dom元素
     * @param selector
     * @param el
     * @returns
     */
    util.$ = (selector, el = document) => el.querySelector(selector);
    /**
     * 获取DOMList
     * @param selector
     * @param el
     * @returns
     */
    util.$$ = (selector, el = document) => el.querySelectorAll(selector);
    /**
     * 添加事件
     * @param element
     * @param type
     * @param handler
     * @param useCapture
     */
    util["on"] = (element, type, handler, useCapture = false) => {
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
    util["off"] = (element, type, handler, useCapture = false) => {
      if (element && type && handler) {
        element.removeEventListener(type, handler, useCapture);
      }
    };
    /**
     *
     * @param el
     * @returns
     */
    util.checkContainer = el => {
      if (util.isDom(el)) {
        return el;
      } else if (util.isString(el)) {
        const ele = util.$(el);
        if (ele) {
          return ele;
        }
      }
      return document.body;
    };

    const handleClassName = (c) => (c ? ` ${c}` : "");
    const closeIcon = (className) => `<svg t="1690189203554" class="ew-color-picker-icon${handleClassName(className)}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2272" fill="currentColor"><path d="M504.224 470.288l207.84-207.84a16 16 0 0 1 22.608 0l11.328 11.328a16 16 0 0 1 0 22.624l-207.84 207.824 207.84 207.84a16 16 0 0 1 0 22.608l-11.328 11.328a16 16 0 0 1-22.624 0l-207.824-207.84-207.84 207.84a16 16 0 0 1-22.608 0l-11.328-11.328a16 16 0 0 1 0-22.624l207.84-207.824-207.84-207.84a16 16 0 0 1 0-22.608l11.328-11.328a16 16 0 0 1 22.624 0l207.824 207.84z" p-id="2273"></path></svg>`;
    const arrowIcon = (className) => `<svg t="1717384498630" class="ew-color-picker-icon${handleClassName(className)}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4234" width="200" height="200"><path d="M512 714.666667c-8.533333 0-17.066667-2.133333-23.466667-8.533334l-341.333333-341.333333c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l320 317.866667 317.866667-320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32 0 44.8L533.333333 704c-4.266667 8.533333-12.8 10.666667-21.333333 10.666667z" fill="#666666" p-id="4235"></path></svg>`;

    const BOX_TEMPLATE = (children, style) => `<div class="ew-color-picker-box" ${style ? `style="${style}"` : ""}>${children}</div>`;

    class Box {
        hasColor;
        options;
        box;
        constructor(options = {}) {
            const { defaultColor = "" } = options;
            this.hasColor = !!defaultColor;
            this.options = util.ewAssign({}, options);
            this.box = null;
            this.render();
        }
        getChildren() {
            const { boxNoColorIcon = "", boxHasColorIcon = "" } = this.options;
            return this.hasColor
                ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon")
                : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon");
        }
        updateChildren() {
            if (this.box) {
                this.hasColor = !this.hasColor;
                this.box.innerHTML = this.getChildren();
            }
        }
        render() {
            const { container, defaultColor } = this.options;
            const temp = BOX_TEMPLATE(this.getChildren());
            container?.appendChild(util.createByTemplate(temp));
            this.box = util.$(".ew-color-picker-box", container);
            this.setBoxSize();
            this.setBoxBgColor(defaultColor);
            this.bindHandler();
        }
        bindHandler() {
            if (this.box) {
                const { onClick } = this.options;
                util.on(this.box, "click", () => {
                    onClick?.(this);
                });
            }
        }
        normalizeSize(v) {
            if (util.isNumber(v)) {
                return v;
            }
            return parseInt(`${v}`);
        }
        setBoxSize() {
            const { width = "", height = "" } = this.options;
            if (this.box) {
                if (width) {
                    util.setStyle(this.box, { width: `${this.normalizeSize(width)}px` });
                }
                if (height) {
                    util.setStyle(this.box, { height: `${this.normalizeSize(height)}px` });
                }
            }
        }
        setBoxBgColor(color) {
            if (this.box) {
                if (color) {
                    const { defaultColor } = this.options;
                    util.setStyle(this.box, { backgroundColor: color ?? defaultColor });
                }
            }
        }
    }

    const CORE_TEMPLATE = `<div class="ew-color-picker"></div>`;

    const defaultConfig = {
        hasBox: true,
        hue: true,
        alpha: false,
        disabled: false,
        predefineColor: [],
        size: "normal",
        defaultColor: "",
        isLog: true,
    };

    const initConfig = (options) => {
        if (util.isShallowObject(options)) {
            const { el, ...other } = options;
            return util.ewAssign(defaultConfig, {
                el: util.checkContainer(el),
                ...other,
            });
        }
        else {
            return util.ewAssign(defaultConfig, {
                el: util.checkContainer(options),
            });
        }
    };
    const normalizeBox = (config) => {
        const { size } = config;
        let b_width = "", b_height = "";
        if (util.isString(size)) {
            switch (size) {
                case "normal":
                    b_width = b_height = "40px";
                    break;
                case "medium":
                    b_width = b_height = "36px";
                    break;
                case "small":
                    b_width = b_height = "32px";
                    break;
                case "mini":
                    b_width = b_height = "28px";
                    break;
                default:
                    b_width = b_height = "40px";
                    break;
            }
        }
        else if (util.isDeepObject(size)) {
            const { width, height } = size;
            b_width = width;
            b_height = height;
        }
        else {
            if (__DEV__) {
                util.ewError(ERROR_VARIABLE.CONFIG_SIZE_ERROR);
            }
        }
        return { b_width, b_height };
    };

    const consoleColorPickerInfo = () => util.ewLog(`%c ew-color-picker@2.0.0%c 联系QQ：854806732 %c 联系微信：eveningwater %c github:https://github.com/eveningwater/ew-color-picker %c `, "background:#0ca6dc ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:transparent");

    class ewColorPicker {
        config;
        container;
        constructor(options) {
            if (util.isUndefined(new.target) && __DEV__) {
                util.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
                return;
            }
            this.container = null;
            this.config = initConfig(options);
            const { isLog } = this.config;
            if (isLog) {
                consoleColorPickerInfo();
            }
            this.render();
        }
        onBoxClickHandler(v) {
            console.log(v);
        }
        render() {
            const { el, hasBox, boxHasColorIcon, boxNoColorIcon, defaultColor } = this.config;
            el?.appendChild(util.createByTemplate(CORE_TEMPLATE));
            this.container = util.checkContainer(util.$(".ew-color-picker", el));
            if (hasBox) {
                const { b_width: width, b_height: height } = normalizeBox(this.config);
                new Box({
                    container: this.container,
                    width,
                    height,
                    boxNoColorIcon,
                    boxHasColorIcon,
                    defaultColor,
                    onClick: this.onBoxClickHandler,
                });
            }
        }
    }

    return ewColorPicker;

}));
