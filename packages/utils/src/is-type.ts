import { _toString } from "./const";

const basicDataTypeList = ["Number", "String", "Function", "Undefined", "Boolean"] as const;
const objDataTypeList = ["Object", "Array", "RegExp"] as const;
type TypeKey = typeof basicDataTypeList[number] | typeof objDataTypeList[number];
type IsTypeRes = Record<`is${TypeKey}`, <T>(v: T) => boolean>;
interface AllTypeRes extends IsTypeRes {
    isNull: <T>(v: T) => boolean
    isShallowObject: <T>(v: T) => boolean
};
export const isTypeRes: Partial<AllTypeRes> = {
    isNull: v => v === null,
    isShallowObject: v => typeof v === 'object' && !isTypeRes.isNull!(v)
};
basicDataTypeList.forEach(type => isTypeRes[`is${type}`] = (value) => typeof value === type.toLowerCase());
objDataTypeList.forEach(type => isTypeRes[`is${type}`] = (value) => _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase());

