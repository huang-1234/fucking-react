declare module 'react-rnd' {
  import * as React from 'react';

  export interface RndDragCallback {
    (e: React.DragEvent<HTMLElement>, d: { x: number; y: number; lastX: number; lastY: number; deltaX: number; deltaY: number }): void;
  }

  export interface RndResizeCallback {
    (e: React.SyntheticEvent, dir: string, ref: HTMLElement, delta: { width: number; height: number }, position: { x: number; y: number }): void;
  }

  export interface RndProps {
    default?: {
      x?: number;
      y?: number;
      width?: number | string;
      height?: number | string;
    };
    size?: {
      width: number | string;
      height: number | string;
    };
    position?: {
      x: number;
      y: number;
    };
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    lockAspectRatio?: boolean;
    lockAspectRatioExtraWidth?: number;
    lockAspectRatioExtraHeight?: number;
    enableResizing?: {
      top?: boolean;
      right?: boolean;
      bottom?: boolean;
      left?: boolean;
      topRight?: boolean;
      bottomRight?: boolean;
      bottomLeft?: boolean;
      topLeft?: boolean;
    };
    disableDragging?: boolean;
    dragHandleClassName?: string;
    dragAxis?: 'x' | 'y' | 'both' | 'none';
    bounds?: string;
    resizeHandleStyles?: {
      top?: React.CSSProperties;
      right?: React.CSSProperties;
      bottom?: React.CSSProperties;
      left?: React.CSSProperties;
      topRight?: React.CSSProperties;
      bottomRight?: React.CSSProperties;
      bottomLeft?: React.CSSProperties;
      topLeft?: React.CSSProperties;
    };
    resizeHandleClasses?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
      topRight?: string;
      bottomRight?: string;
      bottomLeft?: string;
      topLeft?: string;
    };
    style?: React.CSSProperties;
    className?: string;
    onDragStart?: RndDragCallback;
    onDrag?: RndDragCallback;
    onDragStop?: RndDragCallback;
    onResizeStart?: RndResizeCallback;
    onResize?: RndResizeCallback;
    onResizeStop?: RndResizeCallback;
    children?: React.ReactNode;
    cancel?: string;
    scale?: number;
  }

  export class Rnd extends React.Component<RndProps> {}
}