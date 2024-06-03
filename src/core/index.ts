import ERROR_VARIABLE from "../utils/error";
import { WrapperType, OptionType } from "../type/type";
import util from "../utils/util";
import "../style/index.scss";

//<reference path="index.d.ts" />
export default class ewColorPicker {
  constructor(option: WrapperType | OptionType) {
    if (util.isUndefined(new.target) && __DEV__) {
      util.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
      return;
    }
  }
  render() {}
}
