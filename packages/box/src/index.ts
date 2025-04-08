import ewColorPicker from "@ew-color-picker/core";
import {
  createByTemplate,
  extend,
  insertNode,
  removeElement,
  $,
  on,
  removeStyle,
  setStyle,
} from "@ew-color-picker/utils";
import { ewColorPickerMergeOptionsData } from "packages/core/src/mergeOptions";
import { PartialBoxProps } from "./type";
import { getBoxChildren, normalizeSize } from "./method";
import { BOX_TEMPLATE } from "./template";

export default class ewColorPickerBoxPlugin {
  static pluginName = "ewColorPickerBox";
  options: ewColorPickerBoxPluginOptions &
    Omit<ewColorPickerMergeOptionsData, "el"> = {};
  box: HTMLElement | null;
  hasColor: boolean;
  cacheBoxTemp: string;
  constructor(public ewColorPicker: ewColorPicker) {
    this.box = null;
    this.hasColor = false;
    this.cacheBoxTemp = "";
    this.handleOptions();
    this.run();
  }
  handleOptions() {
    this.options = extend(this.options, this.ewColorPicker.options);
  }
  run() {
    this.render();
  }
  updateChildren() {
    if (this.box) {
      const { defaultColor } = this.options;
      this.hasColor = !!defaultColor;
      this.box.replaceChildren(
        createByTemplate(getBoxChildren(this.hasColor, this.options))
      );
    }
  }
  destroy() {
    if (this.box) {
      removeElement(this.box);
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
        getBoxChildren(this.hasColor, this.options)
      );
    }
    const node = createByTemplate(this.cacheBoxTemp);
    if (container) {
      insertNode(container, node, this.box!);
    }
    this.box = $(".ew-color-picker-box", container) as HTMLDivElement;
    this.setBoxSize();
    this.setBoxBgColor(defaultColor);
    this.bindHandler();
  }
  bindHandler() {
    if (this.box) {
      const { onClick } = this.options;
      on(this.box, "click", () => {
        onClick?.(this);
      });
    }
  }
  setBoxSize() {
    const { width = "", height = "" } = this.options;
    if (this.box) {
      if (width) {
        setStyle(this.box, { width: `${normalizeSize(width)}px` });
      }
      if (height) {
        setStyle(this.box, { height: `${normalizeSize(height)}px` });
      }
    }
  }
  setBoxBgColor(color?: string) {
    if (this.box) {
      if (color) {
        const { defaultColor } = this.options;
        setStyle(this.box, { backgroundColor: color ?? defaultColor });
      } else {
        this.clearBoxBgColor();
      }
    }
  }
  clearBoxBgColor() {
    if (this.box) {
      removeStyle(this.box, ["background-color"]);
    }
  }
}

export type ewColorPickerBoxPluginOptions = PartialBoxProps;

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerBoxPlugin: ewColorPickerBoxPluginOptions;
  }
}
