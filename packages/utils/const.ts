export const basicDataTypeList:string [] = ["Number", "String", "Function", "Undefined"];
export const objDataTypeList:string [] = ["Object", "Array", "RegExp"];
export const _toString = Object.prototype.toString;
export const _arrSlice = Array.prototype.slice;
export const _hasOwn = Object.prototype.hasOwnProperty;
export const consoleList:string [] = ["warn","error","log"];
export const isMobile = navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i);
export const eventType = isMobile ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];