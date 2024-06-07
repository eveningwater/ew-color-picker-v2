type ConsoleKey = keyof Pick<Console, 'warn' | 'error' | 'log'>;
const assertLists: ConsoleKey[] = ['warn', 'error', 'log'];
type AssertRes = {
    [k in ConsoleKey]: <T>(...v: T[]) => void;
};
export const assert: Partial<AssertRes> = {};
assertLists.forEach(key => assert[key] = <T>(...v: T[]) => console[key](...v))
export default assert as Required<typeof assert>;