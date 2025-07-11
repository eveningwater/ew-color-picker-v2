import ewColorPicker from "@ew-color-picker/core";
import {
  ApplyOrder,
  extend,
  warn,
} from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";
import InputNumber, { InputNumberOptions } from "./index";

export interface InputNumberPluginOptions {
  enabled?: boolean;
  defaultOptions?: Partial<InputNumberOptions>;
}

export default class ewColorPickerInputNumberPlugin {
  static pluginName = "ewColorPickerInputNumber";
  static applyOrder = ApplyOrder.Post;
  options: InputNumberPluginOptions & Omit<ewColorPickerOptions, "el"> = {} as any;
  
  // 存储创建的InputNumber实例
  private inputNumberInstances: Map<string, InputNumber> = new Map();

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    const defaultOptions: InputNumberPluginOptions = {
      enabled: true,
      defaultOptions: {
        size: 'small',
        precision: 0,
        step: 1,
      }
    };
    this.options = extend(defaultOptions, this.options || {}, this.ewColorPicker.options) as Required<InputNumberPluginOptions>;
  }

  run() {
    if (this.options.enabled) {
      this.replaceNumberInputs();
    }
  }

  /**
   * 替换页面中的原生数字输入框
   */
  private replaceNumberInputs() {
    // 查找所有type="number"的输入框
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach((input, index) => {
      const htmlInput = input as HTMLInputElement;
      const inputId = `ew-input-number-${index}`;
      
      // 获取原生输入框的属性
      const min = parseFloat(htmlInput.min) || undefined;
      const max = parseFloat(htmlInput.max) || undefined;
      const step = parseFloat(htmlInput.step) || 1;
      const value = parseFloat(htmlInput.value) || 0;
      const placeholder = htmlInput.placeholder || '';
      
      // 创建InputNumber实例
      const inputNumberOptions: InputNumberOptions = {
        value,
        min,
        max,
        step,
        precision: this.getPrecision(step),
        placeholder,
        onChange: (newValue: number) => {
          // 更新原生输入框的值
          htmlInput.value = newValue.toString();
          // 触发原生输入框的事件
          this.triggerInputEvent(htmlInput, newValue);
        },
        onBlur: (newValue: number) => {
          // 触发原生输入框的blur事件
          this.triggerBlurEvent(htmlInput, newValue);
        },
        onFocus: (event: FocusEvent) => {
          // 触发原生输入框的focus事件
          this.triggerFocusEvent(htmlInput, event);
        }
      };

      // 合并默认选项
      const finalOptions = extend({}, this.options.defaultOptions || {}, inputNumberOptions);
      
      const inputNumber = new InputNumber(finalOptions);
      
      // 替换原生输入框
      if (htmlInput.parentNode) {
        htmlInput.parentNode.insertBefore(inputNumber.getElement(), htmlInput);
        htmlInput.style.display = 'none'; // 隐藏原生输入框
      }
      
      // 存储实例
      this.inputNumberInstances.set(inputId, inputNumber);
    });
  }

  /**
   * 根据step值计算精度
   */
  private getPrecision(step: number): number {
    if (step === 1) return 0;
    if (step === 0.1) return 1;
    if (step === 0.01) return 2;
    if (step === 0.001) return 3;
    
    // 计算小数位数
    const stepStr = step.toString();
    const decimalIndex = stepStr.indexOf('.');
    return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
  }

  /**
   * 触发原生输入框的input事件
   */
  private triggerInputEvent(input: HTMLInputElement, value: number) {
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  }

  /**
   * 触发原生输入框的blur事件
   */
  private triggerBlurEvent(input: HTMLInputElement, value: number) {
    const event = new Event('blur', { bubbles: true });
    input.dispatchEvent(event);
  }

  /**
   * 触发原生输入框的focus事件
   */
  private triggerFocusEvent(input: HTMLInputElement, originalEvent: FocusEvent) {
    const event = new FocusEvent('focus', { bubbles: true });
    input.dispatchEvent(event);
  }

  /**
   * 更新InputNumber的值
   */
  public updateValue(inputId: string, value: number) {
    const instance = this.inputNumberInstances.get(inputId);
    if (instance) {
      instance.setValue(value);
    }
  }

  /**
   * 获取InputNumber的值
   */
  public getValue(inputId: string): number | undefined {
    const instance = this.inputNumberInstances.get(inputId);
    return instance ? instance.getValue() : undefined;
  }

  /**
   * 设置InputNumber的禁用状态
   */
  public setDisabled(inputId: string, disabled: boolean) {
    const instance = this.inputNumberInstances.get(inputId);
    if (instance) {
      instance.setDisabled(disabled);
    }
  }

  /**
   * 销毁所有InputNumber实例
   */
  public destroy() {
    this.inputNumberInstances.forEach((instance) => {
      instance.destroy();
    });
    this.inputNumberInstances.clear();
  }
}

declare module "@ew-color-picker/core" {
  interface CustomOptions {
    ewColorPickerInputNumber: InputNumberPluginOptions;
  }
} 