import { arrowIcon, closeIcon } from "../icons/const";
import util from "../utils/util";
import { BOX_TEMPLATE } from "./template";

export interface BoxProps {
  defaultColor?: string;
  container?: HTMLElement;
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
    return this.hasColor ? arrowIcon() : closeIcon();
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
}
