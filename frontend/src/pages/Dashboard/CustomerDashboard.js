import React from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Button, Avatar, Dropdown, List, Tag, Image } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  StarOutlined,
  SearchOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Trang chủ',
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: 'Tìm phòng',
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'Đặt phòng của tôi',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'Lịch sử',
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: 'Yêu thích',
    },
  ];

  const currentBookings = [
    {
      id: 1,
      roomNumber: '101',
      roomType: 'Deluxe',
      checkIn: '2025-10-05',
      checkOut: '2025-10-08',
      status: 'confirmed',
      price: 1200000
    },
    {
      id: 2,
      roomNumber: '205',
      roomType: 'Suite',
      checkIn: '2025-10-15',
      checkOut: '2025-10-18',
      status: 'pending',
      price: 2500000
    }
  ];

  const recommendedRooms = [
    {
      id: 1,
      name: 'Phòng Deluxe',
      image: 'https://via.placeholder.com/300x200',
      price: 1200000,
      rating: 4.5,
      features: ['WiFi miễn phí', 'Điều hòa', 'TV LCD']
    },
    {
      id: 2,
      name: 'Phòng Suite',
      image: 'https://via.placeholder.com/300x200',
      price: 2500000,
      rating: 4.8,
      features: ['View biển', 'Jacuzzi', 'Balcony']
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
        }}
      >
        <div style={{ 
          height: 64, 
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Hotel Guest
          </Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <Title level={4} style={{ margin: 0, color: '#722ed1' }}>
            Chào mừng quay trở lại!
          </Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="text" icon={<BellOutlined />} />
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <div>
                  <Text strong>{user?.first_name} {user?.last_name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Khách hàng</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, overflow: 'initial' }}>
          {/* Welcome Section */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <Row align="middle">
                  <Col xs={24} md={16}>
                    <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
                      Xin chào, {user?.first_name}!
                    </Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 16 }}>
                      Cảm ơn bạn đã chọn khách sạn của chúng tôi. Hãy khám phá những trải nghiệm tuyệt vời!
                    </Paragraph>
                    <Button type="primary" size="large" icon={<SearchOutlined />}>
                      Đặt phòng ngay
                    </Button>
                  </Col>
                  <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, opacity: 0.3 }}>
                      🏨
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ textAlign: 'center', height: 120 }}
                bodyStyle={{ padding: 24 }}
              >
                <SearchOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                <div style={{ fontWeight: 600 }}>Tìm phòng</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ textAlign: 'center', height: 120 }}
                bodyStyle={{ padding: 24 }}
              >
                <CalendarOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                <div style={{ fontWeight: 600 }}>Đặt phòng</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ textAlign: 'center', height: 120 }}
                bodyStyle={{ padding: 24 }}
              >
                <HistoryOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                <div style={{ fontWeight: 600 }}>Lịch sử</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                style={{ textAlign: 'center', height: 120 }}
                bodyStyle={{ padding: 24 }}
              >
                <UserOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
                <div style={{ fontWeight: 600 }}>Tài khoản</div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Current Bookings */}
            <Col xs={24} lg={12}>
              <Card title="Đặt phòng hiện tại" extra={<Button type="link">Xem tất cả</Button>}>
                <List
                  itemLayout="vertical"
                  dataSource={currentBookings}
                  renderItem={booking => (
                    <List.Item
                      key={booking.id}
                      extra={
                        <Tag color={booking.status === 'confirmed' ? 'green' : 'orange'}>
                          {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                        </Tag>
                      }
                    >
                      <List.Item.Meta
                        title={`Phòng ${booking.roomNumber} - ${booking.roomType}`}
                        description={
                          <div>
                            <div>📅 {booking.checkIn} → {booking.checkOut}</div>
                            <div style={{ marginTop: 4, fontWeight: 600, color: '#1890ff' }}>
                              💰 {booking.price.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Recommended Rooms */}
            <Col xs={24} lg={12}>
              <Card title="Phòng được đề xuất" extra={<Button type="link">Xem thêm</Button>}>
                <List
                  itemLayout="vertical"
                  dataSource={recommendedRooms}
                  renderItem={room => (
                    <List.Item
                      key={room.id}
                      actions={[
                        <Button type="primary" size="small">Đặt ngay</Button>,
                        <Button type="text" icon={<HeartOutlined />} size="small">Yêu thích</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Image width={60} height={60} src={room.image} style={{ borderRadius: 8 }} />}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{room.name}</span>
                            <div>
                              <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
                              {room.rating}
                            </div>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              {room.features.map(feature => (
                                <Tag key={feature} size="small">{feature}</Tag>
                              ))}
                            </div>
                            <Text strong style={{ color: '#1890ff' }}>
                              {room.price.toLocaleString('vi-VN')} VNĐ/đêm
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomerDashboard;