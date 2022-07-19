import { UtilType, InstanceType } from "../type/type";
import { basicDataTypeList,objDataTypeList,_toString,_arrSlice,_hasOwn,consoleList,isMobile } from "./const";
const util:UtilType = Object.create(null);
/**
 * 基本数据类型判断
 */
basicDataTypeList.forEach(type => {
    util["is" + type] = <T>(value: T): boolean => typeof value === type.toLowerCase();
});
/**
 * 对象数据类型判断
 */
objDataTypeList.forEach(type => {
    util["isDeep" + type] = <T>(value: T) => _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase()
});
/**
 * 控制台打印方法
 */
consoleList.forEach(c => {
    util["ew" + c.slice(0,1).toUpperCase() + c.slice(1)] = (v:string) => console[c](`[ewColorPicker ${c}]\n` + v);
});
/**
 * 往原型上添加方法
 * @param instance 
 * @param method 
 * @param func 
 * @returns 
 */
util.addMethod = (instance: InstanceType, method: string, func: Function) => ((instance as InstanceType).prototype[method] = func);
/**
 * 判断是null
 * @param value 
 * @returns 
 */
util.isNull = <T>(value: T): boolean => value === null;
/**
 * 判断是否是一个对象
 * @param value 
 * @returns 
 */
util.isShallowObject = <T>(value: T): boolean => typeof value === "object" && !util.isNull(value);
/**
 * 伪数组转数组
 * @param value 
 * @returns 
 */
util["ewObjToArray"] = <T>(value: T) => util.isShallowObject(value) ? _arrSlice.call(value) : value;
/**
 * 合并对象
 * @param target 
 * @param args 
 * @returns 
 */
util.ewAssign = function(target: object, args: object) {
  if (util.isNull(target)){
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
 * 添加类名
 * @param el 
 * @param className 
 * @returns 
 */
util.addClass = (el: HTMLElement | Element, className: string) => el.classList.add(className);
/**
 * 移除类名
 * @param el 
 * @param className 
 * @returns 
 */
util.removeClass = (el: HTMLElement | Element, className: string) => el.classList.remove(className);
/**
 * 设置样式
 * @param el 
 * @param style 
 * @returns 
 */
util.setStyle = (el: HTMLElement, style:CSSStyleDeclaration) => util.ewAssign(el.style,style);
/**
 * 判断是否是DOM元素
 * @param el 
 * @returns 
 */
util.isDom = (el: HTMLElement | Element) => util.isShallowObject(HTMLElement) ? el instanceof HTMLElement : (el && util.isShallowObject(el) && el.nodeType === 1 && util.isString(el.nodeName)) || el instanceof HTMLCollection || el instanceof NodeList;
/**
 * 深度克隆对象(JSON)
 * @param obj 
 * @returns 
 */
util.deepCloneObjByJSON = (obj: object) => JSON.parse(JSON.stringify(obj));
/**
 * 深度克隆对象(递归)
 * @param obj 
 * @returns 
 */
util.deepCloneObjByRecursion = function f<T>(obj: object | Array<T>) {
  if (!util.isShallowObject(obj)){
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
util.getStyle = (el: HTMLElement | Element, prop: string) => window.getComputedStyle(el, null)[prop];
/**
 * 获取dom元素
 * @param selector 
 * @param el 
 * @returns 
 */
util.$ = (selector: string,el:HTMLElement | Element | Document):HTMLElement | Element | null => el.querySelector(selector);
/**
 * 获取DOMList
 * @param selector 
 * @param el 
 * @returns 
 */
util.$$ = (selector:string,el:HTMLElement | Element | Document):NodeList => el.querySelectorAll(selector);
/**
 * 添加事件
 * @param element 
 * @param type 
 * @param handler 
 * @param useCapture 
 */
util["on"] = (element: HTMLElement | Element | Document | Window,type: string,handler: EventListenerOrEventListenerObject,useCapture = false): void => {
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
util["off"] = (element: HTMLElement | Element | Document | Window,type: string,handler: EventListenerOrEventListenerObject,useCapture = false) => {
  if (element && type && handler) {
      element.removeEventListener(type, handler, useCapture);
  }
};
export default util;
