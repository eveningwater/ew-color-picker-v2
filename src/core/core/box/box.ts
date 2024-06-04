import util from "@ew-color-picker/utils";
import { BOX_TEMPLATE } from "./template";
import { getChildren, normalizeSize } from "./box-method";

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
  cacheBoxTemp!: string;
  cacheOptions: BoxProps;
  constructor(options: BoxProps = {}) {
    const { defaultColor = "" } = options;
    this.hasColor = !!defaultColor;
    this.options = util.ewAssign({}, options);
    this.cacheOptions = this.options;
    this.box = null;
    this.cacheBoxTemp = "";
    this.render();
  }
  updateChildren() {
    if (this.box) {
      const { defaultColor } = this.options;
      this.hasColor = !!defaultColor;
      this.box.replaceChildren(
        util.createByTemplate(getChildren(this.hasColor, this.options))
      );
    }
  }
  destroy() {
    if (this.box) {
      util.removeElement(this.box);
    }
  }
  update(keys: string[] = ["defaultColor", "size"]) {
    if (!this.box) {
      this.render();
    } else {
      if (keys.includes("defaultColor")) {
        const { defaultColor } = this.options;
        this.updateChildren();
        this.setBoxBgColor(defaultColor);
      }
      if (keys.includes("size")) {
        this.setBoxSize();
      }
    }
  }
  render() {
    const { container, defaultColor } = this.options;
    if (!this.cacheBoxTemp) {
      this.cacheBoxTemp = BOX_TEMPLATE(
        getChildren(this.hasColor, this.options)
      );
    }
    const node = util.createByTemplate(this.cacheBoxTemp);
    if (container) {
      util.insertNode(container, node, this.box!);
    }
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
  setBoxSize() {
    const { width = "", height = "" } = this.options;
    if (this.box) {
      if (width) {
        util.setStyle(this.box, { width: `${normalizeSize(width)}px` });
      }
      if (height) {
        util.setStyle(this.box, { height: `${normalizeSize(height)}px` });
      }
    }
  }
  setBoxBgColor(color?: string) {
    if (this.box) {
      if (color) {
        const { defaultColor } = this.options;
        util.setStyle(this.box, { backgroundColor: color ?? defaultColor });
      } else {
        this.clearBoxBgColor();
      }
    }
  }
  clearBoxBgColor() {
    if (this.box) {
      util.removeStyle(this.box, ["background-color"]);
    }
  }
}
