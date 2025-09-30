import React from 'react';
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
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
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
      key: 'services',
      icon: <CustomerServiceOutlined />,
      label: 'Quản lý dịch vụ',
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
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <div>
                  <Text strong>{user?.first_name} {user?.last_name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Quản trị viên</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, overflow: 'initial' }}>
          {/* Dashboard Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số phòng"
                  value={120}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Phòng đã đặt"
                  value={85}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nhân viên"
                  value={25}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu tháng"
                  value={1500000000}
                  prefix="₫"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card 
                title="Thao tác nhanh" 
                extra={<Button type="primary" icon={<PlusOutlined />}>Thêm mới</Button>}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large" 
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TeamOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Thêm nhân viên
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large"
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <HomeOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Thêm phòng
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large"
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <CustomerServiceOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Thêm dịch vụ
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large"
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <BarChartOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Xem báo cáo
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Recent Activities */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Hoạt động gần đây" size="small">
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {[1, 2, 3, 4, 5].map(item => (
                    <div key={item} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Text strong>Đặt phòng mới #{item}001</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Khách hàng: Nguyễn Văn A - 5 phút trước
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Thông báo hệ thống" size="small">
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {[1, 2, 3].map(item => (
                    <div key={item} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Text strong>Cảnh báo: Phòng 10{item} cần bảo trì</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item} giờ trước
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;