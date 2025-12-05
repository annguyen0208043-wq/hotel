import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Badge, 
  Tag, 
  Button, 
  Modal, 
  Table, 
  Statistic,
  Space,
  message,
  Tabs,
  Select,
  Input
} from 'antd';
import { 
  ShoppingCartOutlined,
  CoffeeOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import './ServiceOrders.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ServiceOrders = () => {
  const [loading, setLoading] = useState(false);
  const [roomsData, setRoomsData] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load dashboard data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      console.log('Loading dashboard data...');
      const response = await api.get('/api/services/dashboard/');
      console.log('Dashboard response:', response);
      setRoomsData(response.data?.rooms || []);
      setStats(response.data?.stats || {});
    } catch (error) {
      console.error('Dashboard error:', error);
      message.error('Không thể tải dữ liệu dashboard');
      setRoomsData([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  // Load services and categories
  const loadServices = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get('/api/services/services/'),
        api.get('/api/services/categories/')
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      message.error('Не точмогать тямы дулиеу dịch vụ');
    }
  };

  // Load orders for selected room
  const loadRoomOrders = async (roomId) => {
    try {
      const response = await api.get(`/api/services/orders/?room=${roomId}`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Không thể tải đơn dịch vụ');
      setOrders([]);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadServices();
  }, []);

  // Room status color mapping
  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'occupied': return '#52c41a';
      case 'maintenance': return '#fa8c16';
      default: return '#d9d9d9';
    }
  };

  // Order status color mapping
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'preparing': return 'cyan';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  // Handle room click
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    loadRoomOrders(room.room_id);
    setOrderModalVisible(true);
  };

  // Update order status
  const updateOrderStatus = async (orderId, action) => {
    try {
      await api.patch(`/api/services/orders/${orderId}/`, { action });
      message.success('Cập nhật trạng thái thành công');
      loadRoomOrders(selectedRoom.room_id);
      loadDashboard();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  // Order columns for table
  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {status === 'pending' && 'Chờ xác nhận'}
          {status === 'confirmed' && 'Đã xác nhận'}
          {status === 'preparing' && 'Đang chuẩn bị'}
          {status === 'completed' && 'Hoàn thành'}
          {status === 'cancelled' && 'Đã hủy'}
        </Tag>
      )
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'red'}>
          {status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')} VND`
    },
    {
      title: 'Thời gian',
      dataIndex: 'ordered_at',
      key: 'ordered_at',
      render: (time) => new Date(time).toLocaleTimeString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => updateOrderStatus(record.id, 'confirm')}
            >
              Xác nhận
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button 
              size="small" 
              onClick={() => updateOrderStatus(record.id, 'preparing')}
            >
              Chuẩn bị
            </Button>
          )}
          {record.status === 'preparing' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => updateOrderStatus(record.id, 'completed')}
            >
              Hoàn thành
            </Button>
          )}
          {record.payment_status === 'unpaid' && (
            <Button 
              size="small" 
              type="link"
              onClick={() => updateOrderStatus(record.id, 'mark_paid')}
            >
              Đánh dấu đã thanh toán
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="service-orders">
      <Card>
        <Title level={3}>
          <CoffeeOutlined /> Quản lý dịch vụ phòng
        </Title>
        
        {/* Statistics */}
        <Row gutter={16} className="stats-row">
          <Col span={6}>
            <Card>
              <Statistic
                title="Đơn hàng hôm nay"
                value={stats.total_orders_today || 0}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang chờ xử lý"
                value={stats.pending_orders || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={stats.completed_orders || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Doanh thu hôm nay"
                value={stats.total_revenue_today || 0}
                prefix={<DollarOutlined />}
                suffix="VND"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Rooms Grid */}
        <Title level={4} style={{ marginTop: 24 }}>
          Danh sách phòng
        </Title>
        
        <Row gutter={[16, 16]} className="rooms-grid">
          {roomsData.map(room => (
            <Col key={room.room_id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="room-card"
                style={{ borderColor: getRoomStatusColor(room.status) }}
                onClick={() => handleRoomClick(room)}
              >
                <div className="room-header">
                  <Title level={5}>Phòng {room.room_number}</Title>
                  <Tag color={getRoomStatusColor(room.status)}>
                    {room.status === 'occupied' && 'Có khách'}
                    {room.status === 'maintenance' && 'Bảo trì'}
                  </Tag>
                </div>
                
                <div className="room-info">
                  <Text type="secondary">{room.room_type}</Text>
                  {room.customer_name && (
                    <div>
                      <Text strong>Khách: {room.customer_name}</Text>
                    </div>
                  )}
                </div>

                <div className="room-stats">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Badge 
                        count={room.orders_count} 
                        style={{ backgroundColor: '#52c41a' }}
                      >
                        <ShoppingCartOutlined /> Đơn hàng
                      </Badge>
                    </Col>
                    <Col span={12}>
                      {room.pending_orders > 0 && (
                        <Badge 
                          count={room.pending_orders} 
                          style={{ backgroundColor: '#fa8c16' }}
                        >
                          <ClockCircleOutlined /> Chờ xử lý
                        </Badge>
                      )}
                    </Col>
                  </Row>
                  
                  <div className="room-revenue">
                    <Text strong>
                      {room.total_today?.toLocaleString('vi-VN')} VND
                    </Text>
                    {room.has_unpaid_orders && (
                      <ExclamationCircleOutlined 
                        style={{ color: '#ff4d4f', marginLeft: 8 }} 
                        title="Có đơn chưa thanh toán"
                      />
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Room Orders Modal */}
      <Modal
        title={`Đơn dịch vụ - Phòng ${selectedRoom?.room_number}`}
        visible={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setOrderModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="new" type="primary" icon={<PlusOutlined />}>
            Thêm đơn mới
          </Button>
        ]}
      >
        {selectedRoom && (
          <div>
            <div className="room-modal-header">
              <Row>
                <Col span={12}>
                  <Text strong>Khách hàng: </Text>
                  <Text>{selectedRoom.customer_name || 'Khách vãng lai'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Loại phòng: </Text>
                  <Text>{selectedRoom.room_type}</Text>
                </Col>
              </Row>
            </div>

            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={false}
              loading={loading}
              expandable={{
                expandedRowRender: (record) => (
                  <div>
                    <Title level={5}>Chi tiết đơn hàng:</Title>
                    {record.items?.map(item => (
                      <div key={item.id} style={{ marginBottom: 8 }}>
                        <Text>{item.service_name}</Text>
                        <Text style={{ marginLeft: 16 }}>
                          x{item.quantity} {item.service_unit}
                        </Text>
                        <Text style={{ marginLeft: 16, color: '#fa8c16' }}>
                          {(item.quantity * item.unit_price)?.toLocaleString('vi-VN')} VND
                        </Text>
                        {item.notes && (
                          <div>
                            <Text type="secondary">Ghi chú: {item.notes}</Text>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceOrders;