import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import {
  DollarOutlined,
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useQuery } from 'react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { revenueService } from '../../services';

const { Title } = Typography;

const Dashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    revenueService.getDashboard
  );

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery(
    'monthly-chart',
    revenueService.getMonthlyChart
  );

  if (dashboardLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const stats = dashboardData?.data || {};

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.today_revenue || 0}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng này"
              value={stats.month_revenue || 0}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ lấp đầy"
              value={stats.occupancy_rate || 0}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              prefix={<HomeOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phòng đang sử dụng"
              value={stats.occupied_rooms || 0}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<UserOutlined />}
              suffix={`/${stats.total_rooms || 0}`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Monthly Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 12 tháng gần nhất" loading={monthlyLoading}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyData?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      new Intl.NumberFormat('vi-VN').format(value) + ' VND',
                      name === 'room_revenue' ? 'Doanh thu phòng' : 
                      name === 'service_revenue' ? 'Doanh thu dịch vụ' : 'Tổng doanh thu'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="room_revenue" 
                    stroke="#1890ff" 
                    strokeWidth={2}
                    name="room_revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="service_revenue" 
                    stroke="#52c41a" 
                    strokeWidth={2}
                    name="service_revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    stroke="#722ed1" 
                    strokeWidth={2}
                    name="total_revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Top Services */}
        <Col xs={24} lg={8}>
          <Card title="Top 5 dịch vụ bán chạy">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.top_services || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service__name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'total_quantity' ? value + ' lần' : 
                      new Intl.NumberFormat('vi-VN').format(value) + ' VND',
                      name === 'total_quantity' ? 'Số lượng' : 'Doanh thu'
                    ]}
                  />
                  <Bar dataKey="total_revenue" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;