import { assert } from "./assert";
import { isTypeRes } from './is-type';
import * as dom from './dom';
export * from './env';
import * as base from './base';

const ewColorPickerUtils = {
    ...assert,
    ...isTypeRes,
    ...dom,
    ...base,
};


export default ewColorPickerUtils as Required<typeof ewColorPickerUtils>;