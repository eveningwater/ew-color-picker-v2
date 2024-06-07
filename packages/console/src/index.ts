import util from "@ew-color-picker/utils";
export const tips = [`%c ew-color-picker@2.0.0%c 联系QQ：854806732 %c 联系微信：eveningwater %c github:https://github.com/eveningwater/ew-color-picker %c `,
    "background:#0ca6dc ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
    "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
    "background:#ff7878 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
    "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
    "background:transparent"];

export default class ewColorPickerConsolePlugin {
    isLog: boolean;
    constructor(isLog: boolean) {
        this.isLog = util.isBoolean(isLog) ? isLog : true;
        this.run();
    }
    run() {
        if (this.isLog) {
            util.log(...tips);
        }
    }
}