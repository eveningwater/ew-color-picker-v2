import util from "@ew-color-picker/utils";

export interface PanelProps {
  container?: HTMLElement;
}
export default class Panel {
  options!: PanelProps;
  construtor(options: PanelProps) {
    this.options = util.ewAssign({}, options);
  }
  render() {}
}
