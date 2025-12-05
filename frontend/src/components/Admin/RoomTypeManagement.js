import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, 
  message, Card, Row, Col, Statistic, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { TextArea } = Input;

const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    // Filter room types based on search text
    const filtered = roomTypes.filter(type => 
      type.name.toLowerCase().includes(searchText.toLowerCase()) ||
      type.description.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRoomTypes(filtered);
  }, [roomTypes, searchText]);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/rooms/types/');
      console.log('Room Types API Response:', response.data);
      
      const roomTypesData = Array.isArray(response.data) ? response.data : 
                           response.data.results ? response.data.results : [];
      
      setRoomTypes(roomTypesData);
    } catch (error) {
      message.error('Không thể tải danh sách loại phòng');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRoomType(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (roomType) => {
    setEditingRoomType(roomType);
    form.setFieldsValue({
      name: roomType.name,
      description: roomType.description,
      price_per_night: roomType.price_per_night,
      max_occupancy: roomType.max_occupancy,
      amenities: roomType.amenities
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRoomType) {
        // Update existing room type
        await api.put(`/api/rooms/types/${editingRoomType.id}/`, values);
        message.success('Cập nhật loại phòng thành công');
      } else {
        // Create new room type
        await api.post('/api/rooms/types/', values);
        message.success('Tạo loại phòng thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchRoomTypes();
    } catch (error) {
      message.error(editingRoomType ? 'Không thể cập nhật loại phòng' : 'Không thể tạo loại phòng');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (roomTypeId) => {
    try {
      await api.delete(`/api/rooms/types/${roomTypeId}/`);
      message.success('Xóa loại phòng thành công');
      fetchRoomTypes();
    } catch (error) {
      message.error('Không thể xóa loại phòng');
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      title: 'Tên loại phòng',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Giá/đêm (VND)',
      dataIndex: 'price_per_night',
      key: 'price_per_night',
      render: (price) => `${Number(price).toLocaleString()} VND`,
      sorter: (a, b) => a.price_per_night - b.price_per_night,
    },
    {
      title: 'Sức chứa tối đa',
      dataIndex: 'max_occupancy',
      key: 'max_occupancy',
      render: (occupancy) => `${occupancy} người`,
      sorter: (a, b) => a.max_occupancy - b.max_occupancy,
    },
    {
      title: 'Tiện nghi',
      dataIndex: 'amenities',
      key: 'amenities',
      ellipsis: true,
      width: 250,
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
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa loại phòng này?"
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
      {/* Statistics Card */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số loại phòng"
              value={roomTypes.length}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giá thấp nhất"
              value={roomTypes.length > 0 ? Math.min(...roomTypes.map(t => t.price_per_night)) : 0}
              formatter={(value) => `${Number(value).toLocaleString()} VND`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giá cao nhất"
              value={roomTypes.length > 0 ? Math.max(...roomTypes.map(t => t.price_per_night)) : 0}
              formatter={(value) => `${Number(value).toLocaleString()} VND`}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sức chứa tối đa"
              value={roomTypes.length > 0 ? Math.max(...roomTypes.map(t => t.max_occupancy)) : 0}
              formatter={(value) => `${value} người`}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Header with Search and Add Button */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Quản lý loại phòng</h2>
        <Space>
          <Input
            placeholder="Tìm kiếm loại phòng..."
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
            Thêm loại phòng
          </Button>
        </Space>
      </div>

      {/* Room Types Table */}
      <Table
        columns={columns}
        dataSource={Array.isArray(filteredRoomTypes) ? filteredRoomTypes : []}
        rowKey={(record) => record.id || Math.random()}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} loại phòng`,
        }}
        scroll={{ x: 1000 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingRoomType ? 'Sửa loại phòng' : 'Thêm loại phòng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            max_occupancy: 2,
            price_per_night: 500000
          }}
        >
          <Form.Item
            name="name"
            label="Tên loại phòng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại phòng' },
              { max: 50, message: 'Tên loại phòng không được quá 50 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Standard Single, Deluxe Double..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea
              rows={3}
              placeholder="Mô tả chi tiết về loại phòng này..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price_per_night"
                label="Giá/đêm (VND)"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá phòng' },
                  { type: 'number', min: 0, message: 'Giá phòng phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  min={0}
                  step={10000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="500000"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_occupancy"
                label="Sức chứa tối đa (người)"
                rules={[
                  { required: true, message: 'Vui lòng nhập sức chứa' },
                  { type: 'number', min: 1, max: 10, message: 'Sức chứa từ 1-10 người' }
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  placeholder="2"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="amenities"
            label="Tiện nghi"
            rules={[{ required: true, message: 'Vui lòng nhập danh sách tiện nghi' }]}
          >
            <TextArea
              rows={3}
              placeholder="Điều hòa, TV, WiFi miễn phí, Minibar, Ban công... (phân tách bằng dấu phẩy)"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRoomType ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomTypeManagement;