/*!
 * ew-color-picker.js v2.0.0
 * (c) 2023-2024 eveningwater 
 * Released under the MIT License.
 */
import util from '@ew-color-picker/utils';

const NOT_DOM_ELEMENTS = ['html', 'head', 'meta', 'title', 'link', 'style', 'script'];
/**
 * 错误对象
 */
const ERROR_VARIABLE = {
    PICKER_OBJECT_CONFIG_ERROR: 'you should pass a param which is el and el must be a string or a dom element!',
    PICKER_CONFIG_ERROR: 'you should pass a param that it must be a string or a dom element!',
    DOM_OBJECT_ERROR: 'can not find the element by el property,make sure to pass a correct value!',
    DOM_ERROR: 'can not find the element,make sure to pass a correct param!',
    CONFIG_SIZE_ERROR: 'the value must be a string which is one of the normal,medium,small,mini,or must be an object and need to contain width or height property!',
    DOM_NOT_ERROR: 'Do not pass these elements: ' + NOT_DOM_ELEMENTS.join(',') + ' as a param,pass the correct element such as div!',
    PREDEFINE_COLOR_ERROR: 'PredefineColor is a array that is need to contain color value!',
    CONSTRUCTOR_ERROR: 'ewColorPicker is a constructor and should be called with the new keyword',
    DEFAULT_COLOR_ERROR: 'the "defaultColor" is not a invalid color,make sure to use the correct color!'
};

const handleClassName = (c) => (c ? ` ${c}` : "");
const closeIcon = (className) => `<svg t="1690189203554" class="ew-color-picker-icon${handleClassName(className)}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2272" fill="currentColor"><path d="M504.224 470.288l207.84-207.84a16 16 0 0 1 22.608 0l11.328 11.328a16 16 0 0 1 0 22.624l-207.84 207.824 207.84 207.84a16 16 0 0 1 0 22.608l-11.328 11.328a16 16 0 0 1-22.624 0l-207.824-207.84-207.84 207.84a16 16 0 0 1-22.608 0l-11.328-11.328a16 16 0 0 1 0-22.624l207.84-207.824-207.84-207.84a16 16 0 0 1 0-22.608l11.328-11.328a16 16 0 0 1 22.624 0l207.824 207.84z" p-id="2273"></path></svg>`;
const arrowIcon = (className) => `<svg t="1717384498630" class="ew-color-picker-icon${handleClassName(className)}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4234" width="200" height="200"><path d="M512 714.666667c-8.533333 0-17.066667-2.133333-23.466667-8.533334l-341.333333-341.333333c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l320 317.866667 317.866667-320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32 0 44.8L533.333333 704c-4.266667 8.533333-12.8 10.666667-21.333333 10.666667z" fill="#666666" p-id="4235"></path></svg>`;

const BOX_TEMPLATE = (children, style) => `<div class="ew-color-picker-box" ${style ? `style="${style}"` : ""}>${children}</div>`;

class Box {
    hasColor;
    options;
    box;
    constructor(options = {}) {
        const { defaultColor = "" } = options;
        this.hasColor = !!defaultColor;
        this.options = util.ewAssign({}, options);
        this.box = null;
        this.render();
    }
    getChildren() {
        const { boxNoColorIcon = "", boxHasColorIcon = "" } = this.options;
        return this.hasColor
            ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon")
            : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon");
    }
    updateChildren() {
        if (this.box) {
            this.hasColor = !this.hasColor;
            this.box.innerHTML = this.getChildren();
        }
    }
    render() {
        const { container, defaultColor } = this.options;
        const temp = BOX_TEMPLATE(this.getChildren());
        container?.appendChild(util.createByTemplate(temp));
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
    normalizeSize(v) {
        if (util.isNumber(v)) {
            return v;
        }
        return parseInt(`${v}`);
    }
    setBoxSize() {
        const { width = "", height = "" } = this.options;
        if (this.box) {
            if (width) {
                util.setStyle(this.box, { width: `${this.normalizeSize(width)}px` });
            }
            if (height) {
                util.setStyle(this.box, { height: `${this.normalizeSize(height)}px` });
            }
        }
    }
    setBoxBgColor(color) {
        if (this.box) {
            if (color) {
                const { defaultColor } = this.options;
                util.setStyle(this.box, { backgroundColor: color ?? defaultColor });
            }
        }
    }
}

const CORE_TEMPLATE = `<div class="ew-color-picker"></div>`;

const defaultConfig = {
    hasBox: true,
    hue: true,
    alpha: false,
    disabled: false,
    predefineColor: [],
    size: "normal",
    defaultColor: "",
    isLog: true,
};

const initConfig = (options) => {
    if (util.isShallowObject(options)) {
        const { el, ...other } = options;
        return util.ewAssign(defaultConfig, {
            el: util.checkContainer(el),
            ...other,
        });
    }
    else {
        return util.ewAssign(defaultConfig, {
            el: util.checkContainer(options),
        });
    }
};
const normalizeBox = (config) => {
    const { size } = config;
    let b_width = "", b_height = "";
    if (util.isString(size)) {
        switch (size) {
            case "normal":
                b_width = b_height = "40px";
                break;
            case "medium":
                b_width = b_height = "36px";
                break;
            case "small":
                b_width = b_height = "32px";
                break;
            case "mini":
                b_width = b_height = "28px";
                break;
            default:
                b_width = b_height = "40px";
                break;
        }
    }
    else if (util.isDeepObject(size)) {
        const { width, height } = size;
        b_width = width;
        b_height = height;
    }
    else {
        {
            util.ewError(ERROR_VARIABLE.CONFIG_SIZE_ERROR);
        }
    }
    return { b_width, b_height };
};

const consoleColorPickerInfo = () => util.ewLog(`%c ew-color-picker@2.0.0%c 联系QQ：854806732 %c 联系微信：eveningwater %c github:https://github.com/eveningwater/ew-color-picker %c `, "background:#0ca6dc ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#ff7878 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:transparent");

class ewColorPicker {
    config;
    container;
    constructor(options) {
        if (util.isUndefined(new.target) && true) {
            util.ewError(ERROR_VARIABLE.CONSTRUCTOR_ERROR);
            return;
        }
        this.container = null;
        this.config = initConfig(options);
        const { isLog } = this.config;
        if (isLog) {
            consoleColorPickerInfo();
        }
        this.render();
    }
    onBoxClickHandler(v) {
        console.log(v);
    }
    render() {
        const { el, hasBox, boxHasColorIcon, boxNoColorIcon, defaultColor } = this.config;
        el?.appendChild(util.createByTemplate(CORE_TEMPLATE));
        this.container = util.checkContainer(util.$(".ew-color-picker", el));
        if (hasBox) {
            const { b_width: width, b_height: height } = normalizeBox(this.config);
            new Box({
                container: this.container,
                width,
                height,
                boxNoColorIcon,
                boxHasColorIcon,
                defaultColor,
                onClick: this.onBoxClickHandler,
            });
        }
    }
}

export { ewColorPicker as default };
