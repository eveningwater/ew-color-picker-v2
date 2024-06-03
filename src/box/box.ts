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
  constructor(options: BoxProps = {}) {
    const { defaultColor = "" } = options;
    this.hasColor = !!defaultColor;
    this.options = util.ewAssign({}, options);
    this.render();
  }
  updateChildren() {}
  render() {
    const { container = document.body } = this.options;
    const tem = BOX_TEMPLATE(this.hasColor ? arrowIcon() : closeIcon());
    container?.appendChild(util.create);
  }
}
