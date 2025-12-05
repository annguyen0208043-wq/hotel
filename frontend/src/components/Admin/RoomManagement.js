import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm, 
  message, Tag, Card, Row, Col, Statistic, InputNumber, DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined,
  SearchOutlined, ToolOutlined, ClearOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    cleaning: 0
  });

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    // Filter rooms based on search text
    const filtered = rooms.filter(room => 
      room.room_number.toLowerCase().includes(searchText.toLowerCase()) ||
      room.room_type.name.toLowerCase().includes(searchText.toLowerCase()) ||
      room.status.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [rooms, searchText]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/rooms/');
      console.log('Rooms API Response:', response.data);
      
      // Ensure response.data is an array
      const roomsData = Array.isArray(response.data) ? response.data : 
                       response.data.results ? response.data.results : [];
      
      setRooms(roomsData);
      
      // Calculate statistics
      const total = roomsData.length;
      const available = roomsData.filter(room => room.status === 'available').length;
      const occupied = roomsData.filter(room => room.status === 'occupied').length;
      const maintenance = roomsData.filter(room => room.status === 'maintenance').length;
      const cleaning = roomsData.filter(room => room.status === 'cleaning').length;
      
      setStatistics({
        total,
        available,
        occupied,
        maintenance,
        cleaning
      });
    } catch (error) {
      message.error('Failed to fetch rooms');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get('/api/rooms/types/');
      const roomTypesData = Array.isArray(response.data) ? response.data : 
                           response.data.results ? response.data.results : [];
      setRoomTypes(roomTypesData);
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setSelectedRoomType(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleRoomTypeChange = (roomTypeId) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    setSelectedRoomType(roomType);
    
    // Auto-fill price if no custom price is set
    if (roomType && !form.getFieldValue('price_per_night')) {
      form.setFieldsValue({
        price_per_night: roomType.price_per_night
      });
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setSelectedRoomType(room.room_type);
    form.setFieldsValue({
      room_number: room.room_number,
      room_type: room.room_type.id,
      floor: room.floor,
      price_per_night: room.price_per_night,
      status: room.status,
      notes: room.notes,
      is_active: room.is_active
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      // Prepare data for API - convert room_type to room_type_id
      const apiData = {
        ...values,
        room_type_id: values.room_type
      };
      delete apiData.room_type; // Remove the original room_type field
      
      if (editingRoom) {
        // Update existing room
        const response = await api.put(`/api/rooms/${editingRoom.id}/`, apiData);
        message.success('Cập nhật phòng thành công');
      } else {
        // Create new room
        const response = await api.post('/api/rooms/', apiData);
        message.success('Tạo phòng thành công');
      }
      
      setModalVisible(false);
      setSelectedRoomType(null);
      form.resetFields();
      fetchRooms();
    } catch (error) {
      message.error(editingRoom ? 'Failed to update room' : 'Failed to create room');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (roomId) => {
    try {
      await api.delete(`/api/rooms/${roomId}/`);
      message.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      message.error('Failed to delete room');
      console.error('Error:', error);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await api.patch(`/api/rooms/${roomId}/`, { status: newStatus });
      message.success('Room status updated successfully');
      fetchRooms();
    } catch (error) {
      message.error('Failed to update room status');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'available': 'green',
      'occupied': 'red',
      'maintenance': 'orange',
      'cleaning': 'blue',
      'reserved': 'purple'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'available': 'Trống',
      'occupied': 'Đang sử dụng',
      'maintenance': 'Bảo trì',
      'cleaning': 'Đang dọn dẹp',
      'reserved': 'Đã đặt'
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: 'Số phòng',
      dataIndex: 'room_number',
      key: 'room_number',
      sorter: (a, b) => a.room_number.localeCompare(b.room_number),
      width: 100,
    },
    {
      title: 'Loại phòng',
      key: 'room_type',
      render: (text, record) => record.room_type?.name || 'N/A',
      sorter: (a, b) => (a.room_type?.name || '').localeCompare(b.room_type?.name || ''),
    },
    {
      title: 'Tầng',
      dataIndex: 'floor',
      key: 'floor',
      sorter: (a, b) => a.floor - b.floor,
      width: 80,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
      filters: [
        { text: 'Trống', value: 'available' },
        { text: 'Đang sử dụng', value: 'occupied' },
        { text: 'Bảo trì', value: 'maintenance' },
        { text: 'Đang dọn dẹp', value: 'cleaning' },
        { text: 'Đã đặt', value: 'reserved' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Giá/đêm',
      key: 'price',
      render: (text, record) => {
        const effectivePrice = record.effective_price || record.price_per_night || record.room_type?.price_per_night;
        const isCustomPrice = record.price_per_night && record.price_per_night !== record.room_type?.price_per_night;
        return effectivePrice ? (
          <div>
            <span>{Number(effectivePrice).toLocaleString()} VND</span>
            {isCustomPrice && <Tag color="orange" size="small" style={{marginLeft: 4}}>Giá riêng</Tag>}
          </div>
        ) : 'N/A';
      },
      sorter: (a, b) => {
        const priceA = a.effective_price || a.price_per_night || a.room_type?.price_per_night || 0;
        const priceB = b.effective_price || b.price_per_night || b.room_type?.price_per_night || 0;
        return priceA - priceB;
      },
    },
    {
      title: 'Hoạt động',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm ngưng'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Tạm ngưng', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          {record.status === 'available' && (
            <Popconfirm
              title="Chuyển sang trạng thái bảo trì?"
              onConfirm={() => handleStatusChange(record.id, 'maintenance')}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={<ToolOutlined />}
                size="small"
              >
                Bảo trì
              </Button>
            </Popconfirm>
          )}
          {record.status === 'maintenance' && (
            <Popconfirm
              title="Chuyển về trạng thái trống?"
              onConfirm={() => handleStatusChange(record.id, 'available')}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={<HomeOutlined />}
                size="small"
                type="primary"
              >
                Sẵn sàng
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phòng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={5}>
          <Card>
            <Statistic
              title="Tổng số phòng"
              value={statistics.total}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Phòng trống"
              value={statistics.available}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Đang sử dụng"
              value={statistics.occupied}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Bảo trì"
              value={statistics.maintenance}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Đang dọn dẹp"
              value={statistics.cleaning}
              prefix={<ClearOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Header with Search and Add Button */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Quản lý phòng</h2>
        <Space>
          <Input
            placeholder="Tìm kiếm phòng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm phòng
          </Button>
        </Space>
      </div>

      {/* Rooms Table */}
      <Table
        columns={columns}
        dataSource={Array.isArray(filteredRooms) ? filteredRooms : []}
        rowKey={(record) => record.id || Math.random()}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phòng`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRoomType(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'available',
            is_active: true,
            floor: 1
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room_number"
                label="Số phòng"
                rules={[
                  { required: true, message: 'Vui lòng nhập số phòng' },
                  { max: 10, message: 'Số phòng không được quá 10 ký tự' }
                ]}
              >
                <Input placeholder="Nhập số phòng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room_type"
                label="Loại phòng"
                rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
              >
                <Select 
                  placeholder="Chọn loại phòng"
                  onChange={handleRoomTypeChange}
                >
                  {roomTypes.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.name} - {Number(type.price_per_night).toLocaleString()} VND/đêm
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Room Type Details */}
          {selectedRoomType && (
            <Card 
              size="small" 
              style={{ marginBottom: '16px', backgroundColor: '#f8f9fa' }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Chi tiết loại phòng: {selectedRoomType.name}</span>
                  <Tag color="blue">
                    {Number(selectedRoomType.price_per_night).toLocaleString()} VND/đêm
                  </Tag>
                </div>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Mô tả:</strong> {selectedRoomType.description}</p>
                  <p><strong>Sức chứa tối đa:</strong> {selectedRoomType.max_occupancy} người</p>
                </Col>
                <Col span={12}>
                  <p><strong>Tiện nghi:</strong></p>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {selectedRoomType.amenities}
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="floor"
                label="Tầng"
                rules={[{ required: true, message: 'Vui lòng nhập tầng' }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  placeholder="Nhập số tầng"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price_per_night"
                label="Giá phòng/đêm (VND)"
                help="Để trống sẽ sử dụng giá của loại phòng"
              >
                <InputNumber
                  min={0}
                  step={10000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập giá riêng (tùy chọn)"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="available">Trống</Option>
                  <Option value="occupied">Đang sử dụng</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="cleaning">Đang dọn dẹp</Option>
                  <Option value="reserved">Đã đặt</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Trạng thái hoạt động"
              >
                <Select>
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Tạm ngưng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú về phòng..."
            />
          </Form.Item>



          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setSelectedRoomType(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRoom ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;