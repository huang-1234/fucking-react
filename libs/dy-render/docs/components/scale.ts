export enum scaleSize {
  xs = 1,
  sm = 2,
  md = 4,
  lg = 6,
  xl = 8,
}
export const paddingSize = {
  [scaleSize.xs]: '1px 2px',
  [scaleSize.sm]: '2px 4px',
  [scaleSize.md]: '4px 8px',
  [scaleSize.lg]: '6px 12px',
  [scaleSize.xl]: '8px 16px',
};
export const marginSize = {
  [scaleSize.xs]: '1px 2px',
  [scaleSize.sm]: '2px 4px',
  [scaleSize.md]: '4px 8px',
  [scaleSize.lg]: '6px 12px',
  [scaleSize.xl]: '8px 16px',
};
export const borderSize = {
  [scaleSize.xs]: scaleSize.xs * 2,
  [scaleSize.sm]: scaleSize.sm * 2,
  [scaleSize.md]: scaleSize.md * 2,
  [scaleSize.lg]: scaleSize.lg * 2,
  [scaleSize.xl]: scaleSize.xl * 2,
};
export const borderRadiusSize = {
  [scaleSize.xs]: scaleSize.xs * 2,
  [scaleSize.sm]: scaleSize.sm * 2,
  [scaleSize.md]: scaleSize.md * 2,
  [scaleSize.lg]: scaleSize.lg * 2,
  [scaleSize.xl]: scaleSize.xl * 2,
};
export const fontSize = {
  [scaleSize.xs]: 8 + scaleSize.xs * 2,
  [scaleSize.sm]: 8 + scaleSize.sm * 2,
  [scaleSize.md]: 8 + scaleSize.md * 2,
  [scaleSize.lg]: 8 + scaleSize.lg * 2,
  [scaleSize.xl]: 8 + scaleSize.xl * 2,
}


export const usePadding = (padding: scaleSize) => {
  return paddingSize[padding];
};
export const useMargin = (margin: scaleSize) => {
  return marginSize[margin];
};
export const useBorder = (border: scaleSize) => {
  return borderSize[border];
};
export const useBorderRadius = (borderRadius: scaleSize) => {
  return borderRadiusSize[borderRadius];
};
export const useFontSize = (fs: scaleSize) => {
  return fontSize[fs];
};
export const useScale = (scale: scaleSize) => {
  return {
    padding: usePadding(scale),
    margin: useMargin(scale),
    border: useBorder(scale),
    borderRadius: useBorderRadius(scale),
    fontSize: useFontSize(scale),
  }
};