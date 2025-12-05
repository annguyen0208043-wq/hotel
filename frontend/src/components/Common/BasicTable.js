import React from 'react';
import { Empty, Spin } from 'antd';

const BasicTable = ({ dataSource = [], columns = [], loading = false, pagination, ...props }) => {
  // Show loading
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Validate inputs
  const safeData = Array.isArray(dataSource) ? dataSource : [];
  const safeCols = Array.isArray(columns) ? columns : [];

  if (!safeCols.length || !safeData.length) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Không có dữ liệu" />
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
        <thead>
          <tr style={{ backgroundColor: '#fafafa' }}>
            {safeCols.map((col, index) => (
              <th 
                key={col.key || col.dataIndex || index}
                style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  border: '1px solid #f0f0f0',
                  fontWeight: 'bold'
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.map((record, rowIndex) => (
            <tr key={record.id || record.key || rowIndex} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {safeCols.map((col, colIndex) => (
                <td 
                  key={col.key || col.dataIndex || colIndex}
                  style={{ 
                    padding: '12px 16px', 
                    border: '1px solid #f0f0f0'
                  }}
                >
                  {col.render 
                    ? col.render(record[col.dataIndex], record, rowIndex)
                    : record[col.dataIndex] || '-'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Simple pagination info */}
      {pagination && safeData.length > 0 && (
        <div style={{ 
          padding: '16px', 
          textAlign: 'right', 
          borderTop: '1px solid #f0f0f0' 
        }}>
          Tổng: {safeData.length} bản ghi
        </div>
      )}
    </div>
  );
};

export default BasicTable;