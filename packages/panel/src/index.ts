import ewColorPicker from "@ew-color-picker/core";
import {
  on,
  setStyle,
  getRect,
  getClientSize,
  isFunction,
  ApplyOrder,
  extend,
  warn,
  off,
  $,
  removeNode,
  create,
  addClass,
} from "@ew-color-picker/utils";
import {
  colorRgbaToHsva,
  colorHsvaToRgba,
  colorRgbaToHex,
} from "@ew-color-picker/utils";
import { ewColorPickerOptions } from "@ew-color-picker/core";

export interface PanelOptions {
  hue?: boolean;
  alpha?: boolean;
  hueDirection?: "horizontal" | "vertical";
  alphaDirection?: "horizontal" | "vertical";
}

export default class ewColorPickerPanelPlugin {
  static pluginName = "ewColorPickerPanel";
  static applyOrder = ApplyOrder.Post;

  options: PanelOptions & Omit<ewColorPickerOptions, "el"> = {} as any;

  // DOM 元素
  panel: HTMLElement | null = null;
  cursor: HTMLElement | null = null;
  whitePanel: HTMLElement | null = null;
  blackPanel: HTMLElement | null = null;
  hueBar: HTMLElement | null = null;
  hueThumb: HTMLElement | null = null;
  alphaBar: HTMLElement | null = null;
  alphaThumb: HTMLElement | null = null;
  hueBg: HTMLElement | null = null;

  // 面板尺寸
  panelWidth: number;
  panelHeight: number;

  // 面板容器尺寸
  containerWidth: number;
  containerHeight: number;

  // 方向标志
  isHueHorizontal: boolean = false;
  isAlphaHorizontal: boolean = false;

  constructor(public ewColorPicker: ewColorPicker) {
    this.handleOptions();
    this.run();
  }

  handleOptions() {
    this.options = extend({}, this.options, this.ewColorPicker.options);
    this.isHueHorizontal = this.options.hueDirection === "horizontal";
    this.isAlphaHorizontal = this.options.alphaDirection === "horizontal";
  }

  run() {
    this.render();
    // 延迟绑定事件，确保DOM完全渲染
    setTimeout(() => {
      this.bindEvents();
    }, 10);
  }

  render() {
    // 直接使用面板容器
    const panelContainer = this.ewColorPicker.getMountPoint("panelContainer");
    if (!panelContainer) {
      warn("[ewColorPicker] Panel container not found");
      return;
    }
    // 只移除自己负责的 DOM
    const oldPanel = $(".ew-color-picker-panel", panelContainer);
    if (oldPanel) removeNode(oldPanel);

    // 动态计算面板宽度
    let panelWidth = 285;
    if (this.isAlphaHorizontal && this.isHueHorizontal) {
      panelWidth = 300;
    }
    if (
      (this.isAlphaHorizontal && !this.isHueHorizontal) ||
      (!this.isAlphaHorizontal && this.isHueHorizontal)
    ) {
      panelWidth = 285 + 12;
    }
    this.panel = create("div");
    addClass(this.panel, "ew-color-picker-panel");
    addClass(this.panel, "ew-color-picker-panel-dynamic-size");
    
    this.panelWidth = panelWidth;
    this.panelHeight = 180;

    // 使用 setProperty 直接设置 CSS 变量
    this.panel.style.setProperty('--panel-width', panelWidth + 'px');
    this.panel.style.setProperty('--panel-height', this.panelHeight + 'px');

    panelContainer.appendChild(this.panel);

    // 使用 setTimeout 确保容器完全渲染后再计算尺寸
    setTimeout(() => {
      this.calculateContainerSize();
      this.handleAutoPosition();
    }, 0);

    // 渲染白色和黑色渐变层
    this.whitePanel = create("div");
    addClass(this.whitePanel, "ew-color-picker-white-panel");
    this.panel.appendChild(this.whitePanel);
    
    this.blackPanel = create("div");
    addClass(this.blackPanel, "ew-color-picker-black-panel");
    this.panel.appendChild(this.blackPanel);
    
    // 渲染光标
    this.cursor = create("div");
    addClass(this.cursor, "ew-color-picker-panel-cursor");
    this.panel.appendChild(this.cursor);

    // 创建底部行容器（只插入一次）
    let bottomRow = $(".ew-color-picker-bottom-row", panelContainer);
    if (!bottomRow) {
      bottomRow = create("div");
      addClass(bottomRow, "ew-color-picker-bottom-row");
      panelContainer.appendChild(bottomRow);
    }

    // 设置初始色相底色
    this.updateHueBg();
    // 设置初始光标位置
    this.updateCursorPosition(100, 100);
  }

