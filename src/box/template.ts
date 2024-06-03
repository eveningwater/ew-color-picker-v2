export const BOX_TEMPLATE = (children: string, style?: string) =>
  `<div class="ew-color-picker-box" ${
    style ?? `style="${style}"`
  }>${children}</div>`;
