import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, DatePicker, Select, Form, Input, 
  message, Modal, Descriptions, Tag, Typography, Space, 
  Spin, Empty, InputNumber, Divider
} from 'antd';
import {
  CalendarOutlined, UserOutlined, HomeOutlined, 
  DollarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  TeamOutlined, StarOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const BookRoom = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Tìm kiếm phòng trống
  const searchAvailableRooms = async (values) => {
    setSearchLoading(true);
    try {
      const checkIn = values.dateRange[0].format('YYYY-MM-DD');
      const checkOut = values.dateRange[1].format('YYYY-MM-DD');
      
      const response = await api.get('/api/rooms/available/', {
        params: {
          check_in: checkIn,
          check_out: checkOut
        }
      });
      
      setAvailableRooms(response.data);
      setSearchParams({
        checkIn,
        checkOut,
        guests: values.guests,
        dateRange: values.dateRange
      });
      
      if (response.data.length === 0) {
        message.info('Không có phòng trống trong thời gian này');
      }
    } catch (error) {
      message.error('Không thể tìm kiếm phòng');
      console.error('Error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Tính tổng tiền
  const calculateTotal = (room, nights) => {
    const price = room.price_per_night || room.room_type?.price_per_night || 0;
    return price * nights;
  };

  // Chọn phòng để đặt
  const selectRoom = (room) => {
    if (!searchParams) return;
    
    const nights = moment(searchParams.checkOut).diff(moment(searchParams.checkIn), 'days');
    const total = calculateTotal(room, nights);
    
    setSelectedRoom(room);
    setTotalAmount(total);
    setBookingModalVisible(true);
    
    // Set form values
    form.setFieldsValue({
      room: room.id,
      check_in_date: searchParams.checkIn,
      check_out_date: searchParams.checkOut,
      guests_count: searchParams.guests,
      total_amount: total
    });
  };

  // Tạo booking
  const createBooking = async (values) => {
    setLoading(true);
    try {
      const bookingData = {
        customer: user.id,
        room: selectedRoom.id,
        check_in_date: searchParams.checkIn,
        check_out_date: searchParams.checkOut,
        adults: values.adults || searchParams.guests,
        children: values.children || 0,
        total_amount: totalAmount,
        special_requests: values.special_requests
      };

      await api.post('/api/rooms/bookings/', bookingData);
      
      message.success('Đặt phòng thành công! Vui lòng chờ xác nhận từ khách sạn.');
      setBookingModalVisible(false);
      form.resetFields();
      setAvailableRooms([]);
      setSearchParams(null);
      setSelectedRoom(null);
      
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          Object.keys(errors).forEach(key => {
            message.error(`${key}: ${errors[key]}`);
          });
        } else {
          message.error('Không thể đặt phòng');
        }
      } else {
        message.error('Không thể đặt phòng');
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomStatusColor = (status) => {
    const colors = {
      'available': 'green',
      'occupied': 'red',
      'maintenance': 'orange',
      'cleaning': 'blue',
      'reserved': 'purple'
    };
    return colors[status] || 'default';
  };

  const getRoomStatusText = (status) => {
    const texts = {
      'available': 'Trống',
      'occupied': 'Đang sử dụng',
      'maintenance': 'Bảo trì',
      'cleaning': 'Đang dọn dẹp',
      'reserved': 'Đã đặt'
    };
    return texts[status] || status;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2}>
          <HomeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Đặt phòng khách sạn
        </Title>
        <Text type="secondary">
          Tìm kiếm và đặt phòng phù hợp với nhu cầu của bạn
        </Text>
      </div>

      {/* Search Form */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            Tìm kiếm phòng trống
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Form
          layout="vertical"
          onFinish={searchAvailableRooms}
          initialValues={{ guests: 1 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian lưu trú"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="guests"
                label="Số khách"
                rules={[{ required: true, message: 'Vui lòng chọn số khách' }]}
              >
                <InputNumber 
                  min={1} 
                  max={10}
                  style={{ width: '100%' }}
                  placeholder="Số người"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={searchLoading}
                  size="large"
                  style={{ width: '100%' }}
                >
                  Tìm kiếm
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Available Rooms */}
      {searchLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Đang tìm kiếm phòng trống...</div>
        </div>
      ) : availableRooms.length > 0 ? (
        <div>
          <Title level={3} style={{ marginBottom: '24px' }}>
            Phòng có sẵn ({availableRooms.length} phòng)
          </Title>
          <Row gutter={[16, 16]}>
            {availableRooms.map(room => {
              const nights = searchParams ? moment(searchParams.checkOut).diff(moment(searchParams.checkIn), 'days') : 0;
              const roomPrice = room.price_per_night || room.room_type?.price_per_night || 0;
              const total = roomPrice * nights;
              
              return (
                <Col xs={24} md={12} lg={8} key={room.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ 
                        height: '200px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px'
                      }}>
                        <HomeOutlined />
                      </div>
                    }
                    actions={[
                      <Button 
                        type="primary" 
                        onClick={() => selectRoom(room)}
                        style={{ width: '90%' }}
                      >
                        Đặt phòng
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          <Text strong>Phòng {room.room_number}</Text>
                          <Tag color={getRoomStatusColor(room.status)}>
                            {getRoomStatusText(room.status)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: '8px' }}>
                            <StarOutlined style={{ color: '#faad14' }} />
                            <Text strong style={{ marginLeft: '4px' }}>
                              {room.room_type?.name}
                            </Text>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <TeamOutlined />
                            <Text style={{ marginLeft: '4px' }}>
                              Tối đa {room.room_type?.max_occupancy} người
                            </Text>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <Text type="secondary">Tầng {room.floor}</Text>
                          </div>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text type="secondary">Giá/đêm:</Text>
                              <div>
                                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                  {Number(roomPrice).toLocaleString()} VND
                                </Text>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Text type="secondary">{nights} đêm:</Text>
                              <div>
                                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                  {Number(total).toLocaleString()} VND
                                </Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ) : searchParams ? (
        <Empty 
          description="Không có phòng trống trong thời gian này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : null}

      {/* Booking Modal */}
      <Modal
        title={
          <Space>
            <HomeOutlined />
            Xác nhận đặt phòng
          </Space>
        }
        open={bookingModalVisible}
        onCancel={() => {
          setBookingModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRoom && (
          <div>
            {/* Room Info */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Phòng">
                  <Text strong>{selectedRoom.room_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại phòng">
                  {selectedRoom.room_type?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Tầng">
                  {selectedRoom.floor}
                </Descriptions.Item>
                <Descriptions.Item label="Sức chứa">
                  {selectedRoom.room_type?.max_occupancy} người
                </Descriptions.Item>
                <Descriptions.Item label="Check-in">
                  {searchParams ? moment(searchParams.checkIn).format('DD/MM/YYYY') : ''}
                </Descriptions.Item>
                <Descriptions.Item label="Check-out">
                  {searchParams ? moment(searchParams.checkOut).format('DD/MM/YYYY') : ''}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Booking Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={createBooking}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="adults"
                    label="Số người lớn"
                    initialValue={searchParams?.guests || 1}
                  >
                    <InputNumber 
                      min={1} 
                      max={selectedRoom.room_type?.max_occupancy}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="children"
                    label="Số trẻ em"
                    initialValue={0}
                  >
                    <InputNumber 
                      min={0} 
                      max={2}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="special_requests"
                label="Yêu cầu đặc biệt"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Ghi chú thêm về yêu cầu của bạn..."
                />
              </Form.Item>

              {/* Total Amount */}
              <Card size="small" style={{ backgroundColor: '#f6ffed', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Tổng thanh toán:</Text>
                  <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {Number(totalAmount).toLocaleString()} VND
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  (Bao gồm {searchParams ? moment(searchParams.checkOut).diff(moment(searchParams.checkIn), 'days') : 0} đêm)
                </Text>
              </Card>

              {/* Buttons */}
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => {
                    setBookingModalVisible(false);
                    form.resetFields();
                  }}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                  >
                    Xác nhận đặt phòng
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookRoom;