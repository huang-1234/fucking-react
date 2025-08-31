import React from 'react';
import { Button, Flex, Splitter, Switch } from 'antd';
import styles from './WrapSplitter.module.less';
import classNames from 'classnames';
const Block = (props: any) => (
  <Flex justify="center" align="center" style={{ height: '100%' }}>
    {props.children}
  </Flex>
);
type ISizes = [number, number] | [string, string];
interface WrapSplitterProps {
  defaultSizes: ISizes;
  defaultEnabled: boolean;
  onResize: (sizes: ISizes) => void;
  onReset: () => void;
  header: React.ReactElement;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelClassName?: string;
  rightPanelClassName?: string;
  className?: string;
  style?: React.CSSProperties;
}
const WrapSplitter = (props: WrapSplitterProps) => {
  const { defaultSizes = ['50%', '50%'], defaultEnabled = true, onResize, onReset, leftPanel, rightPanel, header, className } = props || {};
  const [sizes, setSizes] = React.useState(defaultSizes);
  const [enabled, setEnabled] = React.useState(defaultEnabled);
  const handleResize = (sizes: number[]) => {
    setSizes(sizes as ISizes);
    onResize(sizes as ISizes);
  };
  return (
    <Flex vertical gap="middle" className={classNames(styles.wrapSplitter, props.className)}>
      {header ? header : null}
      <Splitter
        onResize={handleResize}
        style={{  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Splitter.Panel size={sizes[0]} resizable={enabled}>
          <Block className={classNames(styles.panel, props.leftPanelClassName)}>{leftPanel}</Block>
        </Splitter.Panel>
        <Splitter.Panel size={sizes[1]}>
          <Block className={classNames(styles.panel, props.rightPanelClassName)}>{rightPanel}</Block>
        </Splitter.Panel>
      </Splitter>
      <Flex gap="middle" justify="space-between">
        <Switch
          value={enabled}
          onChange={() => setEnabled(!enabled)}
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
        />
        <Button onClick={() => setSizes([50, 50])}>Reset</Button>
      </Flex>
    </Flex>
  );
};
export default React.memo(WrapSplitter);