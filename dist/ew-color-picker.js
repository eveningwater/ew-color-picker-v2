/*!
 * ew-color-picker.js v2.0.0
 * (c) 2019-2024 eveningwater 
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

    /*!
     * ew-color-picker-util.js v0.0.1
     * (c) 2019-2024 eveningwater 
     * Released under the MIT License.
     */
    const e = Object.prototype.toString,
      t = Array.prototype.slice,
      o = Object.prototype.hasOwnProperty;
    navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i);
    const r = Object.create(null);
    ["Number", "String", "Function", "Undefined"].forEach(e => {
      r["is" + e] = t => typeof t === e.toLowerCase();
    }), ["Object", "Array", "RegExp"].forEach(t => {
      r["isDeep" + t] = o => e.call(o).slice(8, -1).toLowerCase() === t.toLowerCase();
    }), ["warn", "error", "log"].forEach(e => {
      r["ew" + e.slice(0, 1).toUpperCase() + e.slice(1)] = (...t) => console[e](...t);
    }), r.isNull = e => null === e, r.isShallowObject = e => "object" == typeof e && !r.isNull(e), r.ewObjToArray = e => r.isShallowObject(e) ? t.call(e) : e, r.ewAssign = function (e, t) {
      if (!r.isNull(e)) {
        if (Object.assign) return Object.assign(e, t);
        {
          const t = Object(e);
          for (let e = 1, r = arguments.length; e < r; e++) {
            const r = arguments[e];
            if (r) for (let e in r) o.call(r, e) && (t[e] = r[e]);
          }
          return t;
        }
      }
    }, r.create = e => document.createElement(e), r.createByTemplate = e => {
      const t = r.create("div");
      return t.innerHTML = e, t.firstElementChild;
    }, r.addClass = (e, t) => e.classList.add(t), r.removeClass = (e, t) => e.classList.remove(t), r.setStyle = (e, t = {}) => r.ewAssign(e.style, t), r.removeStyle = (e, t) => {
      for (const o of t) e.style.removeProperty(o);
    }, r.setAttr = (e, t) => {
      if (r.isShallowObject(t)) for (const [o, r] of Object.entries(t)) e.setAttribute(o, `${r}`);
    }, r.setSingleAttr = (e, t, o) => r.setAttr(e, {
      [t]: o
    }), r.getAttr = (e, t) => e.getAttribute(t), r.isDom = e => r.isShallowObject(HTMLElement) ? e instanceof HTMLElement : e && r.isShallowObject(e) && 1 === e.nodeType && r.isString(e.nodeName) || e instanceof HTMLCollection || e instanceof NodeList, r.deepCloneObjByJSON = e => JSON.parse(JSON.stringify(e)), r.deepCloneObjByRecursion = function e(t) {
      if (!r.isShallowObject(t)) return;
      let o = r.isDeepArray(t) ? [] : {};
      for (let n in t) o[n] = r.isShallowObject(t[n]) ? e(t[n]) : t[n];
      return o;
    }, r.getStyle = (e, t) => window.getComputedStyle(e, null)[t], r.$ = (e, t = document) => t.querySelector(e), r.$$ = (e, t = document) => t.querySelectorAll(e), r.on = (e, t, o, r = !1) => {
      e && t && o && e.addEventListener(t, o, r);
    }, r.off = (e, t, o, r = !1) => {
      e && t && o && e.removeEventListener(t, o, r);
    }, r.checkContainer = e => {
      if (r.isDom(e)) return e;
      if (r.isString(e)) {
        const t = r.$(e);
        if (t) return t;
      }
      return document.body;
    }, r.removeElement = e => {
      e?.parentElement?.removeChild(e);
    };

    const BOX_TEMPLATE = (children, style) => `<div class="ew-color-picker-box" ${style ? `style="${style}"` : ""}>${children}</div>`;

    const handleClassName = (c) => (c ? ` ${c}` : "");
    const closeIcon = (className) => `<svg t="1690189203554" class="ew-color-picker-icon${handleClassName(className)}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2272" fill="currentColor"><path d="M504.224 470.288l207.84-207.84a16 16 0 0 1 22.608 0l11.328 11.328a16 16 0 0 1 0 22.624l-207.84 207.824 207.84 207.84a16 16 0 0 1 0 22.608l-11.328 11.328a16 16 0 0 1-22.624 0l-207.824-207.84-207.84 207.84a16 16 0 0 1-22.608 0l-11.328-11.328a16 16 0 0 1 0-22.624l207.84-207.824-207.84-207.84a16 16 0 0 1 0-22.608l11.328-11.328a16 16 0 0 1 22.624 0l207.824 207.84z" p-id="2273"></path></svg>`;
    const arrowIcon = (className) => `<svg t="1717384498630" class="ew-color-picker-icon${handleClassName(className)}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4234" width="200" height="200"><path d="M512 714.666667c-8.533333 0-17.066667-2.133333-23.466667-8.533334l-341.333333-341.333333c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l320 317.866667 317.866667-320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32 0 44.8L533.333333 704c-4.266667 8.533333-12.8 10.666667-21.333333 10.666667z" fill="#666666" p-id="4235"></path></svg>`;

    const getChildren = (hasColor, options) => {
        const { boxNoColorIcon = "", boxHasColorIcon = "" } = options;
        return hasColor
            ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon")
            : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon");
    };
    const normalizeSize = (v) => {
        if (r.isNumber(v)) {
            return v;
        }
        return parseInt(`${v}`);
    };

    class Box {
        hasColor;
        options;
        box;
        cacheBoxTemp;
        cacheOptions;
        constructor(options = {}) {
            const { defaultColor = "" } = options;
            this.hasColor = !!defaultColor;
            this.options = r.ewAssign({}, options);
            this.cacheOptions = this.options;
            this.box = null;
            this.cacheBoxTemp = "";
            this.render();
        }
        updateChildren() {
            if (this.box) {
                const { defaultColor } = this.options;
                this.hasColor = !!defaultColor;
                this.box.replaceChildren(r.createByTemplate(getChildren(this.hasColor, this.options)));
            }
        }
        destroy() {
            if (this.box) {
                r.removeElement(this.box);
            }
        }
        update() {
            if (!this.box) {
                this.render();
            }
            else {
                const { defaultColor } = this.options;
                this.updateChildren();
                this.setBoxSize();
                this.setBoxBgColor(defaultColor);
            }
        }
        render() {
            const { container, defaultColor } = this.options;
            this.cacheBoxTemp = BOX_TEMPLATE(getChildren(this.hasColor, this.options));
            container?.appendChild(r.createByTemplate(this.cacheBoxTemp));
            this.box = r.$(".ew-color-picker-box", container);
            this.setBoxSize();
            this.setBoxBgColor(defaultColor);
            this.bindHandler();
        }
        bindHandler() {
            if (this.box) {
                const { onClick } = this.options;
                r.on(this.box, "click", () => {
                    onClick?.(this);
                });
            }
        }
        setBoxSize() {
            const { width = "", height = "" } = this.options;
            if (this.box) {
                if (width) {
                    r.setStyle(this.box, { width: `${normalizeSize(width)}px` });
                }
                if (height) {
                    r.setStyle(this.box, { height: `${normalizeSize(height)}px` });
                }
            }
        }
        setBoxBgColor(color) {
            if (this.box) {
                if (color) {
                    const { defaultColor } = this.options;
                    r.setStyle(this.box, { backgroundColor: color ?? defaultColor });
                }
                else {
                    this.clearBoxBgColor();
                }
            }
        }
        clearBoxBgColor() {
            if (this.box) {
                r.removeStyle(this.box, ["background-color"]);
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
        if (r.isShallowObject(options)) {
            const { el, ...other } = options;
            return r.ewAssign(defaultConfig, {
                el: r.checkContainer(el),
                ...other,
            });
        }
        else {
            return r.ewAssign(defaultConfig, {
                el: r.checkContainer(options),
            });
        }
    };
    const normalizeBox = (config) => {
        const { size } = config;
        let b_width = "", b_height = "";
        if (r.isString(size)) {
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
        else if (r.isDeepObject(size)) {
            const { width, height } = size;
            b_width = width;
            b_height = height;
        }
        else {
            {
                r.ewError(ERROR_VARIABLE.CONFIG_SIZE_ERROR);
            }
        }
        return { b_width, b_height };
    };

    const consoleColorPickerInfo = () => r.ewLog(`%c ew-color-picker@2.0.0%c 联系QQ：854806732 %c 联系微信：eveningwater %c github:https://github.com/eveningwater/ew-color-picker %c `, "background:#0ca6dc ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:transparent");

    class ewColorPicker {
        config;
        container;
        constructor(options) {
            if (r.isUndefined(new.target) && true) {
                r.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
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
            const { defaultColor } = v.options;
            if (defaultColor) {
                v.options.defaultColor = "";
            }
            else {
                v.options.defaultColor = "#2396ef";
            }
            v.update();
        }
        render() {
            const { el, hasBox, boxHasColorIcon, boxNoColorIcon, defaultColor } = this.config;
            el?.appendChild(r.createByTemplate(CORE_TEMPLATE));
            this.container = r.checkContainer(r.$(".ew-color-picker", el));
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
