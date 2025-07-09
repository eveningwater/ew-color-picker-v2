export * from "./assert";
export * from "./type";
export * from "./dom";
export * from "./env";
export * from "./base";

export * from "./enum";
export * from "./event";
export * from "./color";
export * from "./animation";

export function toStyleStr(style?: string | Record<string, string>): string {
  if (!style) return '';
  if (typeof style === 'string') return style;
  return Object.entries(style)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
    .join(';');
}
