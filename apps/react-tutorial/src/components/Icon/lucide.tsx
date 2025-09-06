import type { ForwardRefExoticComponent } from 'react';

interface WrapLucideIconProps {
  Icon: ForwardRefExoticComponent<any>;
  options?: {
    color?: string;
    size?: number;
  };
}

export function WlIcon({ Icon, options }: WrapLucideIconProps) {
  const { color = 'currentColor', size = 14, ...rest } = options || {};
  return (
    <Icon
      size={size}
      color={color}
      {...rest}
    />
  );
}