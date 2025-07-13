// 测试 InputNumber 插件注册
const ewColorPicker = require('./packages/ew-color-picker/dist/index.js');

// 捕获控制台警告
const originalWarn = console.warn;
const warnings = [];
console.warn = function(...args) {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
};

console.log('开始测试 InputNumber 插件注册...');

// 测试 1: 检查插件是否已注册
console.log('检查 ewColorPickerInputNumber 插件是否已注册...');
if (ewColorPicker.pluginsMap['ewColorPickerInputNumber']) {
    console.log('✓ ewColorPickerInputNumber 插件已注册');
} else {
    console.log('✗ ewColorPickerInputNumber 插件未注册');
}

// 测试 2: 创建启用 color-mode 的颜色选择器
console.log('\n测试创建启用 color-mode 的颜色选择器...');
try {
    // 创建一个虚拟的 DOM 环境
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.window = dom.window;
    global.document = dom.window.document;
    
    const picker = new ewColorPicker({
        el: document.createElement('div'),
        defaultColor: '#ff0000',
        hasInput: true,
        openChangeColorMode: true
    });
    
    console.log('✓ 启用 color-mode 的颜色选择器创建成功');
    console.log('当前颜色:', picker.getColor());
} catch (error) {
    console.log('✗ 启用 color-mode 的颜色选择器创建失败:', error.message);
}

// 检查警告
setTimeout(() => {
    console.log('\n检查警告信息...');
    const inputNumberWarnings = warnings.filter(warning => 
        warning.includes('InputNumber') || warning.includes('ewColorPickerInputNumber')
    );
    
    if (inputNumberWarnings.length > 0) {
        console.log('✗ 发现 InputNumber 相关警告:');
        inputNumberWarnings.forEach(warning => console.log('  -', warning));
    } else {
        console.log('✓ 没有发现 InputNumber 相关的警告');
    }
    
    console.log('\n测试完成！');
}, 1000); 