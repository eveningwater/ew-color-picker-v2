export const BOX_TEMPLATE = (children: string, style?: string) =>
  `<div class="ew-color-picker-box" ${style ? `style="${style}"` : ""
  }>${children}</div>`;
export const PANEL_TEMPLATE = `<div class="ew-color-picker-panel">
  <div class="ew-color-picker-panel-content">
      <div class="ew-color-picker-inner-panel" style="background:red;">
          <div class="ew-color-picker-white-panel"></div>
          <div class="ew-color-picker-black-panel"></div>
          <div class="ew-color-picker-cursor"></div>
      </div>
  </div>
</div>`;
export const CORE_TEMPLATE = `<div class="ew-color-picker"></div>`;