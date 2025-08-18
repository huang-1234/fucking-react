/* cspell:disable */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * 通用按钮组件
 * @component
 * @example
 * ```jsx
 * <Button type="primary" size="large" onClick={handleClick}>
 *   提交
 * </Button>
 * ```
 */

export interface ButtonProps {
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为圆角按钮 */
  round?: boolean;
  /** 图标类名 */
  icon?: string;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
  /** 点击事件处理函数 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button({
  size,
  type,
  disabled,
  round,
  icon,
  loading,
  children,
  onClick
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`
        kwai-button
        kwai-button--${size}
        kwai-button--${type}
        ${round ? 'is-round' : ''}
        ${disabled ? 'is-disabled' : ''}
        ${loading ? 'is-loading' : ''}
      `.trim().replace(/\s+/g, ' ')}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading && <span className="loading-icon">Loading...</span>}
      {icon && !loading && <span className={`icon ${icon}`}></span>}
      <span>{children}</span>
    </button>
  );
}

// @ts-ignore - PropTypes are used for props-to-schema extraction
Button.propTypes = {
  /** 按钮尺寸 */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** 按钮类型 */
  type: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
  /** 是否禁用 */
  disabled: PropTypes.bool,
  /** 是否为圆角按钮 */
  round: PropTypes.bool,
  /** 图标类名 */
  icon: PropTypes.string,
  /** 是否显示加载状态 */
  loading: PropTypes.bool,
  /** 子元素 */
  children: PropTypes.node,
  /** 点击事件处理函数 */
  onClick: PropTypes.func
};

Button.defaultProps = {
  size: 'medium',
  type: 'default',
  disabled: false,
  round: false,
  icon: '',
  loading: false
};

export default Button;