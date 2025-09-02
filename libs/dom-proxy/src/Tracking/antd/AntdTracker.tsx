import React from 'react';
import { getTracker } from '../core/Tracker';
import type { IClickEvent, ITrackingEvent } from '../types/tracking';

/**
 * Antd组件埋点包装器
 * 为Antd组件添加埋点功能
 * @method wrapButton 包装Button组件
 * @method wrapModal 包装Modal组件
 * @method wrapTabs 包装Tabs组件
 * @method wrapForm 包装Form组件
 * @method wrapSelect 包装Select组件
 */
export class AntdTracker {
  /**
   * 包装Button组件
   * @param Button Antd Button组件
   * @returns 增强后的Button组件
   */
  static wrapButton(Button: any): any {
    const OriginalButton = Button;

    const WrappedButton = React.forwardRef((props: any, ref: any) => {
      const { onClick, ...restProps } = props;

      const handleClick = (e: React.MouseEvent) => {
        try {
          // 获取按钮文本
          let buttonText = '';
          if (typeof props.children === 'string') {
            buttonText = props.children;
          } else if (props['data-tracking-label']) {
            buttonText = props['data-tracking-label'];
          }

          // 跟踪点击事件
          const tracker = getTracker();
          tracker.track({
            eventType: 'click',
            eventCategory: 'antd-button',
            eventAction: 'click',
            eventLabel: buttonText || props.type || 'button',
            elementType: 'button',
            elementContent: buttonText,
            buttonType: props.type,
            buttonSize: props.size,
            buttonShape: props.shape,
            buttonDanger: props.danger,
            clickX: e.clientX,
            clickY: e.clientY,
          } as Partial<ITrackingEvent>);
        } catch (error) {
          console.error('[AntdTracker] Button 点击跟踪错误:', error);
        }

        // 调用原始onClick
        if (onClick) {
          onClick(e);
        }
      };

      return <OriginalButton {...restProps} ref={ref} onClick={handleClick} />;
    });

    // 复制静态属性
    Object.keys(OriginalButton).forEach(key => {
      (WrappedButton as any)[key] = (OriginalButton as any)[key];
    });

    return WrappedButton;
  }

