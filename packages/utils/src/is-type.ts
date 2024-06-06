const basicDataTypeList = ["Number", "String", "Function", "Undefined", "Boolean"] as const;
type isTypeResKey = Record<`is${typeof basicDataTypeList[number]}`, <T>(v: T) => boolean>;
export const isTypeRes: Partial<isTypeResKey> = {};
basicDataTypeList.forEach(type => isTypeRes[`is${type}`] = <T>(value: T) => typeof value === type.toLowerCase());
