import util from "@ew-color-picker/utils";
import { arrowIcon, closeIcon } from "../icons/const";
import { BoxProps } from "./box";

export const getChildren = (hasColor: boolean, options: BoxProps) => {
  const { boxNoColorIcon = "", boxHasColorIcon = "" } = options;
  return hasColor
    ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon")
    : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon");
};

export const normalizeSize = (v: string | number) => {
  if (util.isNumber(v)) {
    return v;
  }
  return parseInt(`${v}`);
};
