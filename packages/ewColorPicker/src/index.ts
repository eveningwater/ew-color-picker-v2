import ewColorPickerBoxPlugin from "@ew-color-picker/box";
import ewColorPickerConsolePlugin from "@ew-color-picker/console";
import ewColorPicker from "@ew-color-picker/core";

export default ewColorPicker;

ewColorPicker.use(ewColorPickerConsolePlugin).use(ewColorPickerBoxPlugin);