  bindEvents() {
    if (!this.panel) {
      warn(
        "[ewColorPicker panel plugin] No panel container elementfound, skipping event binding"
      );
      return;
    }
    // 面板点击事件
    on(this.panel, "click", (event) =>
      this.handlePanelClick(event as MouseEvent)
    );
    on(this.panel, "mousedown", () => this.handlePanelMouseDown());

  
  }

  handlePanelClick(event: MouseEvent) {
    if (!this.panel || !this.cursor) return;

    const rect = getRect(this.panel);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算饱和度和明度
    const saturation = Math.max(0, Math.min(100, (x / this.panelWidth) * 100));
    const value = Math.max(0, Math.min(100, (1 - y / this.panelHeight) * 100));
    
    // 更新光标位置和颜色
    this.updateCursorPosition(saturation, value);
    this.updateColor(saturation, value);
  }

  handlePanelMouseDown() {
    if (!this.panel) return;

    const handleMouseMove = (e: MouseEvent) => {
      this.handlePanelClick(e);
    };

    const handleMouseUp = () => {
      off(document, "mousemove", handleMouseMove as EventListener);
      off(document, "mouseup", handleMouseUp as EventListener);
    };

    on(document, "mousemove", handleMouseMove as EventListener);
    on(document, "mouseup", handleMouseUp as EventListener);
  }

  updateCursorPosition(saturation: number, value: number) {
    if (!this.cursor || !this.panel) return;

    // 计算相对面板的坐标
    const left = Math.max(
      0,
      Math.min((saturation / 100) * this.panelWidth, this.panelWidth)
    );
    const top = Math.max(
      0,
      Math.min((1 - value / 100) * this.panelHeight, this.panelHeight)
    );

    setStyle(this.cursor, {
      left: `${left + 4}px`,
      top: `${top + 4}px`,
    });
  }

  updateColor(saturation: number, value: number) {
    const { alpha } = this.options;
    const defaultColor = alpha ? "rgba(255,0,0,1)" : "#ff0000";
    let currentColor = this.ewColorPicker.getColor();
    if (!currentColor || currentColor.indexOf("NaN") !== -1) {
      currentColor = defaultColor;
      this.ewColorPicker.setColor(currentColor);
    }
    const hsva = colorRgbaToHsva(currentColor);
    hsva.s = saturation;
    hsva.v = value;
    
    const newColor = colorHsvaToRgba(hsva);
    this.ewColorPicker.setColor(newColor);
    // 触发change事件
    if (isFunction(this.ewColorPicker.options.changeColor)) {
      this.ewColorPicker.options.changeColor(newColor);
    }
    this.ewColorPicker.trigger("change", newColor);
  }

  updateHueBg() {
    if (this.panel) {
      let hsva;
      const currentColor = this.ewColorPicker.getColor();
      if (!currentColor || currentColor.indexOf("NaN") !== -1) {
        // 默认红色
        hsva = { h: 0, s: 100, v: 100, a: 1 };
      } else {
        const temp = colorRgbaToHsva(currentColor);
        hsva = { h: temp.h, s: 100, v: 100, a: 1 };
      }
      const hueColor = colorHsvaToRgba(hsva);
      setStyle(this.panel, {
        background: hueColor,
      });
    }
  }

