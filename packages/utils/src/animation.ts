// 动画工具模块
export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}

// 基础动画类
export class Animation {
  private element: HTMLElement;
  private options: AnimationOptions;

  constructor(element: HTMLElement, options: AnimationOptions = {}) {
    this.element = element;
    this.options = {
      duration: 300,
      easing: 'ease-out',
      delay: 0,
      ...options
    };
  }

  // 显示动画
  show(): Promise<void> {
    return new Promise((resolve) => {
      this.element.style.display = 'block';
      resolve();
    });
  }

  // 隐藏动画
  hide(): Promise<void> {
    return new Promise((resolve) => {
      this.element.style.display = 'none';
      resolve();
    });
  }

  // 滑下动画
  slideDown(): Promise<void> {
    return new Promise((resolve) => {
      // 先设置为 block 以获取真实高度
      this.element.style.display = 'block';
      this.element.style.visibility = 'hidden';
      
      // 获取元素的完整高度（包括 padding 和 border）
      const computedStyle = window.getComputedStyle(this.element);
      const height = this.element.offsetHeight + 
        parseInt(computedStyle.marginTop) + 
        parseInt(computedStyle.marginBottom);
      
      // 重置样式
      this.element.style.height = '0px';
      this.element.style.overflow = 'hidden';
      this.element.style.visibility = 'visible';
      
      // 强制重排
      this.element.offsetHeight;
      
      setTimeout(() => {
        this.element.style.transition = `height ${this.options.duration}ms ${this.options.easing}`;
        this.element.style.height = `${height}px`;
        
        setTimeout(() => {
          this.element.style.height = '';
          this.element.style.overflow = '';
          this.element.style.transition = '';
          resolve();
        }, this.options.duration!);
      }, this.options.delay);
    });
  }

  // 滑上动画
  slideUp(): Promise<void> {
    return new Promise((resolve) => {
      // 获取元素的完整高度
      const computedStyle = window.getComputedStyle(this.element);
      const height = this.element.offsetHeight + 
        parseInt(computedStyle.marginTop) + 
        parseInt(computedStyle.marginBottom);
      
      // 设置初始状态
      this.element.style.height = `${height}px`;
      this.element.style.overflow = 'hidden';
      
      // 强制重排
      this.element.offsetHeight;
      
      setTimeout(() => {
        this.element.style.transition = `height ${this.options.duration}ms ${this.options.easing}`;
        this.element.style.height = '0px';
        
        setTimeout(() => {
          this.element.style.display = 'none';
          this.element.style.height = '';
          this.element.style.overflow = '';
          this.element.style.transition = '';
          resolve();
        }, this.options.duration!);
      }, this.options.delay);
    });
  }

  // 淡入动画
  fadeIn(): Promise<void> {
    return new Promise((resolve) => {
      const element = this.element;
      const duration = this.options.duration!;
      
      // 设置初始状态
      element.style.display = 'block';
      element.style.opacity = '0';
      
      // 强制重排
      element.offsetHeight;
      
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 ease-out 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        element.style.opacity = easeProgress.toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.opacity = '1';
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  // 淡出动画
  fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      const element = this.element;
      const duration = this.options.duration!;
      
      // 确保元素可见
      element.style.display = 'block';
      element.style.opacity = '1';
      
      // 强制重排
      element.offsetHeight;
      
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 ease-in 缓动函数
        const easeProgress = Math.pow(progress, 3);
        element.style.opacity = (1 - easeProgress).toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = 'none';
          element.style.opacity = '0';
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
}

// 动画工具函数
export const ani = {
  show: (element: HTMLElement, duration: number = 300): Promise<void> => {
    return new Animation(element, { duration }).show();
  },
  
  hide: (element: HTMLElement, duration: number = 300): Promise<void> => {
    return new Animation(element, { duration }).hide();
  },
  
  slideDown: (element: HTMLElement, duration: number = 300): Promise<void> => {
    return new Animation(element, { duration }).slideDown();
  },
  
  slideUp: (element: HTMLElement, duration: number = 300): Promise<void> => {
    return new Animation(element, { duration }).slideUp();
  },
  
  fadeIn: (element: HTMLElement, duration: number = 300): Promise<void> => {
    return new Animation(element, { duration }).fadeIn();
  },
  
  fadeOut: (element: HTMLElement, duration: number = 300): Promise<void> => {
    return new Animation(element, { duration }).fadeOut();
  }
};

// 获取动画类型
export function getAnimationType(scope: any): string {
  return scope.config?.pickerAnimation || 'default';
}

// 打开动画
export function open(expression: string, picker: HTMLElement, time: number = 300): Promise<void> {
  time = time > 10000 ? 10000 : time;
  let animation = '';
  
  switch(expression) {
    case 'height':
      animation = 'slideDown';
      break;
    case 'opacity':
      animation = 'fadeIn';
      break;
    default:
      animation = 'show';
  }
  
  return ani[animation as keyof typeof ani](picker, time);
}

// 关闭动画
export function close(expression: string, picker: HTMLElement, time: number = 300): Promise<void> {
  time = time > 10000 ? 10000 : time;
  let animation = '';
  
  switch(expression) {
    case 'height':
      animation = 'slideUp';
      break;
    case 'opacity':
      animation = 'fadeOut';
      break;
    default:
      animation = 'hide';
  }
  
  return ani[animation as keyof typeof ani](picker, time);
} 