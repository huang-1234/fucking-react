import React from 'react';
import styles from './index.module.less';
const PageContainer = (props: { children: React.ReactNode }) => {
  return (
    <div className={styles.pageContainer}>
      {props.children}
    </div>
  )
}

export default React.memo(PageContainer)