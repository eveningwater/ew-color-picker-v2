import { _hasOwn } from "./const";

export type Value = boolean | string | number | undefined | null | Symbol;
export type Mapping = Record<string, unknown>;
export interface ArgumentArray extends Array<Argument> {}
export type Argument = Mapping | ArgumentArray;
export const classnames = (...args: ArgumentArray) => {
  const classes: string[] = [];
  for (let i = 0, len = args.length; i < len; i++) {
    const arg = args[i];
    if (!arg) {
      continue;
    }
    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const __class = classnames.apply(null, arg);
        if (__class) {
          classes.push(__class);
        }
      }
    } else if (typeof arg === "object") {
      if (arg.toString === Object.prototype.toString) {
        for (let key in arg) {
          if (_hasOwn.call(arg, key) && arg[key]) {
            classes.push(key);
          }
        }
      } else {
        classes.push(String(arg));
      }
    }
  }
  return classes.join(" ");
};
