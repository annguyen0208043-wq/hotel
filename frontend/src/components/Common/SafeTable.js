import React from 'react';
import { Table as AntTable, Empty, Spin } from 'antd';

const SafeTable = ({ dataSource, columns, loading, ...props }) => {
  // Always call hooks first, before any conditional returns
  const safeDataSource = React.useMemo(() => {
    if (!dataSource) return [];
    if (!Array.isArray(dataSource)) return [];
    
    // Filter out invalid items and ensure each has required properties
    const validData = dataSource.filter(item => item && typeof item === 'object');
    
    return validData.map((item, index) => {
      // Create a safe copy with guaranteed key
      return {
        ...item,
        key: item.key || item.id || item.booking_id || `safe-row-${index}`
      };
    });
  }, [dataSource]);
  
  // Ensure columns is always a valid array
  const safeColumns = React.useMemo(() => {
    if (!columns) return [];
    if (!Array.isArray(columns)) return [];
    return columns.filter(col => col && typeof col === 'object' && (col.dataIndex || col.key || col.render));
  }, [columns]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // If no valid columns, show error message
  if (!safeColumns.length) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Cấu hình bảng không hợp lệ" />
      </div>
    );
  }

  // If no data, show empty state
  if (!safeDataSource.length) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Không có dữ liệu" />
      </div>
    );
  }

  // Render the table with error boundary
  try {
    return (
      <AntTable
        {...props}
        dataSource={safeDataSource}
        columns={safeColumns}
        rowKey={(record) => record.key || record.id || record.booking_id || Math.random().toString(36)}
      />
    );
  } catch (error) {
    console.error('Table render error:', error);
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Lỗi hiển thị dữ liệu" />
      </div>
    );
  }
};

export default SafeTable;