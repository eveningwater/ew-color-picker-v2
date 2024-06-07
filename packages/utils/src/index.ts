import { assert } from "./assert";
import { isTypeRes } from './is-type';
import * as dom from './dom';
export * from './env';
import * as base from './base';
import * as classnames from './classnames';

const ewColorPickerUtils = {
    ...assert,
    ...isTypeRes,
    ...dom,
    ...base,
    ...classnames
};


export default ewColorPickerUtils as Required<typeof ewColorPickerUtils>;