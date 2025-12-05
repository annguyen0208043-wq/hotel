import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm, 
  message, Tag, Card, Row, Col, Statistic
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  TeamOutlined, SearchOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';

const { Option } = Select;

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/accounts/admin/employees/');
      console.log('Employees API Response:', response.data);
      
      // Ensure response.data is an array
      const employeesData = Array.isArray(response.data) ? response.data : 
                           response.data.results ? response.data.results : [];
      
      setEmployees(employeesData);
      
      // Calculate statistics
      const total = employeesData.length;
      const active = employeesData.filter(emp => emp.is_active).length;
      const inactive = total - active;
      const admins = employeesData.filter(emp => emp.user_type === 'admin').length;
      
      setStats({ total, active, inactive, admins });
    } catch (error) {
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setModalVisible(true);
    form.setFieldsValue(employee);
  };

  const handleToggleStatus = async (employee) => {
    try {
      const newStatus = !employee.is_active;
      await api.put(`/api/accounts/admin/employees/${employee.id}/`, {
        ...employee,
        is_active: newStatus
      });
      message.success(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`);
      fetchEmployees();
    } catch (error) {
      message.error('Không thể thay đổi trạng thái tài khoản');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/accounts/admin/employees/${id}/`);
      message.success('Xóa nhân viên thành công');
      fetchEmployees();
    } catch (error) {
      message.error('Không thể xóa nhân viên');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingEmployee) {
        // Update
        await api.put(`/api/accounts/admin/employees/${editingEmployee.id}/`, values);
        message.success('Cập nhật nhân viên thành công');
      } else {
        // Create
        await api.post('/api/accounts/admin/employees/', values);
        message.success('Tạo nhân viên thành công');
      }
      setModalVisible(false);
      fetchEmployees();
    } catch (error) {
      message.error(editingEmployee ? 'Không thể cập nhật nhân viên' : 'Không thể tạo nhân viên');
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
      title: 'Loại tài khoản',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (type) => (
        <Tag color={type === 'admin' ? 'red' : 'blue'}>
          {type === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
        </Tag>
      ),
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
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const isCurrentUser = user && user.id === record.id;
        const isAdmin = record.user_type === 'admin';
        
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={isCurrentUser}
              title={isCurrentUser ? 'Không thể tự sửa thông tin' : ''}
            >
              Sửa
            </Button>
            
            {isAdmin ? (
              // Với admin chỉ cho phép vô hiệu hóa/kích hoạt
              <Popconfirm
                title={`Bạn có chắc muốn ${record.is_active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản admin này?`}
                onConfirm={() => handleToggleStatus(record)}
                okText="Có"
                cancelText="Không"
                disabled={isCurrentUser}
              >
                <Button
                  type={record.is_active ? "default" : "primary"}
                  size="small"
                  disabled={isCurrentUser}
                  title={isCurrentUser ? 'Không thể tự thay đổi trạng thái' : ''}
                >
                  {record.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </Button>
              </Popconfirm>
            ) : (
              // Với nhân viên thường cho phép xóa
              <Popconfirm
                title="Bạn có chắc muốn xóa nhân viên này?"
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
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
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
              title="Quản trị viên"
              value={stats.admins}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Quản lý nhân viên"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm nhân viên
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={Array.isArray(employees) ? employees : []}
          rowKey={(record) => record.id || Math.random()}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingEmployee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
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

          {!editingEmployee && (
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
              <Form.Item
                name="user_type"
                label="Loại tài khoản"
                rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản' }]}
              >
                <Select>
                  <Option value="employee">Nhân viên</Option>
                  <Option value="admin">Quản trị viên</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="date_of_birth" label="Ngày sinh">
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? 'Cập nhật' : 'Tạo mới'}
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

export default EmployeeManagement;