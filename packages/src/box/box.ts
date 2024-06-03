import { arrowIcon, closeIcon } from "../icons/const";
import util from "ew-color-picker-utils";
import { BOX_TEMPLATE } from "./template";

export interface BoxProps extends Partial<SizeType> {
  defaultColor?: string;
  container?: HTMLElement;
  boxNoColorIcon?: string;
  boxHasColorIcon?: string;
  onClick?: (v: InstanceType<typeof Box>) => void;
}
export default class Box {
  hasColor: boolean;
  options: BoxProps;
  box: HTMLElement | null;
  constructor(options: BoxProps = {}) {
    const { defaultColor = "" } = options;
    this.hasColor = !!defaultColor;
    this.options = util.ewAssign({}, options);
    this.box = null;
    this.render();
  }
  getChildren() {
    const { boxNoColorIcon = "", boxHasColorIcon = "" } = this.options;
    return this.hasColor
      ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon")
      : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon");
  }
  updateChildren() {
    if (this.box) {
      this.hasColor = !this.hasColor;
      this.box.innerHTML = this.getChildren();
    }
  }
  render() {
    const { container, defaultColor } = this.options;
    const temp = BOX_TEMPLATE(this.getChildren());
    container?.appendChild(util.createByTemplate(temp));
    this.box = util.$(".ew-color-picker-box", container);
    this.setBoxSize();
    this.setBoxBgColor(defaultColor);
    this.bindHandler();
  }
  bindHandler() {
    if (this.box) {
      const { onClick } = this.options;
      util.on(this.box, "click", () => {
        onClick?.(this);
      });
    }
  }
  normalizeSize(v: string | number) {
    if (util.isNumber(v)) {
      return v;
    }
    return parseInt(`${v}`);
  }
  setBoxSize() {
    const { width = "", height = "" } = this.options;
    if (this.box) {
      if (width) {
        util.setStyle(this.box, { width: `${this.normalizeSize(width)}px` });
      }
      if (height) {
        util.setStyle(this.box, { height: `${this.normalizeSize(height)}px` });
      }
    }
  }
  setBoxBgColor(color?: string) {
    if (this.box) {
      if (color) {
        const { defaultColor } = this.options;
        util.setStyle(this.box, { backgroundColor: color ?? defaultColor });
      }
    }
  }
}
