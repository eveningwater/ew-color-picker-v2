import {
  on,
  off,
  setStyle,
  addClass,
  removeClass,
  hasClass,
  create,
  setAttr,
  getAttr,
  debounce,
  warn,
  extend,
  $,
} from "@ew-color-picker/utils";

export interface InputNumberOptions {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  placeholder?: string;
  size?: 'small' | 'default' | 'large';
  onChange?: (value: number) => void;
  onBlur?: (value: number) => void;
  onFocus?: (event: FocusEvent) => void;
}

export default class InputNumber {
  private options: InputNumberOptions;
  private container: HTMLElement;
  private input: HTMLInputElement;
  private upButton: HTMLButtonElement;
  private downButton: HTMLButtonElement;
  private currentValue: number;
  private isFocused: boolean = false;
  
  // 防抖处理输入事件
  private debouncedOnChange: (value: number) => void;

  constructor(options: InputNumberOptions = {}) {
    const defaultOptions: InputNumberOptions = {
      value: 0,
      min: -Infinity,
      max: Infinity,
      step: 1,
      precision: 0,
      disabled: false,
      placeholder: '',
      size: 'default',
      onChange: () => {},
      onBlur: () => {},
      onFocus: () => {},
    };
    this.options = extend(defaultOptions, options) as Required<InputNumberOptions>;

    this.currentValue = this.options.value ?? 0;
    this.debouncedOnChange = debounce(this.options.onChange!, 300);
    
    this.createElements();
    this.bindEvents();
    this.updateValue(this.currentValue);
  }

  private createElements() {
    // 创建容器
    this.container = create('div');
    addClass(this.container, 'ew-input-number');
    addClass(this.container, `ew-input-number--${this.options.size}`);
    
    // 创建输入框
    this.input = create<HTMLInputElement>('input');
    addClass(this.input, 'ew-input-number__input');
    setAttr(this.input, {
      type: 'text',
      inputmode: 'decimal',
      placeholder: this.options.placeholder,
    });
    
    // 创建按钮容器
    const buttonContainer = create('div');
    addClass(buttonContainer, 'ew-input-number__buttons');
    
    // 创建上按钮
    this.upButton = create<HTMLButtonElement>('button');
    addClass(this.upButton, 'ew-input-number__button');
    addClass(this.upButton, 'ew-input-number__button--up');
    setAttr(this.upButton, { type: 'button' });
    this.upButton.innerHTML = '▲';
    
    // 创建下按钮
    this.downButton = create<HTMLButtonElement>('button');
    addClass(this.downButton, 'ew-input-number__button');
    addClass(this.downButton, 'ew-input-number__button--down');
    setAttr(this.downButton, { type: 'button' });
    this.downButton.innerHTML = '▼';
    
    // 组装DOM结构
    buttonContainer.appendChild(this.upButton);
    buttonContainer.appendChild(this.downButton);
    this.container.appendChild(this.input);
    this.container.appendChild(buttonContainer);
    
    // 设置样式
    this.setStyles();
  }

  private setStyles() {
    // 容器样式
    setStyle(this.container, {
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      backgroundColor: '#fff',
      transition: 'all 0.3s',
      position: 'relative',
      width: '100%',
      minWidth: '80px',
    });

    // 输入框样式
    setStyle(this.input, {
      flex: '1',
      border: 'none',
      outline: 'none',
      padding: '4px 8px',
      fontSize: '14px',
      backgroundColor: 'transparent',
      minWidth: '0',
    });

    // 按钮容器样式
    const buttonContainer = $('.ew-input-number__buttons', this.container);
    if (buttonContainer) {
      setStyle(buttonContainer, {
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #d9d9d9',
        backgroundColor: '#fafafa',
      });
    }

    // 按钮样式
    const buttons = this.container.querySelectorAll('.ew-input-number__button');
    buttons.forEach((button) => {
      setStyle(button as HTMLElement, {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '2px 4px',
        fontSize: '10px',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        minHeight: '16px',
      });
    });

    // 尺寸样式
    if (this.options.size === 'small') {
      setStyle(this.container, { height: '24px' });
      setStyle(this.input, { fontSize: '12px', padding: '2px 6px' });
    } else if (this.options.size === 'large') {
      setStyle(this.container, { height: '32px' });
      setStyle(this.input, { fontSize: '16px', padding: '6px 10px' });
    } else {
      setStyle(this.container, { height: '28px' });
    }

    // 禁用状态
    if (this.options.disabled) {
      this.setDisabled(true);
    }
  }

