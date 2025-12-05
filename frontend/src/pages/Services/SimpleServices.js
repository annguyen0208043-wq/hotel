import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Spin, message } from 'antd';
import api from '../../services/api';

const { Title } = Typography;

const SimpleServices = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading data...');
      
      const categoriesRes = await api.get('/api/services/categories/');
      console.log('Categories response:', categoriesRes.data);
      setCategories(categoriesRes.data || []);
      
      const servicesRes = await api.get('/api/services/services/');
      console.log('Services response:', servicesRes.data);
      setServices(servicesRes.data || []);
      
      message.success('Tải dữ liệu thành công!');
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số dịch vụ',
      dataIndex: 'services_count',
      key: 'services_count',
    },
  ];

  const serviceColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Test Dịch vụ - Đơn giản</Title>
      
      {loading && <Spin size="large" />}
      
      <Card title={`Danh mục (${categories.length})`} style={{ marginBottom: '20px' }}>
        <Table
          dataSource={categories}
          columns={categoryColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Card title={`Dịch vụ (${services.length})`}>
        <Table
          dataSource={services}
          columns={serviceColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SimpleServices;