  /**
   * 包装Modal组件
   * @param Modal Antd Modal组件
   * @returns 增强后的Modal组件
   */
  static wrapModal(Modal: any): any {
    const OriginalModal = Modal;

    class WrappedModal extends React.Component<any> {
      // 保存原始回调的引用
      private originalAfterClose: Function | null = null;

      componentDidMount() {
        if (this.props.visible || this.props.open) {
          this.trackModalEvent('open');
        }

        // 保存原始的 afterClose 回调，但不修改 props
        if (this.props.afterClose) {
          this.originalAfterClose = this.props.afterClose as Function;
        }
      }

      // 拦截 afterClose 调用
      handleAfterClose = () => {
        this.trackModalEvent('close');
        if (this.originalAfterClose) {
          this.originalAfterClose();
        }
      }

      componentDidUpdate(prevProps: any) {
        // 检测Modal显示状态变化
        const wasVisible = prevProps.visible || prevProps.open;
        const isVisible = this.props.visible || this.props.open;

        if (!wasVisible && isVisible) {
          this.trackModalEvent('open');
        } else if (wasVisible && !isVisible) {
          this.trackModalEvent('close');
        }
      }

      trackModalEvent(action: string) {
        try {
          const tracker = getTracker();
          tracker.track({
            eventType: 'modal',
            eventCategory: 'antd-modal',
            eventAction: action,
            eventLabel: this.props.title || 'modal',
            modalTitle: this.props.title,
            modalWidth: this.props.width,
          } as Partial<ITrackingEvent>);
        } catch (error) {
          console.error(`[AntdTracker] Modal ${action} 跟踪错误:`, error);
        }
      }

      render() {
        // 包装确认和取消按钮事件
        const { onOk, onCancel, ...restProps } = this.props;

        const wrappedOnOk = (e: React.MouseEvent) => {
          try {
            const tracker = getTracker();
            tracker.track({
              eventType: 'click',
              eventCategory: 'antd-modal',
              eventAction: 'confirm',
              eventLabel: this.props.title || 'modal-confirm',
              modalTitle: this.props.title,
            } as Partial<ITrackingEvent>);
          } catch (error) {
            console.error('[AntdTracker] Modal confirm 跟踪错误:', error);
          }

          if (onOk) {
            onOk(e);
          }
        };

        const wrappedOnCancel = (e: React.MouseEvent) => {
          try {
            const tracker = getTracker();
            tracker.track({
              eventType: 'click',
              eventCategory: 'antd-modal',
              eventAction: 'cancel',
              eventLabel: this.props.title || 'modal-cancel',
              modalTitle: this.props.title,
            } as Partial<ITrackingEvent>);
          } catch (error) {
            console.error('[AntdTracker] Modal cancel 跟踪错误:', error);
          }

          if (onCancel) {
            onCancel(e);
          }
        };

        return (
          <OriginalModal
            {...restProps}
            onOk={wrappedOnOk}
            onCancel={wrappedOnCancel}
            afterClose={this.handleAfterClose}
          />
        );
      }
    }

    // 复制静态方法
    Object.keys(OriginalModal).forEach(key => {
      if (typeof OriginalModal[key] === 'function') {
        // 对于静态方法，如 Modal.confirm
        (WrappedModal as any)[key as keyof typeof WrappedModal] = (...args: any[]) => {
          try {
            const config = args[0] || {};
            const title = config.title || 'modal-static';

            // 包装确认和取消回调
            if (config.onOk) {
              const originalOnOk = config.onOk;
              config.onOk = (...cbArgs: any[]) => {
                try {
                  const tracker = getTracker();
                  tracker.track({
                    eventType: 'click',
                    eventCategory: 'antd-modal',
                    eventAction: 'confirm',
                    eventLabel: title,
                    modalType: key,
                  } as Partial<ITrackingEvent>);
                } catch (error) {
                  console.error(`[AntdTracker] Modal.${key} confirm 跟踪错误:`, error);
                }

                return originalOnOk(...cbArgs);
              };
            }

            if (config.onCancel) {
              const originalOnCancel = config.onCancel;
              config.onCancel = (...cbArgs: any[]) => {
                try {
                  const tracker = getTracker();
                  tracker.track({
                    eventType: 'click',
                    eventCategory: 'antd-modal',
                    eventAction: 'cancel',
                    eventLabel: title,
                    modalType: key,
                  } as Partial<ITrackingEvent>);
                } catch (error) {
                  console.error(`[AntdTracker] Modal.${key} cancel 跟踪错误:`, error);
                }

                return originalOnCancel(...cbArgs);
              };
            }

            // 跟踪打开事件
            try {
              const tracker = getTracker();
              tracker.track({
                eventType: 'modal',
                eventCategory: 'antd-modal',
                eventAction: 'open',
                eventLabel: title,
                modalType: key,
              } as Partial<ITrackingEvent>);
            } catch (error) {
              console.error(`[AntdTracker] Modal.${key} open 跟踪错误:`, error);
            }

            return OriginalModal[key](...args);
          } catch (error) {
            console.error(`[AntdTracker] Modal.${key} 跟踪错误:`, error);
            return OriginalModal[key](...args);
          }
        };
      } else {
        // 使用类型断言来处理索引签名
        (WrappedModal as any)[key] = (OriginalModal as any)[key];
      }
    });

    return WrappedModal;
  }

  /**
   * 包装Tabs组件
   * @param Tabs Antd Tabs组件
   * @returns 增强后的Tabs组件
   */
  static wrapTabs(Tabs: any): any {
    const OriginalTabs = Tabs;

    const WrappedTabs = React.forwardRef((props: any, ref: any) => {
      const { onChange, ...restProps } = props;

      const handleChange = (activeKey: string, ...rest: any[]) => {
        try {
          // 获取当前激活的Tab标题
          let tabTitle = activeKey;
          if (props.items) {
            const activeItem = props.items.find((item: any) => item.key === activeKey);
            if (activeItem) {
              tabTitle = activeItem.label || activeKey;
            }
          }

          // 跟踪切换事件
          const tracker = getTracker();
          tracker.track({
            eventType: 'tab',
            eventCategory: 'antd-tabs',
            eventAction: 'change',
            eventLabel: tabTitle,
            tabKey: activeKey,
            tabPosition: props.tabPosition,
            tabType: props.type,
          } as Partial<ITrackingEvent>);
        } catch (error) {
          console.error('[AntdTracker] Tabs 切换跟踪错误:', error);
        }

        // 调用原始onChange
        if (onChange) {
          onChange(activeKey, ...rest);
        }
      };

      return <OriginalTabs {...restProps} ref={ref} onChange={handleChange} />;
    });

    // 复制静态属性
    Object.keys(OriginalTabs).forEach(key => {
      (WrappedTabs as any)[key] = (OriginalTabs as any)[key];
    });

    return WrappedTabs;
  }

