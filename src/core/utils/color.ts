import util from "@ew-color-picker/utils";
/**
 * hex to rgba
 * @param {*} hex
 * @param {*} alpha
 */
export function colorHexToRgba(hex: string, alpha: number): string {
  let a = alpha || 1,
    colorRegExp = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
    hColor = hex.toLowerCase(),
    hLen = hex.length,
    rgbaColor: number[] = [];
  if (hex && colorRegExp.test(hColor)) {
    //the hex length may be 4 or 7,contained the symbol of #
    if (hLen === 4) {
      let hSixColor = "#";
      for (let i = 1; i < hLen; i++) {
        let sColor = hColor.slice(i, i + 1);
        hSixColor += sColor.concat(sColor);
      }
      hColor = hSixColor;
    }
    for (let j = 1, len = hColor.length; j < len; j += 2) {
      rgbaColor.push(parseInt("0X" + hColor.slice(j, j + 2), 16));
    }
    return "rgba(" + rgbaColor.join(",") + "," + a + ")";
  } else {
    return hColor;
  }
}
/**
 * rgba to hex
 * @param {*} rgba
 */
export function colorRgbaToHex(rgba: string): void | string {
  const hexObject = { 10: "A", 11: "B", 12: "C", 13: "D", 14: "E", 15: "F" },
    hexColor = function (value) {
      value = Math.min(Math.round(value), 255);
      const high = Math.floor(value / 16),
        low = value % 16;
      return "" + (hexObject[high] || high) + (hexObject[low] || low);
    };
  const value = "#";
  if (/rgba?/.test(rgba)) {
    let values = rgba
        .replace(/rgba?\(/, "")
        .replace(/\)/, "")
        .replace(/[\s+]/g, "")
        .split(","),
      color = "";
    values.map(function (value, index) {
      if (index <= 2) {
        color += hexColor(value);
      }
    });
    return value + color;
  }
}

/**
 * hsb to rgba
 * @param {*} hsb
 * @param {*} alpha
 */
export function colorHsbToRgba(hsb: HsbType, alpha: number): string {
  let r,
    g,
    b,
    a = hsb.a; //rgba(r,g,b,a)
  let h = Math.round(hsb.h),
    s = Math.round((hsb.s * 255) / 100),
    v = Math.round((hsb.b * 255) / 100); //hsv(h,s,v)
  if (s === 0) {
    r = g = b = v;
  } else {
    let t = v,
      p = ((255 - s) * v) / 255,
      q = ((t - p) * (h % 60)) / 60;
    if (h === 360) {
      r = t;
      g = b = 0;
    } else if (h < 60) {
      r = t;
      g = p + q;
      b = p;
    } else if (h < 120) {
      r = t - q;
      g = t;
      b = p;
    } else if (h < 180) {
      r = p;
      g = t;
      b = p + q;
    } else if (h < 240) {
      r = p;
      g = t - q;
      b = t;
    } else if (h < 300) {
      r = p + q;
      g = p;
      b = t;
    } else if (h < 360) {
      r = t;
      g = p;
      b = t - q;
    } else {
      r = g = b = 0;
    }
  }
  if (alpha >= 0 || alpha <= 1) a = alpha;
  return (
    "rgba(" +
    Math.round(r) +
    "," +
    Math.round(g) +
    "," +
    Math.round(b) +
    "," +
    a +
    ")"
  );
}
/**
 * rgba to hsb
 * @param {*} rgba
 */
export function colorRgbaToHsb(rgba: string): HsbType {
  const rgbaArr = rgba
    .slice(rgba.indexOf("(") + 1, rgba.lastIndexOf(")"))
    .split(",");
  let a = rgbaArr.length < 4 ? 1 : Number(rgbaArr[3]);
  let r = Number(rgbaArr[0]) / 255,
    g = Number(rgbaArr[1]) / 255,
    b = Number(rgbaArr[2]) / 255;
  let h: number, s: number, v: number;
  let min = Math.min(r, g, b);
  let max = (v = Math.max(r, g, b));
  let diff = max - min;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = 2.0 + (b - r) / diff;
        break;
      case b:
        h = 4.0 + (r - g) / diff;
        break;
    }
    // @ts-ignore
    h = Math.round(h * 60);
  }

  if (max === 0) {
    s = 0;
  } else {
    s = 1 - min / max;
  }
  s = Math.round(s * 100);
  v = Math.round(v * 100);
  return {
    h: h,
    s: s,
    b: v,
    a: a,
  };
}
/*
 * 任意色值（甚至是CSS颜色关键字）转换为RGBA颜色的方法
 * 此方法IE9+浏览器支持，基于DOM特性实现
 * @param {*} color
 */
export function colorToRgba(color: string): string {
  const div = util.create("div");
  div.style.backgroundColor = color;
  document.body.appendChild(div);
  const c = util.getStyle(div, "backgroundColor") as string;
  document.body.removeChild(div);
  return c.slice(0, 2) + "ba" + c.slice(3, c.length - 1) + ", 1)";
}
/**
 * 判断是否是合格的颜色值
 * @param {*} color
 */
export function isValidColor(color: string): boolean {
  let type: string = "";
  if (/^rgb\(/.test(color)) {
    //如果是rgb开头，200-249，250-255，0-199
    type =
      "^[rR][gG][Bb][(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){2}[\\s]*(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)[\\s]*[)]{1}$";
  } else if (/^rgba\(/.test(color)) {
    //如果是rgba开头，判断0-255:200-249，250-255，0-199 判断0-1：0 1 1.0 0.0-0.9
    type =
      "^[rR][gG][Bb][Aa][(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){3}[\\s]*(1|1.0|0|0.[0-9]{2})[\\s]*[)]{1}$";
  } else if (/^#/.test(color)) {
    //六位或者三位
    type = "^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$";
  } else if (/^hsl\(/.test(color)) {
    //判断0-360 判断0-100%(0可以没有百分号)
    type =
      "^[hH][Ss][Ll][(]([\\s]*(2[0-9][0-9]|360｜3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*)[)]$";
  } else if (/^hsla\(/.test(color)) {
    type =
      "^[hH][Ss][Ll][Aa][(]([\\s]*(2[0-9][0-9]|360｜3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,){2}([\\s]*(1|1.0|0|0.[0-9])[\\s]*)[)]$";
  }
  return !!color.match(new RegExp(type));
}
