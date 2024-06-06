import util from ".";
import { _arrSlice, _hasOwn } from "./const";

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

export const JSONClone = <T>(v: T) => JSON.parse(JSON.stringify(v)); 