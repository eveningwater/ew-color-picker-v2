type ConsoleKey = keyof Pick<Console, 'warn' | 'error' | 'log'>;
const assertLists: ConsoleKey[] = ['warn', 'error', 'log'];

// 样式配置
const STYLES = {
  log: {
    icon: '📝',
    color: '#4CAF50',
    bgColor: '#E8F5E8',
    borderColor: '#4CAF50'
  },
  warn: {
    icon: '⚠️',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    borderColor: '#FF9800'
  },
  error: {
    icon: '❌',
    color: '#F44336',
    bgColor: '#FFEBEE',
    borderColor: '#F44336'
  }
} as const;

// 格式化消息
const formatMessage = (type: ConsoleKey, ...args: any[]): string[] => {
  const style = STYLES[type];
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `${style.icon} [ewColorPicker ${type.toUpperCase()}] ${timestamp}`;
  
  return [
    `%c${prefix}`,
    `color: ${style.color}; background: ${style.bgColor}; padding: 2px 6px; border-radius: 4px; border-left: 3px solid ${style.borderColor}; font-weight: bold;`,
    ...args
  ];
};

type AssertRes = {
    [k in ConsoleKey]: <T>(...v: T[]) => void;
};

const noop = () => { };

const assert: AssertRes = {
    log: noop,
    warn: noop,
    error: noop
};

// 为每个方法添加样式
assertLists.forEach(key => {
  assert[key] = <T>(...v: T[]) => {
    const formattedArgs = formatMessage(key, ...v);
    console[key](...formattedArgs);
  };
});

export const warn = assert.warn;
export const error = assert.error;
export const log = assert.log;