import { defaultConfig } from "../config";
import ERROR_VARIABLE from "../utils/error";
import util from "../utils/util";

export const initConfig = (options?: WrapperType | OptionType) => {
  if (util.isShallowObject(options)) {
    const { el, ...other } = options as OptionType;
    return util.ewAssign(defaultConfig, {
      el: util.checkContainer(el),
      ...other,
    });
  } else {
    return util.ewAssign(defaultConfig, {
      el: util.checkContainer(options as WrapperType),
    });
  }
};
export const normalizeBox = (config: OptionType) => {
  const { size } = config;
  let b_width: string | number = "",
    b_height: string | number = "";
  if (util.isString(size)) {
    switch (size) {
      case "normal":
        b_width = b_height = "40px";
        break;
      case "medium":
        b_width = b_height = "36px";
        break;
      case "small":
        b_width = b_height = "32px";
        break;
      case "mini":
        b_width = b_height = "28px";
        break;
      default:
        b_width = b_height = "40px";
        break;
    }
  } else if (util.isDeepObject(size)) {
    const { width, height } = size as SizeType;
    b_width = width;
    b_height = height;
  } else {
    if (__DEV__) {
      util.ewError(ERROR_VARIABLE.CONFIG_SIZE_ERROR);
    }
  }
  return { b_width, b_height };
};
