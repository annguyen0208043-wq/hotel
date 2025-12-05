import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, 
  message, Tag, Card, Row, Col, Statistic
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/accounts/admin/customers/');
      console.log('Customers API Response:', response.data);
      
      // Ensure response.data is an array
      const customersData = Array.isArray(response.data) ? response.data : 
                           response.data.results ? response.data.results : [];
      
      setCustomers(customersData);
      
      // Calculate statistics  
      const total = customersData.length;
      const active = customersData.filter(cust => cust.is_active).length;
      const inactive = total - active;
      const verified = customersData.filter(cust => cust.id_card_number && cust.id_card_number.length > 0).length;
      
      setStats({ total, active, inactive, verified });
    } catch (error) {
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setModalVisible(true);
    form.setFieldsValue(customer);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/accounts/admin/customers/${id}/`);
      message.success('Xóa khách hàng thành công');
      fetchCustomers();
    } catch (error) {
      message.error('Không thể xóa khách hàng');
    }
  };

  const handleSubmit = async (values) => {
    console.log('Submitting values:', values); // Debug log
    
    // Đảm bảo user_type là customer cho form tạo mới
    if (!editingCustomer) {
      values.user_type = 'customer';
    }
    
    try {
      if (editingCustomer) {
        // Update
        console.log('Updating customer:', editingCustomer.id, values);
        const response = await api.put(`/api/accounts/admin/customers/${editingCustomer.id}/`, values);
        console.log('Update response:', response.data);
        message.success('Cập nhật khách hàng thành công');
      } else {
        // Create
        console.log('Creating customer:', values);
        const response = await api.post('/api/accounts/admin/customers/', values);
        console.log('Create response:', response.data);
        message.success('Tạo khách hàng thành công');
      }
      setModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error('Submit error:', error.response?.data || error);
      message.error(editingCustomer ? 'Không thể cập nhật khách hàng' : 'Không thể tạo khách hàng');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Họ tên',
      key: 'fullName',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
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
      title: 'Số CCCD/CMND',
      dataIndex: 'id_card_number',
      key: 'id_card_number',
      render: (text, record) => {
        console.log('CCCD data:', text); // Debug log
        if (text) {
          return (
            <span>
              {text}
              <br />
              <Tag color="green" size="small">Đã xác thực</Tag>
            </span>
          );
        }
        return (
          <span>
            Chưa cập nhật
            <br />
            <Tag color="orange" size="small">Chưa xác thực</Tag>
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'volcano'}>
          {active ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'date_joined',
      key: 'date_joined',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Có CCCD (Đã xác thực)"
              value={stats.verified}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Quản lý khách hàng"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm khách hàng
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={Array.isArray(customers) ? customers : []}
          rowKey={(record) => record.id || Math.random()}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {!editingCustomer && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="id_card_number" 
                label="Số CCCD/CMND"
                rules={[
                  { required: true, message: 'Vui lòng nhập số CCCD/CMND' },
                  { pattern: /^\d{9,12}$/, message: 'Số CCCD/CMND phải từ 9-12 chữ số' }
                ]}
              >
                <Input placeholder="Nhập số CCCD/CMND" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="date_of_birth" label="Ngày sinh">
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;