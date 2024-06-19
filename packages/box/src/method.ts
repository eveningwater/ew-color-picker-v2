import { isNumber } from "@ew-color-picker/utils";
import { arrowIcon, closeIcon } from "@ew-color-picker/icon";
import { PartialBoxProps } from "./type";

export const getBoxChildren = (hasColor: boolean, options: PartialBoxProps) => {
  const { boxNoColorIcon = "", boxHasColorIcon = "" } = options;
  return hasColor
    ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon")
    : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon");
};

export const normalizeSize = (v: string | number) => {
  if (isNumber(v)) {
    return v;
  }
  return parseInt(`${v}`);
};
