import React from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Typography, Button, Avatar, Dropdown, List, Badge } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const EmployeeDashboard = () => {
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
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'Quản lý đặt phòng',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
    },
    {
      key: 'rooms',
      icon: <HomeOutlined />,
      label: 'Trạng thái phòng',
    },
    {
      key: 'services',
      icon: <CustomerServiceOutlined />,
      label: 'Dịch vụ',
    },
  ];

  const todayTasks = [
    { id: 1, task: 'Check-in phòng 101', time: '14:00', status: 'pending' },
    { id: 2, task: 'Check-out phòng 205', time: '11:00', status: 'completed' },
    { id: 3, task: 'Dọn phòng 103', time: '15:30', status: 'pending' },
    { id: 4, task: 'Báo cáo cuối ngày', time: '18:00', status: 'pending' },
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
          Hotel Staff
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
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
            Bảng điều khiển nhân viên
          </Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <div>
                  <Text strong>{user?.first_name} {user?.last_name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhân viên</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, overflow: 'initial' }}>
          {/* Today's Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Check-in hôm nay"
                  value={12}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Check-out hôm nay"
                  value={8}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Phòng trống"
                  value={35}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nhiệm vụ còn lại"
                  value={3}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card title="Thao tác nhanh">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      type="primary"
                      block 
                      size="large" 
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <UserOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Check-in
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large"
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <UserOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Check-out
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large"
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <HomeOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Trạng thái phòng
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      size="large"
                      style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <CustomerServiceOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      Dịch vụ
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Nhiệm vụ hôm nay" extra={<Badge count={3} />}>
                <List
                  itemLayout="horizontal"
                  dataSource={todayTasks}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        item.status === 'completed' ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <Button size="small" type="primary">
                            Hoàn thành
                          </Button>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Text 
                            style={{ 
                              textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                              color: item.status === 'completed' ? '#999' : 'inherit'
                            }}
                          >
                            {item.task}
                          </Text>
                        }
                        description={`Thời gian: ${item.time}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="Hoạt động gần đây">
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {[1, 2, 3, 4, 5].map(item => (
                    <div key={item} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Text strong>Check-in phòng 10{item}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Khách: Trần Thị B - {item * 10} phút trước
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

export default EmployeeDashboard;