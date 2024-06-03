import { OptionType } from "./type/type";

export const defaultConfig: Omit<OptionType, "el"> = {
  hasBox: true,
  hue: true,
  alpha: false,
  disabled: false,
  predefineColor: [],
  size: "normal",
  defaultColor: "",
  isLog: true,
};