  calculateContainerSize() {
    const panelContainer = this.ewColorPicker.getMountPoint("panelContainer");
    if (panelContainer) {
      // 临时让容器可见以获取尺寸，但设置为不可见
      const originalDisplay = panelContainer.style.display;
      const originalVisibility = panelContainer.style.visibility;
      const originalPosition = panelContainer.style.position;

      setStyle(panelContainer, {
        display: "block",
        visibility: "hidden",
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
      });

      // 尝试多种方法获取容器尺寸
      const containerRect = getRect(panelContainer);
      const clientSize = getClientSize(panelContainer);
      const offsetWidth = panelContainer.offsetWidth;
      const offsetHeight = panelContainer.offsetHeight;

      // 优先使用 offsetWidth/offsetHeight，如果为0则使用 getBoundingClientRect
      this.containerWidth = offsetWidth || containerRect.width;
      this.containerHeight = offsetHeight || containerRect.height;

      // 恢复原始样式
      setStyle(panelContainer, {
        display: originalDisplay,
        visibility: originalVisibility,
        position: originalPosition,
        left: "",
        top: "",
      });
    }
  }

  handleAutoPosition() {
    // 自动定位逻辑
    if (
      this.ewColorPicker.options.autoPanelPosition &&
      this.ewColorPicker.options.hasBox
    ) {
      const rootElement = this.ewColorPicker.getMountPoint("root");
      const colorBox = $(".ew-color-picker-box", rootElement);

      if (colorBox && rootElement) {
        // 获取box相对于根容器的位置和尺寸
        const boxRect = getRect(colorBox);
        const rootRect = getRect(rootElement);
        const boxLeft = boxRect.left - rootRect.left;
        const boxTop = boxRect.top - rootRect.top;
        const boxWidth = colorBox.offsetWidth;
        const boxHeight = colorBox.offsetHeight;

        // 解析位置字符串
        const [position, align] = (
          this.ewColorPicker.options.panelPlacement || "bottom"
        ).split("-");

        // 暂时去掉智能位置选择，只使用配置的位置
        let finalPosition = position;
        let finalAlign = align || "";

        // 重新计算容器尺寸，确保获取到正确的值
        this.calculateContainerSize();

        // 计算所有方向的位置值
        const positionMap = this.calculateAllPositions(boxWidth, boxHeight);

        // 获取当前配置的位置
        const currentPosition =
          positionMap[`${finalPosition}-${finalAlign}`] ||
          positionMap[`${finalPosition}-center`];
        let left = currentPosition.left;
        let top = currentPosition.top;

        // 边界检测和调整
        const adjustedPosition = this.adjustPositionForBoundaries(
          left,
          top,
          finalPosition,
          finalAlign,
          positionMap
        );
        left = adjustedPosition.left;
        top = adjustedPosition.top;

        // 应用位置（相对于根容器）
        const panelContainer =
          this.ewColorPicker.getMountPoint("panelContainer");
        if (panelContainer) {
          setStyle(panelContainer, {
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
          });
        }
      }
    }
  }

  calculateAllPositions(boxWidth: number, boxHeight: number) {
    const positionMap: Record<string, { left: number; top: number }> = {};

    // 计算所有方向和对齐方式的位置
    const positions = ["top", "bottom", "left", "right"];
    const aligns = ["start", "end", "center"];

    positions.forEach((position) => {
      aligns.forEach((align) => {
        const key = `${position}-${align}`;
        let left = 0;
        let top = 0;

        switch (position) {
          case "top":
            // top: 面板底部紧贴box顶部
            top = -this.containerHeight - boxHeight / 2;
            if (align === "start") {
              // top-start: 面板左边缘与box左边缘对齐
              left = -this.containerWidth;
            } else if (align === "end") {
              // top-end: 面板右边缘与box右边缘对齐
              left = boxWidth;
            } else {
              // top-center: 面板中心与box中心对齐
              left = -this.containerWidth / 2 + boxWidth / 2;
            }
            break;

          case "bottom":
            // bottom: 面板顶部紧贴box底部
            top = boxHeight;
            if (align === "start") {
              // bottom-start: 面板左边缘与box左边缘对齐
              left = -this.containerWidth;
            } else if (align === "end") {
              // bottom-end: 面板右边缘与box右边缘对齐
              left = boxWidth;
            } else {
              // bottom-center: 面板中心与box中心对齐
              left = -this.containerWidth / 2;
            }
            break;

          case "left":
            // left: 面板右边缘紧贴box左边缘
            left = -this.containerWidth - 5;
            if (align === "start") {
              // left-start: 面板顶部与box顶部对齐
              top = -this.containerHeight - boxHeight / 2;
            } else if (align === "end") {
              // left-end: 面板底部与box底部对齐
              top = boxHeight;
            } else {
              // left-center: 面板中心与box中心对齐
              top = -this.containerHeight / 2;
            }
            break;

          case "right":
            // right: 面板左边缘紧贴box右边缘
            left = boxWidth + 5;
            if (align === "start") {
              // right-start: 面板顶部与box顶部对齐
              top = -this.containerHeight - boxHeight / 2;
            } else if (align === "end") {
              // right-end: 面板底部与box底部对齐
              top = boxHeight;
    } else {
              // right-center: 面板中心与box中心对齐
              top = -this.containerHeight / 2;
            }
            break;
        }

        positionMap[key] = { left, top };
      });
    });

    return positionMap;
  }

