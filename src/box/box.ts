import { arrowIcon, closeIcon } from "../icons/const";
import { SizeType } from "../type/type";
import util from "../utils/util";
import { BOX_TEMPLATE } from "./template";

export interface BoxProps extends Partial<SizeType> {
  defaultColor?: string;
  container?: HTMLElement;
  boxNoColorIcon?: string;
  boxHasColorIcon?: string;
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
      ? boxHasColorIcon || arrowIcon()
      : boxNoColorIcon || closeIcon();
  }
  updateChildren() {
    if (this.box) {
      this.hasColor = !this.hasColor;
      this.box.innerHTML = this.getChildren();
    }
  }
  render() {
    const { container = document.body } = this.options;
    const temp = BOX_TEMPLATE(this.getChildren());
    container?.appendChild(util.createByTemplate(temp));
    this.box = util.$(".ew-color-picker-box", container);
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
}
