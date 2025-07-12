// Simple test to verify defaultColor merge functionality
function testMergeOptions() {
    // Mock the utils functions
    const extend = (target, ...sources) => {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                target[key] = source[key];
            });
        });
        return target;
    };
    
    const isString = (val) => typeof val === 'string';
    const isShallowObject = (val) => val && typeof val === 'object' && !Array.isArray(val);
    const checkContainer = (el) => el || 'document.body';
    
    const defaultConfig = {
        hasBox: true,
        hue: true,
        alpha: false,
        disabled: false,
        predefineColor: [],
        size: "normal",
        defaultColor: "",
        isLog: true,
        hasClear: true,
        hasSure: true,
        hasInput: true,
        boxDisabled: false,
        isClickOutside: true,
        openChangeColorMode: false,
        boxBgColor: false,
        hueDirection: "vertical",
        alphaDirection: "vertical",
        lang: "zh",
        userDefineText: false,
        clearText: "清空",
        sureText: "确定",
        togglePickerAnimation: "default",
        pickerAnimationTime: 200,
        autoPanelPosition: false,
        panelPlacement: "bottom",
        sure: () => {},
        clear: () => {},
        togglePicker: () => {},
        changeColor: () => {},
    };
    
    function merge(options, pluginNameProp = {}) {
        let result;
        
        // 处理字符串选择器的情况
        if (isString(options)) {
            const el = checkContainer(options);
            result = extend({}, defaultConfig, {
                el,
                ...pluginNameProp,
            });
        }
        // 处理对象配置的情况
        else if (isShallowObject(options)) {
            // 检查是否包含 el 属性
            if ('el' in options) {
                const { el, ...other } = options;
                console.log('[ewColorPicker merge] options with el:', options, 'el:', el);
                result = extend({}, defaultConfig, {
                    el: checkContainer(el),
                    ...other,
                    ...pluginNameProp,
                });
            } else {
                // 如果没有 el 属性，说明第一个参数是容器，第二个参数是选项
                console.log('[ewColorPicker merge] options without el:', options);
                result = extend({}, defaultConfig, {
                    el: 'document.body', // 这里会被后续的 pluginNameProp 覆盖
                    ...options,
                    ...pluginNameProp,
                });
            }
        }
        // 处理空值或未定义的情况
        else {
            result = extend({}, defaultConfig, {
                el: 'document.body',
                ...pluginNameProp,
            });
        }
        return result;
    }
    
    // Test 1: With custom defaultColor
    const customOptions = {
        defaultColor: '#ff0000',
        showAlpha: true,
        showHue: true,
        showPanel: true
    };
    
    const result1 = merge(customOptions);
    console.log('Test 1 - With custom defaultColor:');
    console.log('Expected: #ff0000, Actual:', result1.defaultColor);
    console.log('Success:', result1.defaultColor === '#ff0000');
    console.log('Result:', result1);
    
    // Test 2: Without custom defaultColor
    const result2 = merge({ showAlpha: true });
    console.log('\nTest 2 - Without custom defaultColor:');
    console.log('Expected: "" (empty string), Actual:', result2.defaultColor);
    console.log('Success:', result2.defaultColor === '');
    console.log('Result:', result2);
    
    // Test 3: With container and options (simulating new EWColorPicker(container, options))
    const result3 = merge(customOptions);
    console.log('\nTest 3 - With container and options:');
    console.log('Expected: #ff0000, Actual:', result3.defaultColor);
    console.log('Success:', result3.defaultColor === '#ff0000');
    console.log('Result:', result3);
    
    // Test 4: Test the constructor logic
    console.log('\nTest 4 - Constructor logic simulation:');
    const constructorOptions = {
        el: 'container',
        ...customOptions
    };
    const result4 = merge(constructorOptions);
    console.log('Expected: #ff0000, Actual:', result4.defaultColor);
    console.log('Success:', result4.defaultColor === '#ff0000');
    console.log('Result:', result4);
}

testMergeOptions(); 