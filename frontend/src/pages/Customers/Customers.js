import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { customerService } from '../../services';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const Customers = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery('customers', customerService.getAll);

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'customer_id',
      key: 'customer_id',
    },
    {
      title: 'Họ tên',
      key: 'full_name',
      render: (_, record) => record.full_name,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'CMND/CCCD',
      dataIndex: 'id_card_number',
      key: 'id_card_number',
    },
    {
      title: 'VIP',
      dataIndex: 'is_vip',
      key: 'is_vip',
      render: (isVip) => (
        <Tag color={isVip ? 'gold' : 'default'}>
          {isVip ? 'VIP' : 'Thường'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />}>
            Sửa
          </Button>
          <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3}>Quản lý khách hàng</Title>
          <Space>
            <Search
              placeholder="Tìm kiếm khách hàng..."
              allowClear
              style={{ width: 300 }}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm khách hàng
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={customers?.data?.results || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: customers?.data?.count || 0,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
        />
      </Card>
    </div>
  );
};

export default Customers;