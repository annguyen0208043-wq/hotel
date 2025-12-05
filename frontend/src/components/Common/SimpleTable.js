import React from 'react';
import { Empty, Spin, Button, Space, Tag } from 'antd';
import './SimpleTable.css';

const SimpleTable = ({ 
  columns = [], 
  dataSource = [], 
  loading = false, 
  rowKey = 'id',
  pagination = {},
  ...props 
}) => {
  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Ensure we have valid data
  const safeData = Array.isArray(dataSource) ? dataSource : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  if (safeColumns.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Không có cột dữ liệu" />
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Không có dữ liệu" />
      </div>
    );
  }

  const getRowKey = (record, index) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || record.id || index;
  };

  const renderCell = (column, record, rowIndex) => {
    if (column.render) {
      return column.render(record[column.dataIndex], record, rowIndex);
    }
    
    if (column.dataIndex) {
      const value = record[column.dataIndex];
      if (value === null || value === undefined) {
        return 'N/A';
      }
      return String(value);
    }

    return 'N/A';
  };

  return (
    <div className="simple-table-container" style={{ border: '1px solid #f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Table Header */}
      <div className="simple-table-header" style={{ 
        display: 'flex', 
        backgroundColor: '#fafafa', 
        borderBottom: '1px solid #f0f0f0',
        fontWeight: 'bold'
      }}>
        {safeColumns.map((column, index) => (
          <div 
            key={column.key || column.dataIndex || index}
            style={{ 
              padding: '12px 16px',
              borderRight: index < safeColumns.length - 1 ? '1px solid #f0f0f0' : 'none',
              width: column.width || `${100 / safeColumns.length}%`,
              minWidth: column.width || '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {column.title}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className="simple-table-body">
        {safeData.map((record, rowIndex) => (
          <div 
            key={getRowKey(record, rowIndex)}
            className="simple-table-row"
            style={{ 
              display: 'flex',
              borderBottom: rowIndex < safeData.length - 1 ? '1px solid #f0f0f0' : 'none',
              backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#fafafa'
            }}
          >
            {safeColumns.map((column, columnIndex) => (
              <div 
                key={`${getRowKey(record, rowIndex)}-${column.key || column.dataIndex || columnIndex}`}
                style={{ 
                  padding: '12px 16px',
                  borderRight: columnIndex < safeColumns.length - 1 ? '1px solid #f0f0f0' : 'none',
                  width: column.width || `${100 / safeColumns.length}%`,
                  minWidth: column.width || '120px',
                  overflow: 'visible',
                  textOverflow: 'ellipsis',
                  whiteSpace: column.key === 'actions' ? 'normal' : 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: column.key === 'actions' ? 'wrap' : 'nowrap'
                }}
              >
                {renderCell(column, record, rowIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Simple Pagination */}
      {pagination && pagination.total > 0 && (
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0', 
          textAlign: 'right',
          backgroundColor: '#fafafa'
        }}>
          <span style={{ marginRight: '16px' }}>
            Tổng: {pagination.total} items
          </span>
          {pagination.showTotal && (
            <span>{pagination.showTotal(pagination.total, [1, pagination.total])}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleTable;