# EW Color Picker v2 - 插件架构版本

基于原版 ew-color-picker 重新设计的插件化架构版本，保持与原版完全一致的功能和样式，同时提供更好的模块化和扩展性。

## 🚀 特性

### 核心功能
- ✅ **完整的颜色选择功能** - 支持HSV颜色空间选择
- ✅ **多种颜色格式** - HEX、RGB、RGBA、HSL、HSLA、颜色关键字
- ✅ **丰富的交互方式** - 点击选择、拖拽改变、滑块调节
- ✅ **预定义颜色支持** - 快速选择常用颜色
- ✅ **透明度调节** - 支持透明度滑块
- ✅ **输入框支持** - 手动输入颜色值

### 插件架构
- ✅ **模块化设计** - 功能按插件拆分，按需加载
- ✅ **TypeScript支持** - 完整的类型定义
- ✅ **UMD构建** - 支持多种模块系统
- ✅ **事件系统** - 插件间通信机制
- ✅ **配置合并** - 灵活的配置管理

### 样式系统clear

- ✅ **原版样式还原** - 与原版完全一致的视觉效果
- ✅ **响应式设计** - 支持不同屏幕尺寸
- ✅ **主题支持** - 可自定义主题色
- ✅ **动画效果** - 流畅的交互动画

## 📦 包结构

```
packages/
├── core/           # 核心功能
├── utils/          # 工具函数
├── panel/          # 颜色面板交互
├── input/          # 输入框功能
├── button/         # 按钮功能
├── predefine/      # 预定义颜色
├── box/            # 颜色显示框
├── style/          # 样式系统
├── console/        # 控制台输出
├── icon/           # 图标系统
└── ewColorPicker/  # 主包
```

## 🛠️ 安装

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build:all

# 开发模式
pnpm run dev
```

## 📖 使用示例

### 基础使用

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="packages/style/dist/style.css">
</head>
<body>
    <div id="colorPicker"></div>
    
    <script src="packages/ewColorPicker/dist/index.js"></script>
    <script>
        const picker = new ewColorPicker({
            el: '#colorPicker',
            hasBox: true,
            hasPanel: true,
            hasInput: true,
            hasClear: true,
            hasSure: true,
            hue: true,
            alpha: true,
            predefineColor: ['#ff0000', '#00ff00', '#0000ff']
        });

        picker.on('change', function(color) {
            console.log('颜色改变:', color);
        });
    </script>
</body>
</html>
```

### 高级配置

```javascript
const picker = new ewColorPicker({
    el: '#colorPicker',
    // 基础配置
    hasBox: true,
    hasPanel: true,
    hasInput: true,
    hasClear: true,
    hasSure: true,
    
    // 滑块配置
    hue: true,
    alpha: true,
    hueDirection: 'vertical',    // vertical | horizontal
    alphaDirection: 'vertical',  // vertical | horizontal
    
    // 尺寸配置
    size: 'normal',              // normal | medium | small | mini
    // 或自定义尺寸
    // size: { width: '50px', height: '50px' },
    
    // 预定义颜色
    predefineColor: [
        '#ff0000', '#ff8000', '#ffff00', '#80ff00',
        '#00ff00', '#00ff80', '#00ffff', '#0080ff'
    ],
    
    // 按钮文本
    clearText: '清空',
    sureText: '确定',
    
    // 回调函数
    changeColor: function(color) {
        console.log('颜色改变:', color);
    },
    sure: function(color) {
        console.log('确定选择:', color);
    },
    clear: function() {
        console.log('清空颜色');
    }
});
```

## 🔧 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `el` | HTMLElement \| string | - | 挂载元素 |
| `hasBox` | boolean | true | 是否显示颜色框 |
| `hasPanel` | boolean | true | 是否显示颜色面板 |
| `hasInput` | boolean | true | 是否显示输入框 |
| `hasClear` | boolean | true | 是否显示清空按钮 |
| `hasSure` | boolean | true | 是否显示确定按钮 |
| `hue` | boolean | true | 是否显示色相滑块 |
| `alpha` | boolean | false | 是否显示透明度滑块 |
| `size` | string \| object | 'normal' | 尺寸配置 |
| `predefineColor` | string[] | [] | 预定义颜色 |
| `hueDirection` | string | 'vertical' | 色相滑块方向 |
| `alphaDirection` | string | 'vertical' | 透明度滑块方向 |
| `clearText` | string | '清空' | 清空按钮文本 |
| `sureText` | string | '确定' | 确定按钮文本 |
| `changeColor` | function | - | 颜色改变回调 |
| `sure` | function | - | 确定按钮回调 |
| `clear` | function | - | 清空按钮回调 |

## 🎯 事件系统

```javascript
// 监听颜色改变事件
picker.on('change', function(color) {
    console.log('颜色改变:', color);
});

// 监听确定事件
picker.on('sure', function(color) {
    console.log('确定选择:', color);
});

// 监听清空事件
picker.on('clear', function() {
    console.log('清空颜色');
});
```

## 🔌 插件开发

### 创建自定义插件

```typescript
import ewColorPicker from "@ew-color-picker/core";
import { ApplyOrder } from '@ew-color-picker/utils';

export default class CustomPlugin {
    static pluginName = "CustomPlugin";
    static applyOrder = ApplyOrder.Post;

    constructor(public ewColorPicker: ewColorPicker) {
        this.init();
    }

    init() {
        // 插件初始化逻辑
    }

    destroy() {
        // 插件销毁逻辑
    }
}
```

### 注册插件

```javascript
import Core from '@ew-color-picker/core';
import CustomPlugin from './CustomPlugin';

Core.use(CustomPlugin);
```

## 📋 开发计划

### ✅ 已完成
- [x] 插件架构设计
- [x] 核心功能模块
- [x] 样式系统还原
- [x] TypeScript类型定义
- [x] UMD构建支持
- [x] 基础交互功能
- [x] 预定义颜色支持
- [x] 输入框功能
- [x] 按钮功能
- [x] 事件系统

### 🚧 进行中
- [ ] 动画系统完善
- [ ] 移动端优化
- [ ] 性能优化
- [ ] 单元测试
- [ ] 文档完善

### 📅 计划中
- [ ] Vue组件封装
- [ ] React组件封装
- [ ] 主题系统
- [ ] 国际化支持
- [ ] 更多插件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License


---

**作者**: eveningwater(854806732@qq.com)  
**项目地址**: https://github.com/eveningwater/ew-color-picker-v2
