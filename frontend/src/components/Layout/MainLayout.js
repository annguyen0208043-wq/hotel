import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider } = Layout;
const { Text } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Quản lý nhân viên',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: 'Quản lý khách hàng',
    },
    {
      key: 'rooms',
      icon: <HomeOutlined />,
      label: 'Quản lý phòng',
      children: [
        {
          key: '/rooms',
          label: 'Danh sách phòng',
        },
        {
          key: '/room-types',
          label: 'Loại phòng',
        },
      ],
    },
    {
      key: '/bookings',
      icon: <CalendarOutlined />,
      label: 'Đặt phòng',
    },
    {
      key: 'services',
      icon: <ShoppingOutlined />,
      label: 'Dịch vụ',
      children: [
        {
          key: '/services',
          label: 'Danh sách dịch vụ',
        },
        {
          key: '/service-orders',
          label: 'Đơn dịch vụ',
        },
      ],
    },
    {
      key: '/revenue',
      icon: <DollarOutlined />,
      label: 'Doanh thu',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        width={250}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: 'white',
          fontWeight: 'bold',
          fontSize: collapsed ? '16px' : '18px'
        }}>
          {collapsed ? 'HMS' : 'Hotel Management'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Text style={{ 
              maxWidth: '120px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              Xin chào, {user?.last_name}
            </Text>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar 
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>
        
        {children}
      </Layout>
    </Layout>
  );
};

export default MainLayout;