  /**
   * 包装Form组件
   * @param Form Antd Form组件
   * @returns 增强后的Form组件
   */
  static wrapForm(Form: any): any {
    const OriginalForm = Form;

    const WrappedForm = React.forwardRef((props: any, ref: any) => {
      const { onFinish, onFinishFailed, ...restProps } = props;

      const handleFinish = (values: any) => {
        try {
          // 跟踪表单提交成功事件
          const tracker = getTracker();

          // 过滤掉敏感信息
          const safeValues = Object.entries(values).reduce((acc, [key, value]) => {
            // 排除密码等敏感字段
            if (!key.match(/password|creditcard|card|cvv|ssn|secret/i)) {
              acc[key] = typeof value === 'string' ? value : '[complex value]';
            } else {
              acc[key] = '[masked]';
            }
            return acc;
          }, {} as Record<string, string>);

          tracker.track({
            eventType: 'form',
            eventCategory: 'antd-form',
            eventAction: 'submit-success',
            eventLabel: props.name || 'form-submit',
            formName: props.name,
            formLayout: props.layout,
            formFields: Object.keys(values).length,
            formValues: safeValues,
          } as Partial<ITrackingEvent>);
        } catch (error) {
          console.error('[AntdTracker] Form 提交跟踪错误:', error);
        }

        // 调用原始onFinish
        if (onFinish) {
          onFinish(values);
        }
      };

      const handleFinishFailed = (errorInfo: any) => {
        try {
          // 跟踪表单提交失败事件
          const tracker = getTracker();
          tracker.track({
            eventType: 'form',
            eventCategory: 'antd-form',
            eventAction: 'submit-failed',
            eventLabel: props.name || 'form-error',
            formName: props.name,
            formLayout: props.layout,
            errorFields: errorInfo.errorFields?.length,
            errorMessages: errorInfo.errorFields?.map((field: any) =>
              `${field.name.join('.')}: ${field.errors.join(', ')}`
            ),
          } as Partial<ITrackingEvent>);
        } catch (error) {
          console.error('[AntdTracker] Form 错误跟踪错误:', error);
        }

        // 调用原始onFinishFailed
        if (onFinishFailed) {
          onFinishFailed(errorInfo);
        }
      };

      return (
        <OriginalForm
          {...restProps}
          ref={ref}
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
        />
      );
    });

    // 复制静态属性和方法
    Object.keys(OriginalForm).forEach(key => {
      (WrappedForm as any)[key] = (OriginalForm as any)[key];
    });

    return WrappedForm;
  }

  /**
   * 包装Select组件
   * @param Select Antd Select组件
   * @returns 增强后的Select组件
   */
  static wrapSelect(Select: any): any {
    const OriginalSelect = Select;

    const WrappedSelect = React.forwardRef((props: any, ref: any) => {
      const { onChange, ...restProps } = props;

      const handleChange = (value: any, option: any) => {
        try {
          // 获取选项标签
          let optionLabel: string;
          if (Array.isArray(option)) {
            optionLabel = option.map((opt: any) => opt?.label || opt?.children || '').join(', ');
          } else {
            optionLabel = option?.label || option?.children || String(value);
          }

          // 跟踪选择事件
          const tracker = getTracker();
          tracker.track({
            eventType: 'select',
            eventCategory: 'antd-select',
            eventAction: 'change',
            eventLabel: optionLabel,
            selectValue: Array.isArray(value) ? value.join(', ') : String(value),
            selectMode: props.mode,
            selectPlaceholder: props.placeholder,
            isMultiple: !!props.mode && ['multiple', 'tags'].includes(props.mode),
          } as Partial<ITrackingEvent>);
        } catch (error) {
          console.error('[AntdTracker] Select 选择跟踪错误:', error);
        }

        // 调用原始onChange
        if (onChange) {
          onChange(value, option);
        }
      };

      return <OriginalSelect {...restProps} ref={ref} onChange={handleChange} />;
    });

    // 复制静态属性
    Object.keys(OriginalSelect).forEach(key => {
      (WrappedSelect as any)[key] = (OriginalSelect as any)[key];
    });

    return WrappedSelect;
  }
}
