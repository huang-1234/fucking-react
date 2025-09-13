import React from 'react';

interface DemoBlockProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const DemoBlock: React.FC<DemoBlockProps> = ({
  children,
  title,
  description
}) => {
  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '24px'
      }}
    >
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {description && <p>{description}</p>}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DemoBlock;