  private bindEvents() {
    // 输入框事件
    on(this.input, 'input', this.handleInput.bind(this));
    on(this.input, 'blur', this.handleBlur.bind(this) as EventListener);
    on(this.input, 'focus', this.handleFocus.bind(this) as EventListener);
    on(this.input, 'keydown', this.handleKeydown.bind(this) as EventListener);
    
    // 按钮事件
    on(this.upButton, 'click', this.handleUpClick.bind(this));
    on(this.downButton, 'click', this.handleDownClick.bind(this));
    
    // 鼠标滚轮事件
    on(this.container, 'wheel', this.handleWheel.bind(this) as EventListener);
  }

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // 允许空值、负号、小数点
    if (value === '' || value === '-' || value === '.') {
      return;
    }
    
    // 验证数字格式
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      // 如果不是有效数字，恢复原值
      this.input.value = this.currentValue.toString();
      return;
    }
    
    // 应用精度限制
    const precision = this.options.precision!;
    const roundedValue = Math.round(numValue * Math.pow(10, precision)) / Math.pow(10, precision);
    
    this.updateValue(roundedValue, false);
  }

  private handleBlur(event: FocusEvent) {
    this.isFocused = false;
    this.removeClass(this.container, 'ew-input-number--focused');
    
    // 格式化显示值
    this.formatDisplayValue();
    
    // 触发blur回调
    this.options.onBlur!(this.currentValue);
  }

  private handleFocus(event: FocusEvent) {
    this.isFocused = true;
    this.addClass(this.container, 'ew-input-number--focused');
    
    // 触发focus回调
    this.options.onFocus!(event);
  }

  private handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.increment();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decrement();
        break;
      case 'Enter':
        event.preventDefault();
        this.input.blur();
        break;
    }
  }

  private handleUpClick() {
    if (!this.options.disabled) {
      this.increment();
    }
  }

  private handleDownClick() {
    if (!this.options.disabled) {
      this.decrement();
    }
  }

  private handleWheel(event: WheelEvent) {
    if (this.isFocused && !this.options.disabled) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.increment();
      } else {
        this.decrement();
      }
    }
  }

  private increment() {
    const newValue = this.currentValue + this.options.step!;
    this.updateValue(newValue);
  }

  private decrement() {
    const newValue = this.currentValue - this.options.step!;
    this.updateValue(newValue);
  }

  private updateValue(value: number, triggerChange: boolean = true) {
    // 应用边界限制
    const min = this.options.min!;
    const max = this.options.max!;
    
    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }
    
    // 应用精度限制
    const precision = this.options.precision!;
    value = Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    
    this.currentValue = value;
    this.formatDisplayValue();
    
    // 触发change回调
    if (triggerChange) {
      this.debouncedOnChange(value);
    }
  }

  private formatDisplayValue() {
    const precision = this.options.precision!;
    this.input.value = this.currentValue.toFixed(precision);
  }

  private addClass(element: HTMLElement, className: string) {
    if (!hasClass(element, className)) {
      addClass(element, className);
    }
  }

  private removeClass(element: HTMLElement, className: string) {
    if (hasClass(element, className)) {
      removeClass(element, className);
    }
  }

  // 公共API
  public getValue(): number {
    return this.currentValue;
  }

  public setValue(value: number) {
    this.updateValue(value);
  }

  public setDisabled(disabled: boolean) {
    this.options.disabled = disabled;
    
    if (disabled) {
      this.addClass(this.container, 'ew-input-number--disabled');
      setAttr(this.input, { disabled: 'true' });
      setAttr(this.upButton, { disabled: 'true' });
      setAttr(this.downButton, { disabled: 'true' });
    } else {
      this.removeClass(this.container, 'ew-input-number--disabled');
      setAttr(this.input, { disabled: 'false' });
      setAttr(this.upButton, { disabled: 'false' });
      setAttr(this.downButton, { disabled: 'false' });
    }
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public destroy() {
    // 移除事件监听
    off(this.input, 'input', this.handleInput.bind(this));
    off(this.input, 'blur', this.handleBlur.bind(this) as EventListener);
    off(this.input, 'focus', this.handleFocus.bind(this) as EventListener);
    off(this.input, 'keydown', this.handleKeydown.bind(this) as EventListener);
    off(this.upButton, 'click', this.handleUpClick.bind(this));
    off(this.downButton, 'click', this.handleDownClick.bind(this));
    off(this.container, 'wheel', this.handleWheel.bind(this) as EventListener);
    
    // 清理DOM
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
} 