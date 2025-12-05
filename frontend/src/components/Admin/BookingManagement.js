import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Popconfirm,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';
import SimpleTable from '../Common/SimpleTable';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingManagement = () => {
  // States
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0
  });

  // Load data when component mounts
  useEffect(() => {
    loadAllData();
  }, []);

  // Calculate statistics when bookings change
  useEffect(() => {
    calculateStats();
  }, [bookings]);

  const calculateStats = () => {
    if (!Array.isArray(bookings)) return;

    const newStats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      checkedIn: bookings.filter(b => b.status === 'checked_in').length,
      checkedOut: bookings.filter(b => b.status === 'checked_out').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    setStats(newStats);
  };

  const loadAllData = async () => {
    console.log('Starting to load all data...');
    setLoading(true);
    try {
      await Promise.all([
        loadBookings(),
        loadRooms(),
        loadCustomers()
      ]);
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      console.log('Loading bookings...');
      const response = await api.get('/api/rooms/bookings/');
      console.log('Bookings API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // Handle pagination response format
      let data = [];
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          data = response.data.results;
        }
      }
      
      console.log('Processed bookings data:', data);
      console.log('Number of bookings:', data.length);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      console.error('Error response:', error.response);
      message.error('Lỗi tải danh sách đặt phòng');
      setBookings([]);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await api.get('/api/rooms/');
      
      let data = [];
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          data = response.data.results;
        }
      }
      
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/api/accounts/admin/customers/');
      
      let data = [];
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          data = response.data.results;
        }
      }
      
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const handleCreate = () => {
    setEditingBooking(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBooking(record);
    form.setFieldsValue({
      customer: record.customer,
      room: record.room,
      check_in_date: record.check_in_date ? dayjs(record.check_in_date) : null,
      check_out_date: record.check_out_date ? dayjs(record.check_out_date) : null,
      adults: record.adults || 1,
      children: record.children || 0,
      status: record.status,
      special_requests: record.special_requests,
      total_amount: record.total_amount
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingBooking(record);
    setDetailModalVisible(true);
  };

  const handleCheckIn = async (record) => {
    try {
      await api.patch(`/api/rooms/bookings/${record.id}/check_in/`);
      message.success('Check-in thành công');
      loadBookings();
    } catch (error) {
      message.error('Lỗi check-in');
    }
  };

  const handleCheckOut = async (record) => {
    try {
      await api.patch(`/api/rooms/bookings/${record.id}/check_out/`);
      message.success('Check-out thành công');
      loadBookings();
    } catch (error) {
      message.error('Lỗi check-out');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/rooms/bookings/${id}/`);
      message.success('Xóa đặt phòng thành công');
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      message.error('Lỗi xóa đặt phòng');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        check_in_date: values.check_in_date?.format('YYYY-MM-DD'),
        check_out_date: values.check_out_date?.format('YYYY-MM-DD')
      };

      if (editingBooking) {
        await api.patch(`/api/rooms/bookings/${editingBooking.id}/`, payload);
        message.success('Cập nhật đặt phòng thành công');
      } else {
        await api.post('/api/rooms/bookings/', payload);
        message.success('Tạo đặt phòng thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingBooking(null);
      loadBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      message.error('Lỗi lưu đặt phòng');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      checked_in: 'green',
      checked_out: 'gray',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      checked_in: 'Đã check-in',
      checked_out: 'Đã check-out',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: '150px'
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: '200px',
      render: (_, record) => {
        if (record.customer_detail) {
          return `${record.customer_detail.first_name || ''} ${record.customer_detail.last_name || ''}`.trim();
        }
        return 'N/A';
      }
    },
    {
      title: 'Phòng',
      key: 'room',
      width: '100px',
      render: (_, record) => record.room_detail?.room_number || 'N/A'
    },
    {
      title: 'Loại phòng',
      key: 'room_type',
      width: '150px',
      render: (_, record) => record.room_detail?.room_type?.name || 'N/A'
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in_date',
      key: 'check_in_date',
      width: '120px',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Check-out',
      dataIndex: 'check_out_date',
      key: 'check_out_date',
      width: '120px',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Số đêm',
      key: 'nights',
      width: '80px',
      render: (_, record) => {
        if (record.check_in_date && record.check_out_date) {
          return dayjs(record.check_out_date).diff(dayjs(record.check_in_date), 'day');
        }
        return 0;
      }
    },
    {
      title: 'Khách',
      key: 'guests',
      width: '80px',
      render: (_, record) => `${record.adults || 1}+${record.children || 0}`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: '120px',
      render: (amount) => amount ? `${Number(amount).toLocaleString()} VND` : '0 VND'
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '250px',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          
          {/* Check-in button - chỉ hiện khi status = confirmed */}
          {record.status === 'confirmed' && (
            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => handleCheckIn(record)}
            >
              Check-in
            </Button>
          )}
          
          {/* Check-out button - chỉ hiện khi status = checked_in */}
          {record.status === 'checked_in' && (
            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
              onClick={() => handleCheckOut(record)}
            >
              Check-out
            </Button>
          )}
          
          <Popconfirm
            title="Bạn có chắc muốn xóa đặt phòng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>Quản lý đặt phòng</h2>
        </Col>
        <Col>
          <Space>
            <Button onClick={loadBookings}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Tạo đặt phòng
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Tổng đặt phòng"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Chờ xác nhận"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Đang ở"
              value={stats.checkedIn}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Đã trả phòng"
              value={stats.checkedOut}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <SimpleTable
          columns={columns}
          dataSource={bookings}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={{
            total: bookings.length,
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt phòng`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingBooking ? 'Sửa đặt phòng' : 'Tạo đặt phòng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBooking(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer"
                label="Khách hàng"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room"
                label="Phòng"
                rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
              >
                <Select placeholder="Chọn phòng">
                  {rooms.map(room => (
                    <Option key={room.id} value={room.id}>
                      Phòng {room.room_number} - {room.room_type?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="check_in_date"
                label="Ngày check-in"
                rules={[{ required: true, message: 'Vui lòng chọn ngày check-in' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="check_out_date"
                label="Ngày check-out"
                rules={[{ required: true, message: 'Vui lòng chọn ngày check-out' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adults"
                label="Số người lớn"
                initialValue={1}
                rules={[{ required: true, message: 'Vui lòng nhập số người lớn' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="children"
                label="Số trẻ em"
                initialValue={0}
              >
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="pending"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="pending">Chờ xác nhận</Option>
                  <Option value="confirmed">Đã xác nhận</Option>
                  <Option value="checked_in">Đã check-in</Option>
                  <Option value="checked_out">Đã check-out</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="total_amount"
                label="Tổng tiền (VND)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="special_requests"
            label="Yêu cầu đặc biệt"
          >
            <Input.TextArea rows={3} placeholder="Nhập yêu cầu đặc biệt..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBooking ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đặt phòng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {viewingBooking && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Mã đặt phòng:</strong> {viewingBooking.booking_id}</p>
                <p><strong>Khách hàng:</strong> {viewingBooking.customer_detail ? 
                  `${viewingBooking.customer_detail.first_name} ${viewingBooking.customer_detail.last_name}` : 'N/A'}</p>
                <p><strong>Phòng:</strong> {viewingBooking.room_detail?.room_number}</p>
                <p><strong>Loại phòng:</strong> {viewingBooking.room_detail?.room_type?.name}</p>
              </Col>
              <Col span={12}>
                <p><strong>Check-in:</strong> {dayjs(viewingBooking.check_in_date).format('DD/MM/YYYY')}</p>
                <p><strong>Check-out:</strong> {dayjs(viewingBooking.check_out_date).format('DD/MM/YYYY')}</p>
                <p><strong>Số khách:</strong> {viewingBooking.adults} người lớn, {viewingBooking.children} trẻ em</p>
                <p><strong>Trạng thái:</strong> 
                  <Tag color={getStatusColor(viewingBooking.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(viewingBooking.status)}
                  </Tag>
                </p>
              </Col>
            </Row>
            <p><strong>Tổng tiền:</strong> {Number(viewingBooking.total_amount || 0).toLocaleString()} VND</p>
            {viewingBooking.special_requests && (
              <p><strong>Yêu cầu đặc biệt:</strong> {viewingBooking.special_requests}</p>
            )}
            <p><strong>Ngày tạo:</strong> {dayjs(viewingBooking.created_at).format('DD/MM/YYYY HH:mm')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManagement;
