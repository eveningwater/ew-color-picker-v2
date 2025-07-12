import Core from "@ew-color-picker/core";
import Box from "@ew-color-picker/box";
import Panel from "@ew-color-picker/panel";
import Hue from "@ew-color-picker/hue";
import Alpha from "@ew-color-picker/alpha";
import Input from "@ew-color-picker/input";
import Button from "@ew-color-picker/button";
import Predefine from "@ew-color-picker/predefine";
import Console from "@ew-color-picker/console";
import ColorMode from "@ew-color-picker/colorMode";

// 注册插件
Core.use(Console);
Core.use(Box);
Core.use(Panel);
Core.use(Hue);
Core.use(Alpha);
Core.use(Input);
Core.use(Button);
Core.use(Predefine);
Core.use(ColorMode);

// 导出主构造函数
export { Core as ewColorPicker };

// 默认导出主构造函数
export default Core;

// 为UMD构建添加全局变量
if (typeof window !== 'undefined') {
  (window as any).ewColorPicker = Core;
}
