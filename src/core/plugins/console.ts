import util from "@ew-color-picker/utils";
import { consoleColorPickerInfo } from "../utils/console";

export default class ewColorPickerConsolePlugin {
    isLog: boolean;
    constructor(isLog: boolean) {
        this.isLog = util.isBoolean(isLog) ? isLog : true;
        this.run();
    }
    run() {
        if (this.isLog) {
            consoleColorPickerInfo();
        }
    }
}