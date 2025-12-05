import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Typography, Button, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeeManagement from '../../components/Admin/EmployeeManagement';
import CustomerManagement from '../../components/Admin/CustomerManagement';
import RoomManagement from '../../components/Admin/RoomManagement';
import BookingManagement from '../../components/Admin/BookingManagement';
import Services from '../Services/Services';
import EmployeeRevenueStats from '../../components/Statistics/EmployeeRevenueStats';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: 'Quản lý nhân viên',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Quản lý khách hàng',
    },
    {
      key: 'rooms',
      icon: <HomeOutlined />,
      label: 'Quản lý phòng',
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'Quản lý đặt phòng',
    },
    {
      key: 'services',
      icon: <CustomerServiceOutlined />,
      label: 'Quản lý dịch vụ',
      children: [
        {
          key: 'service-list',
          label: 'Danh sách dịch vụ',
        },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo & Thống kê',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt hệ thống',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Hotel Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[selectedMenuItem]}
          onClick={({ key }) => setSelectedMenuItem(key)}
          items={menuItems}
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
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
          }}
        >
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Bảng điều khiển quản trị
          </Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="text" icon={<BellOutlined />} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', maxWidth: '150px' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8, flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2'
                  }}>
                    <Text strong>Chào {user?.last_name}!</Text>
                  </div>
                  <div style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2'
                  }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Quản trị viên</Text>
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, overflow: 'initial' }}>
          {/* Render content based on selected menu item */}
          {selectedMenuItem === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <Card style={{ marginBottom: 24, textAlign: 'center' }}>
                <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
                  Chào mừng {user?.last_name || user?.first_name}!
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Chào mừng bạn đến với hệ thống quản lý khách sạn
                </Text>
              </Card>

              {/* Quick Actions */}
              <Card title="Thao tác nhanh">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Button 
                      block 
                      size="large" 
                      onClick={() => setSelectedMenuItem('employees')}
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TeamOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Quản lý nhân viên
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button 
                      block 
                      size="large"
                      onClick={() => setSelectedMenuItem('customers')}
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <UserOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Quản lý khách hàng
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button 
                      block 
                      size="large"
                      onClick={() => setSelectedMenuItem('rooms')}
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <HomeOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Quản lý phòng
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button 
                      block 
                      size="large"
                      onClick={() => setSelectedMenuItem('bookings')}
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <CalendarOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Quản lý đặt phòng
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button 
                      block 
                      size="large"
                      onClick={() => setSelectedMenuItem('service-list')}
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <CustomerServiceOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Quản lý dịch vụ
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button 
                      block 
                      size="large"
                      onClick={() => setSelectedMenuItem('reports')}
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <BarChartOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Xem báo cáo
                    </Button>
                  </Col>
                </Row>
              </Card>
            </>
          )}

          {/* Employee Management */}
          {selectedMenuItem === 'employees' && <EmployeeManagement />}

          {/* Customer Management */}
          {selectedMenuItem === 'customers' && <CustomerManagement />}

          {/* Room Management */}
          {selectedMenuItem === 'rooms' && <RoomManagement />}

          {/* Booking Management */}
          {selectedMenuItem === 'bookings' && <BookingManagement />}

          {/* Service Management */}
          {selectedMenuItem === 'service-list' && <Services />}

          {selectedMenuItem === 'reports' && <EmployeeRevenueStats />}

          {selectedMenuItem === 'settings' && (
            <Card title="Cài đặt hệ thống">
              <p>Tính năng cài đặt hệ thống sẽ được phát triển ở đây...</p>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;