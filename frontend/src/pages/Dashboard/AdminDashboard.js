import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Typography, Button, Avatar, Dropdown, Spin, message, Tabs } from 'antd';
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
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeeManagement from '../../components/Admin/EmployeeManagement';
import CustomerManagement from '../../components/Admin/CustomerManagement';
import RoomManagement from '../../components/Admin/RoomManagement';
import BookingManagement from '../../components/Admin/BookingManagement';
import Services from '../Services/Services';
import ServiceOrders from '../Services/ServiceOrders';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, chartResponse] = await Promise.all([
          api.get('/revenue/dashboard/'),
          api.get('/revenue/chart/?type=daily&period=7')
        ]);
        setDashboardData(dashboardResponse.data);
        setChartData(chartResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

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
        {
          key: 'service-orders',
          label: 'Đơn dịch vụ',
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
              {/* Dashboard Statistics */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Đang tải dữ liệu dashboard...</p>
                </div>
              ) : (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Doanh thu hôm nay"
                          value={dashboardData?.today?.revenue || 0}
                          formatter={(value) => formatCurrency(value)}
                          prefix={<DollarOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Booking hôm nay"
                          value={dashboardData?.today?.bookings || 0}
                          prefix={<CalendarOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Tỷ lệ lấp đầy"
                          value={dashboardData?.room_stats?.occupancy_rate || 0}
                          suffix="%"
                          prefix={<HomeOutlined />}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="Doanh thu tháng"
                          value={dashboardData?.this_month?.revenue || 0}
                          formatter={(value) => formatCurrency(value)}
                          prefix={<RiseOutlined />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  {/* Additional Stats Row */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small">
                        <Statistic
                          title="Tổng số phòng"
                          value={dashboardData?.room_stats?.total_rooms || 0}
                          valueStyle={{ fontSize: '16px' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small">
                        <Statistic
                          title="Phòng đang sử dụng"
                          value={dashboardData?.room_stats?.occupied_rooms || 0}
                          valueStyle={{ fontSize: '16px', color: '#f50' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small">
                        <Statistic
                          title="Phòng còn trống"
                          value={dashboardData?.room_stats?.available_rooms || 0}
                          valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small">
                        <Statistic
                          title="Khách hàng VIP"
                          value={dashboardData?.top_customers?.length || 0}
                          valueStyle={{ fontSize: '16px', color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </>
              )}

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
                          onClick={() => setSelectedMenuItem('employees')}
                          style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <TeamOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                          Quản lý nhân viên
                        </Button>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
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
                      <Col xs={24} sm={12} md={6}>
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
                      <Col xs={24} sm={12} md={6}>
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
                      <Col xs={24} sm={12} md={6}>
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
          
          {/* Service Orders */}
          {selectedMenuItem === 'service-orders' && <ServiceOrders />}

          {selectedMenuItem === 'reports' && (
            <div>
              <Title level={3} style={{ marginBottom: 24 }}>
                <BarChartOutlined /> Báo cáo & Thống kê Doanh thu
              </Title>
              
              {loading ? (
                <Card>
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Đang tải dữ liệu báo cáo...</p>
                  </div>
                </Card>
              ) : (
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Tổng quan" key="1">
                    {/* Revenue Overview */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col xs={24} sm={12} md={8}>
                        <Card>
                          <Statistic
                            title="Doanh thu hôm nay"
                            value={dashboardData?.today?.revenue || 0}
                            formatter={(value) => formatCurrency(value)}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                          />
                          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                            {dashboardData?.today?.bookings || 0} booking • {dashboardData?.today?.guests || 0} khách
                          </p>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Card>
                          <Statistic
                            title="Doanh thu tháng này"
                            value={dashboardData?.this_month?.revenue || 0}
                            formatter={(value) => formatCurrency(value)}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                          />
                          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                            {dashboardData?.this_month?.bookings || 0} booking • {dashboardData?.this_month?.guests || 0} khách
                          </p>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Card>
                          <Statistic
                            title="Doanh thu năm nay"
                            value={dashboardData?.this_year?.revenue || 0}
                            formatter={(value) => formatCurrency(value)}
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                          />
                          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                            {dashboardData?.this_year?.bookings || 0} booking • {dashboardData?.this_year?.guests || 0} khách
                          </p>
                        </Card>
                      </Col>
                    </Row>

                    {/* Room Statistics */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col xs={24} lg={12}>
                        <Card title="Thông tin phòng">
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="Tổng số phòng"
                                value={dashboardData?.room_stats?.total_rooms || 0}
                                valueStyle={{ fontSize: '18px' }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Tỷ lệ lấp đầy"
                                value={dashboardData?.room_stats?.occupancy_rate || 0}
                                suffix="%"
                                valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                              />
                            </Col>
                          </Row>
                          <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                              <Statistic
                                title="Đang sử dụng"
                                value={dashboardData?.room_stats?.occupied_rooms || 0}
                                valueStyle={{ fontSize: '16px', color: '#f50' }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Còn trống"
                                value={dashboardData?.room_stats?.available_rooms || 0}
                                valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                              />
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Card title="Top khách hàng VIP">
                          {dashboardData?.top_customers?.length > 0 ? (
                            <div style={{ maxHeight: 200, overflow: 'auto' }}>
                              {dashboardData.top_customers.slice(0, 5).map((customer, index) => (
                                <div key={customer.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                      <Text strong>#{index + 1} {customer.customer_detail?.full_name || 'N/A'}</Text>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        {customer.tier} • {customer.total_bookings} lần đặt
                                      </Text>
                                    </div>
                                    <Text strong style={{ color: '#52c41a' }}>
                                      {formatCurrency(customer.total_spent)}
                                    </Text>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>Chưa có dữ liệu khách hàng</p>
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>

                  <TabPane tab="Biểu đồ doanh thu" key="2">
                    <Card title="Doanh thu 7 ngày gần nhất">
                      {chartData.length > 0 ? (
                        <Column
                          data={chartData}
                          xField="date"
                          yField="total_revenue"
                          color="#1890ff"
                          columnWidthRatio={0.6}
                          meta={{
                            total_revenue: {
                              formatter: (value) => formatCurrency(value),
                            },
                          }}
                        />
                      ) : (
                        <p style={{ textAlign: 'center', padding: '50px' }}>
                          Chưa có dữ liệu biểu đồ
                        </p>
                      )}
                    </Card>
                  </TabPane>

                  <TabPane tab="Truy cập nhanh" key="3">
                    <Card title="Các chức năng quản lý">
                      <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                          <Button 
                            type="primary" 
                            size="large" 
                            block 
                            icon={<BarChartOutlined />}
                            onClick={() => window.open('/revenue', '_blank')}
                            style={{ height: '60px' }}
                          >
                            Dashboard<br />Doanh thu
                          </Button>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Button 
                            type="default" 
                            size="large" 
                            block 
                            icon={<CalendarOutlined />}
                            onClick={() => window.open('/reports', '_blank')}
                            style={{ height: '60px' }}
                          >
                            Báo cáo<br />Chi tiết
                          </Button>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Button 
                            type="default" 
                            size="large" 
                            block 
                            icon={<UserOutlined />}
                            onClick={() => setSelectedMenuItem('customers')}
                            style={{ height: '60px' }}
                          >
                            Quản lý<br />Khách hàng
                          </Button>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Button 
                            type="default" 
                            size="large" 
                            block 
                            icon={<HomeOutlined />}
                            onClick={() => setSelectedMenuItem('bookings')}
                            style={{ height: '60px' }}
                          >
                            Quản lý<br />Đặt phòng
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  </TabPane>
                </Tabs>
              )}
            </div>
          )}

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