  adjustPositionForBoundaries(
    left: number,
    top: number,
    position: string,
    align: string,
    positionMap: Record<string, { left: number; top: number }>
  ) {
    const margin = 8; // 边界边距
    const rootElement = this.ewColorPicker.getMountPoint("root");
    const colorBox = rootElement?.querySelector(
      ".ew-color-picker-box"
    ) as HTMLElement;

    if (!rootElement || !colorBox) {
      return { left, top };
    }

    // 获取根容器在视口中的位置
    const rootRect = getRect(rootElement);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 计算面板在视口中的绝对位置
    const panelLeftInViewport = rootRect.left + left;
    const panelTopInViewport = rootRect.top + top;
    const panelRightInViewport = panelLeftInViewport + this.containerWidth;
    const panelBottomInViewport = panelTopInViewport + this.containerHeight;

    // 临时调试信息
    console.log('🔍 Boundary Check Debug:');
    console.log('position:', position);
    console.log('align:', align);
    console.log('rootRect:', rootRect);
    console.log('viewportWidth:', viewportWidth);
    console.log('viewportHeight:', viewportHeight);
    console.log('panelLeftInViewport:', panelLeftInViewport);
    console.log('panelTopInViewport:', panelTopInViewport);
    console.log('panelRightInViewport:', panelRightInViewport);
    console.log('panelBottomInViewport:', panelBottomInViewport);
    console.log('containerWidth:', this.containerWidth);
    console.log('containerHeight:', this.containerHeight);
    console.log('margin:', margin);

    // 检测边界问题
    const boundaryIssues = {
      top: panelTopInViewport < margin,
      bottom: panelBottomInViewport > viewportHeight - margin,
      left: panelLeftInViewport < margin,
      right: panelRightInViewport > viewportWidth - margin
    };

    console.log('Boundary issues:', boundaryIssues);

    // 如果没有边界问题，直接返回原位置
    if (!boundaryIssues.top && !boundaryIssues.bottom && !boundaryIssues.left && !boundaryIssues.right) {
      console.log('✅ No boundary issues');
      return { left, top };
    }

    // 小屏幕特殊处理：如果面板宽度超过视口宽度的80%，采用移动端定位策略
    const isSmallScreen = this.containerWidth > viewportWidth * 0.8;
    
    if (isSmallScreen) {
      console.log('📱 Small screen detected, using mobile positioning strategy');
      
      // 获取box的尺寸
      const boxWidth = colorBox.offsetWidth;
      const boxHeight = colorBox.offsetHeight;
      
      // 移动端定位：面板显示在box下方，水平定位在视口右侧
      const mobileTop = boxHeight; // 面板顶部对齐box底部
      const mobileLeft = -(viewportWidth - this.containerWidth); // 水平定位在视口右侧
      
      console.log('✅ Mobile position:', { left: mobileLeft, top: mobileTop });
      return { left: mobileLeft, top: mobileTop };
    }

    // 智能边界调整策略 - 尝试所有可能的位置组合
    const allPositions = ['top', 'bottom', 'left', 'right'];
    const allAligns = ['start', 'end', 'center'];
    
    let bestPosition = { left, top };
    let bestIssuesCount = Object.values(boundaryIssues).filter(Boolean).length;
    let bestPositionKey = `${position}-${align}`;

    // 遍历所有可能的位置和对齐组合
    for (const testPosition of allPositions) {
      for (const testAlign of allAligns) {
        const testPositionKey = `${testPosition}-${testAlign}`;
        const testPositionValue = positionMap[testPositionKey];
        
        if (testPositionValue) {
          // 计算测试位置在视口中的绝对位置
          const testPanelLeftInViewport = rootRect.left + testPositionValue.left;
          const testPanelTopInViewport = rootRect.top + testPositionValue.top;
          const testPanelRightInViewport = testPanelLeftInViewport + this.containerWidth;
          const testPanelBottomInViewport = testPanelTopInViewport + this.containerHeight;

          // 检测测试位置的边界问题
          const testBoundaryIssues = {
            top: testPanelTopInViewport < margin,
            bottom: testPanelBottomInViewport > viewportHeight - margin,
            left: testPanelLeftInViewport < margin,
            right: testPanelRightInViewport > viewportWidth - margin
          };

          const testIssuesCount = Object.values(testBoundaryIssues).filter(Boolean).length;

          // 如果这个位置比当前最好的位置更好，更新最佳位置
          if (testIssuesCount < bestIssuesCount) {
            bestIssuesCount = testIssuesCount;
            bestPosition = testPositionValue;
            bestPositionKey = testPositionKey;
            console.log(`🔄 Better position found: ${testPositionKey} (issues: ${testIssuesCount})`);
          }
        }
      }
    }

    // 如果找到了更好的位置，返回它
    if (bestIssuesCount < Object.values(boundaryIssues).filter(Boolean).length) {
      console.log(`✅ Final best position: ${bestPositionKey} (issues: ${bestIssuesCount})`);
      return bestPosition;
    }

    // 如果所有位置都有问题，尝试强制居中
    console.log('⚠️ All positions have boundary issues, trying forced center');
    const forcedCenterLeft = Math.max(margin, (viewportWidth - this.containerWidth) / 2);
    const forcedCenterTop = Math.max(margin, (viewportHeight - this.containerHeight) / 2);
    
    const finalLeft = Math.min(forcedCenterLeft, viewportWidth - this.containerWidth - margin);
    const finalTop = Math.min(forcedCenterTop, viewportHeight - this.containerHeight - margin);
    
    console.log('✅ Forced center position:', { left: finalLeft, top: finalTop });
    return { left: finalLeft, top: finalTop };
  }

