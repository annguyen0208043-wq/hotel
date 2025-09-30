import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { employeeService } from '../../services';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const Employees = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery('employees', employeeService.getAll);

  const createMutation = useMutation(employeeService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      setIsModalVisible(false);
      form.resetFields();
      message.success('Thêm nhân viên thành công!');
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi thêm nhân viên!');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => employeeService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setIsModalVisible(false);
        setEditingEmployee(null);
        form.resetFields();
        message.success('Cập nhật nhân viên thành công!');
      },
      onError: () => {
        message.error('Có lỗi xảy ra khi cập nhật nhân viên!');
      },
    }
  );

  const deleteMutation = useMutation(employeeService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      message.success('Xóa nhân viên thành công!');
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa nhân viên!');
    },
  });

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'employee_id',
      key: 'employee_id',
    },
    {
      title: 'Họ tên',
      key: 'full_name',
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
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      render: (position) => {
        const positionMap = {
          manager: 'Quản lý',
          receptionist: 'Lễ tân',
          housekeeper: 'Nhân viên dọn phòng',
          security: 'Bảo vệ',
          maintenance: 'Bảo trì',
          accountant: 'Kế toán',
        };
        return <Tag color="blue">{positionMap[position] || position}</Tag>;
      },
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => {
        const shiftMap = {
          morning: 'Ca sáng',
          afternoon: 'Ca chiều',
          night: 'Ca đêm',
        };
        const colors = {
          morning: 'gold',
          afternoon: 'green',
          night: 'purple',
        };
        return <Tag color={colors[shift]}>{shiftMap[shift] || shift}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Hoạt động' : 'Tạm nghỉ'}
        </Tag>
      ),
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
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      ...employee,
      hire_date: employee.hire_date ? dayjs(employee.hire_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa nhân viên này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmit = (values) => {
    const formData = {
      ...values,
      hire_date: values.hire_date ? values.hire_date.format('YYYY-MM-DD') : null,
    };

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3}>Quản lý nhân viên</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm nhân viên
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={employees?.data?.results || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: employees?.data?.count || 0,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
        />
      </Card>

      <Modal
        title={editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingEmployee(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="employee_id"
            label="Mã nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
          >
            <Input placeholder="Nhập mã nhân viên" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          {!editingEmployee && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="first_name"
              label="Họ"
              rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập họ" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nhập tên" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="position"
              label="Chức vụ"
              rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn chức vụ">
                <Option value="manager">Quản lý</Option>
                <Option value="receptionist">Lễ tân</Option>
                <Option value="housekeeper">Nhân viên dọn phòng</Option>
                <Option value="security">Bảo vệ</Option>
                <Option value="maintenance">Bảo trì</Option>
                <Option value="accountant">Kế toán</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="shift"
              label="Ca làm việc"
              rules={[{ required: true, message: 'Vui lòng chọn ca làm việc!' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Chọn ca làm việc">
                <Option value="morning">Ca sáng (6:00-14:00)</Option>
                <Option value="afternoon">Ca chiều (14:00-22:00)</Option>
                <Option value="night">Ca đêm (22:00-6:00)</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="salary"
              label="Lương"
              rules={[{ required: true, message: 'Vui lòng nhập lương!' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" placeholder="Nhập lương" suffix="VND" />
            </Form.Item>

            <Form.Item
              name="hire_date"
              label="Ngày tuyển dụng"
              rules={[{ required: true, message: 'Vui lòng chọn ngày tuyển dụng!' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Tạm nghỉ</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;