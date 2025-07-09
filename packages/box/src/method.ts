import { isNumber, isShallowObject } from "@ew-color-picker/utils";
import { arrowIcon, closeIcon } from "@ew-color-picker/icon";
import { PartialBoxProps } from "./type";

// 预设尺寸映射常量
export const SIZE_MAP: Record<string, string> = {
  'mini': '20px',
  'small': '24px', 
  'normal': '32px',
  'medium': '36px',
  'large': '40px'
};

// 图标尺寸映射常量
export const ICON_SIZE_MAP: Record<string, number> = {
  'mini': 12,   // 20px * 0.6
  'small': 14,  // 24px * 0.58
  'normal': 16, // 32px * 0.5
  'medium': 18, // 36px * 0.5
  'large': 20   // 40px * 0.5
};

export const getBoxChildren = (hasColor: boolean, options: PartialBoxProps & { size?: any }) => {
  const { boxNoColorIcon = "", boxHasColorIcon = "", size } = options;
  
  // 计算图标大小
  const iconSize = calculateIconSize(size);
  
  return hasColor
    ? boxHasColorIcon || arrowIcon("ew-color-picker-box-arrow-icon", iconSize)
    : boxNoColorIcon || closeIcon("ew-color-picker-box-close-icon", iconSize);
};

export const normalizeSize = (v: string | number): number => {
  if (isNumber(v)) {
    return v as number;
  }
  const parsed = parseInt(`${v}`);
  return isNaN(parsed) ? 32 : parsed; // 如果解析失败，返回默认值
};

// 根据 size 配置计算图标大小
export const calculateIconSize = (size?: any): number => {
  if (!size) {
    return 16; // 默认图标大小
  }
  
  if (isShallowObject(size)) {
    // 对象形式：取较小的尺寸作为图标大小
    const width = normalizeSize(size.width ?? 32);
    const height = normalizeSize(size.height ?? 32);
    return Math.min(width, height) * 0.5; // 图标大小为盒子尺寸的 50%
  } else if (isNumber(size)) {
    // 数字形式
    return size * 0.5;
  } else if (typeof size === 'string') {
    // 字符串形式：预设尺寸映射
    return ICON_SIZE_MAP[size] || 16;
  }
  
  return 16; // 默认图标大小
};

// 处理尺寸配置，返回样式对象
export const processSizeConfig = (size?: any): { width?: string; height?: string; lineHeight?: string } => {
  if (!size) {
    return {}; // 无尺寸配置，使用默认样式
  }
  
  if (isShallowObject(size)) {
    // 对象形式：{ width: '50px', height: '30px' }
    const width = size.width ? (isNumber(size.width) ? `${size.width}px` : size.width) : undefined;
    const height = size.height ? (isNumber(size.height) ? `${size.height}px` : size.height) : undefined;
    return { width, height, lineHeight: height };
  } else if (size) {
    // 字符串或数字形式
    let val: string;
    if (isNumber(size)) {
      val = `${size}px`;
    } else if (typeof size === 'string') {
      val = SIZE_MAP[size] || size;
    } else {
      val = '32px'; // 默认尺寸
    }
    return { width: val, height: val, lineHeight: val };
  }
  
  return {};
};
