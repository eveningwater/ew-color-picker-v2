import { UtilType } from "../type/type";
import {
  basicDataTypeList,
  objDataTypeList,
  _toString,
  _arrSlice,
  _hasOwn,
  consoleList,
  isMobile,
} from "./const";
const util: UtilType = Object.create(null);
/**
 * 基本数据类型判断
 */
basicDataTypeList.forEach((type) => {
  util["is" + type] = <T>(value: T): boolean =>
    typeof value === type.toLowerCase();
});
/**
 * 对象数据类型判断
 */
objDataTypeList.forEach((type) => {
  util["isDeep" + type] = <T>(value: T) =>
    _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase();
});
/**
 * 控制台打印方法
 */
consoleList.forEach((c) => {
  util["ew" + c.slice(0, 1).toUpperCase() + c.slice(1)] = (v: string) =>
    console[c](`[ewColorPicker ${c}]\n` + v);
});
/**
 * 判断是null
 * @param value
 * @returns
 */
util.isNull = (value) => value === null;
/**
 * 判断是否是一个对象
 * @param value
 * @returns
 */
util.isShallowObject = (value) =>
  typeof value === "object" && !util.isNull(value);
/**
 * 伪数组转数组
 * @param value
 * @returns
 */
util["ewObjToArray"] = <T>(value: T) =>
  util.isShallowObject(value) ? _arrSlice.call(value) : value;
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
util.create = (tag) => document.createElement(tag);
/**
 * 根据字符串模板创建节点
 * @param temp
 * @returns
 */
util.createByTemplate = (temp) => {
  const element = util.create("div");
  element.innerHTML = temp;
  return element.firstElementChild as HTMLElement;
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
util.setSingleAttr = (el, key, value) => util.setAttr(el, { [key]: value });
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
util.isDom = (el) =>
  util.isShallowObject(HTMLElement)
    ? el instanceof HTMLElement
    : (el &&
        util.isShallowObject(el) &&
        el.nodeType === 1 &&
        util.isString(el.nodeName)) ||
      el instanceof HTMLCollection ||
      el instanceof NodeList;
/**
 * 深度克隆对象(JSON)
 * @param obj
 * @returns
 */
util.deepCloneObjByJSON = (obj) => JSON.parse(JSON.stringify(obj));
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
util.checkContainer = (el) => {
  if (util.isDom(el as HTMLElement)) {
    return el as HTMLElement;
  } else if (util.isString(el)) {
    const ele = util.$(el as string);
    if (ele) {
      return ele as HTMLElement;
    }
  }
  return document.body;
};
export default util;
