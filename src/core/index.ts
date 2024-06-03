import ERROR_VARIABLE from "../utils/error";
import { WrapperType, OptionType } from "../type/type";
import util from "../utils/util";
import "../style/index.scss";

export default class ewColorPicker {
  constructor(options: WrapperType | OptionType) {
    if (util.isUndefined(new.target) && __DEV__) {
      util.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
      return;
    }
  }
  render() {}
}