  calculatePosition(position: string, align: string) {
    const rootElement = this.ewColorPicker.getMountPoint("root");
    const colorBox = rootElement?.querySelector(
      ".ew-color-picker-box"
    ) as HTMLElement;

    if (!colorBox) {
      return { left: 0, top: 0 };
    }

    const boxWidth = colorBox.offsetWidth;
    const boxHeight = colorBox.offsetHeight;

    let left = 0;
    let top = 0;

    switch (position) {
      case "top":
        top = -this.containerHeight - boxHeight / 2;
        if (align === "start") {
          left = -this.containerWidth;
        } else if (align === "end") {
          left = boxWidth;
        } else {
          left = -this.containerWidth / 2 + boxWidth / 2;
        }
        break;

      case "bottom":
        top = boxHeight;
        if (align === "start") {
          left = -this.containerWidth;
        } else if (align === "end") {
          left = boxWidth;
        } else {
          left = -this.containerWidth / 2;
        }
        break;

      case "left":
        left = -this.containerWidth - 5;
        if (align === "start") {
          top = -this.containerHeight - boxHeight / 2;
        } else if (align === "end") {
          top = boxHeight;
        } else {
          top = -this.containerHeight / 2;
        }
        break;

      case "right":
        left = boxWidth + 5;
        if (align === "start") {
          top = -this.containerHeight - boxHeight / 2;
        } else if (align === "end") {
          top = boxHeight;
    } else {
          top = -this.containerHeight / 2;
        }
        break;
    }
    
    return { left, top };
  }

  destroy() {
    // 清理事件监听器
    if (this.panel) {
      off(this.panel, "click", this.handlePanelClick as EventListener);
      off(this.panel, "mousedown", this.handlePanelMouseDown as EventListener);
    }
  }
}

declare module "@ew-color-picker/panel" {
  interface CustomOptions {
    ewColorPickerPanel: PanelOptions;
  }
} 
