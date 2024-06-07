import util from ".";
import { _arrSlice, _hasOwn } from "./const";
/**
 * 对象合并
 * @param t 
 * @param o 
 * @returns 
 */
export const extend = <T extends {}, U extends T>(t: T, ...o: U[]): T & U => {
    if (util.isNull(t)) {
        return {} as T & U;
    }
    if (Object.assign) {
        return Object.assign(t, ...o);
    } else {
        const _ = Object(t) as T & U;
        for (let j = 1, len = o.length; j < len; j++) {
            const source = o[j];
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
}

/**
 * 伪数组转换成数组
 * @param v 
 * @returns 
 */
export const toArray = <T>(v: Iterable<T> | ArrayLike<T>) => {
    if (!util.isShallowObject(v)) {
        return v;
    }
    if (Array.from) {
        return Array.from(v);
    } else {
        return _arrSlice.call(v)
    }
}
/**
 * 深度复制，受限于JSON的功能
 * @param v 
 * @returns 
 */
export const JSONClone = <T>(v: T) => JSON.parse(JSON.stringify(v));
/**
 * 递归深度复制
 * @param obj 
 * @returns 
 */
export const clone = function f<T>(obj: T) {
    if (!util.isShallowObject(obj)) {
        return obj;
    }
    const res = (util.isArray(obj) ? [] : {}) as T;
    for (const k in obj) {
        res[k] = util.isShallowObject(obj[k]) ? f(obj[k]) : obj[k];
    }
    return res;
}
/**
 * 移除所有空白
 * @param value 
 * @returns 
 */
export const removeAllSpace = (value: string) => value.replace(/\s+/g, "");
/**
 * 是否是promise
 * @param value 
 * @returns 
 */
export const isPromise = <T extends Promise<any>>(value: T) => !util.isUndefined(value) && !util.isNull(value) && util.isFunction(value.then) && util.isFunction(value.catch)