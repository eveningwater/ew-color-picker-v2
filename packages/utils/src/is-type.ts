import { _toString } from "./const";

const basicDataTypeList = ["Number", "String", "Function", "Undefined", "Boolean"] as const;
const objDataTypeList = ["Object", "Array", "RegExp"] as const;
type TypeKey = typeof basicDataTypeList[number] | typeof objDataTypeList[number];
type IsTypeUtil = Record<`is${TypeKey}`, <T>(v: T) => boolean>;
interface AllTypeRes extends IsTypeUtil {
    isNull: <T>(v: T) => boolean
    isShallowObject: <T>(v: T) => boolean
};
const isTypeUtil: Partial<AllTypeRes> = {
    isNull: v => v === null,
    isShallowObject: v => typeof v === 'object' && !isTypeUtil.isNull!(v)
};
basicDataTypeList.forEach(type => isTypeUtil[`is${type}`] = (value) => typeof value === type.toLowerCase());
objDataTypeList.forEach(type => isTypeUtil[`is${type}`] = (value) => _toString.call(value).slice(8, -1).toLowerCase() === type.toLowerCase());


export default isTypeUtil as Required<AllTypeRes>;