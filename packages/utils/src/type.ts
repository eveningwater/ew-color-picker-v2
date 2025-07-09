import { _toString } from "./const";

const noop = function () { return true };
export const basicDataTypeList = ["Number", "String", "Function", "Undefined", "Boolean"] as const;
export const objDataTypeList = ["Object", "Array", "RegExp"] as const;
export type TypeKey = typeof basicDataTypeList[number] | typeof objDataTypeList[number];
export type IsTypeUtil = Record<`is${TypeKey}`, <T>(v: T) => boolean>;
export interface AllTypeRes extends IsTypeUtil {
    isNull: <T>(v: T) => boolean
    isShallowObject: <T>(v: T) => boolean
};
const res: AllTypeRes = {
    isNull: v => v === null,
    isShallowObject: v => typeof v === 'object' && !res.isNull!(v),
    isNumber: noop,
    isString: noop,
    isFunction: noop,
    isUndefined: noop,
    isBoolean: noop,
    isObject: noop,
    isArray: noop,
    isRegExp: noop
};
basicDataTypeList.forEach(type => res[`is${type}`] = (value) => typeof value === type.toLowerCase());
objDataTypeList.forEach(type => res[`is${type}`] = (value) => _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase());
export const isNull = res.isNull;
export const isShallowObject = res.isShallowObject;
export const isNumber = res.isNumber;
export const isString = res.isString;
export const isFunction = res.isFunction;
export const isUndefined = res.isUndefined;
export const isBoolean = res.isBoolean;
export const isObject = res.isObject;
export const isRegExp = res.isRegExp;
export const isArray = res.isArray;

// 添加缺失的函数
export const isDeepArray = (value: any): value is any[] => Array.isArray(value);

export const isDeepObject = (value: any): value is object => 
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const ewAssign = (target: any, source: any): any => Object.assign(target, source);

export const ewError = (message: string): never => {
  throw new Error(`[ewColorPicker error]: ${message}`);
};