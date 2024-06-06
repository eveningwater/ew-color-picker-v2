import ERROR_VARIABLE from "../utils/error";
import util, { UtilType } from "@ew-color-picker/utils";
import "../style/index.scss";
import Box from "./box/box";
import { initConfig, normalizeBox } from "./core-method";
import { consoleColorPickerInfo } from "../utils/console";
import { CORE_TEMPLATE } from "../template";

export type AllStaticMethod = ewColorPickerStaticMethod<
  UtilType,
  typeof ewColorPicker
>;
export default class ewColorPicker {
  config!: Omit<OptionType, "el"> & { el: HTMLElement };
  container!: HTMLElement | null;
  static util: AllStaticMethod["util"];
  static createColorPicker: AllStaticMethod["createColorPicker"];
  static destroy: AllStaticMethod["destroy"];
  static usePlugin: (plugins: any) => void;
  constructor(options?: ColorPickerOptions) {
    if (util.isUndefined(new.target) && __DEV__) {
      util.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
      return;
    }
    this.container = null;
    this.config = initConfig(options);
    this.render();
  }
  render() {
    const { el } =
      this.config;
    const node = util.createByTemplate(CORE_TEMPLATE);
    if (el) {
      util.insertNode(el, node, this.container!);
    }
    this.container = util.$(".ew-color-picker", el);
  }
  destroy() {

  }
}

ewColorPicker.usePlugin = (plugins, options = {}) => {
  if (util.isDeepArray(plugins)) {
    for (const Plugin of plugins) {
      const instance = new Plugin(options);

    }
  }
}
ewColorPicker.createColorPicker = (v) => new ewColorPicker(v);
ewColorPicker.destroy = (v) => {
  if (util.isDeepArray(v)) {
    for (const item of v as (ewColorPicker)[]) {
      item.destroy();
    }
  }
  if (v instanceof ewColorPicker) {
    v?.destroy();
  }
};
Object.keys(util).forEach((key) => {
  ewColorPicker.util[key] = util[key];
});
