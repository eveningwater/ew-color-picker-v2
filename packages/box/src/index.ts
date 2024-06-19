import ewColorPicker from "@ew-color-picker/core";
import { extend } from "@ew-color-picker/utils";
import { ewColorPickerMergeOptionsData } from "packages/core/src/mergeOptions";
import { PartialBoxProps } from "./type";

export default class ewColorPickerBoxPlugin {
  static pluginName = "ewColorPickerConsole";
  options: ewColorPickerBoxPluginOptions &
    Omit<ewColorPickerMergeOptionsData, "el"> = {};
  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }
  handleOptions() {
    this.options = extend(this.options, this.ewColorPicker.options);
  }
  run() {}
}

export type ewColorPickerBoxPluginOptions = PartialBoxProps;

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerBoxPlugin: ewColorPickerBoxPluginOptions;
  }
}
