import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Tabs, 
  Select, 
  DatePicker,
  Table,
  Tag,
  Progress,
  Spin,
  message,
  Button
} from 'antd';
import { 
  DollarOutlined, 
  HomeOutlined, 
  UserOutlined, 
  PercentageOutlined,
  TrophyOutlined,
  RiseOutlined,
  BugOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import moment from 'moment';
import api from '../../services/api';
import RevenueTester from '../../components/Test/RevenueTester';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Revenue = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [chartType, setChartType] = useState('daily');
  const [chartPeriod, setChartPeriod] = useState(30);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/revenue/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    }
  };

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      const response = await api.get(`/revenue/chart/?type=${chartType}&period=${chartPeriod}`);
      setChartData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      message.error('Không thể tải dữ liệu biểu đồ');
    }
  };

  // Fetch customer analytics
  const fetchCustomerAnalytics = async () => {
    try {
      const response = await api.get('/revenue/customer-analytics/');
      setCustomerAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      message.error('Không thể tải dữ liệu khách hàng');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchChartData(),
        fetchCustomerAnalytics()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchChartData();
    }
  }, [chartType, chartPeriod]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Chart configurations
  const lineChartConfig = {
    data: chartData,
    xField: chartType === 'daily' ? 'date' : (chartType === 'monthly' ? 'date' : 'date'),
    yField: 'total_revenue',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#1890ff', '#52c41a', '#fa8c16'],
  };

  const columnChartConfig = {
    data: chartData,
    xField: chartType === 'daily' ? 'date' : 'date',
    yField: 'total_revenue',
    color: '#1890ff',
    columnWidthRatio: 0.6,
    meta: {
      total_revenue: {
        formatter: (value) => formatCurrency(value),
      },
    },
  };

  // Customer tier distribution
  const tierColors = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0', 
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2'
  };

  const tierData = customerAnalytics?.loyalty_stats?.map(item => ({
    type: item.tier,
    value: item.count,
  })) || [];

  const pieChartConfig = {
    appendPadding: 10,
    data: tierData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: (datum) => tierColors[datum.type] || '#1890ff',
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  // Top customers table columns
  const customerColumns = [
    {
      title: 'Khách hàng',
      dataIndex: ['customer_detail', 'full_name'],
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: ['customer_detail', 'email'],
      key: 'email',
    },
    {
      title: 'Hạng thành viên',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier) => (
        <Tag color={tierColors[tier] ? 'gold' : 'blue'}>
          {tier}
        </Tag>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.total_spent - b.total_spent,
    },
    {
      title: 'Số lần đặt phòng',
      dataIndex: 'total_bookings',
      key: 'total_bookings',
      sorter: (a, b) => a.total_bookings - b.total_bookings,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải dữ liệu doanh thu...</Text>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <Title level={3}>Quản lý doanh thu</Title>
        <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <DollarOutlined /> Dashboard Doanh Thu
      </Title>

      {/* Overview Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={dashboardData.today?.revenue || 0}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Text type="secondary">
              {calculatePercentageChange(
                dashboardData.today?.revenue || 0,
                dashboardData.yesterday?.revenue || 0
              )}% so với hôm qua
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng này"
              value={dashboardData.this_month?.revenue || 0}
              formatter={(value) => formatCurrency(value)}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">
              {calculatePercentageChange(
                dashboardData.this_month?.revenue || 0,
                dashboardData.last_month?.revenue || 0
              )}% so với tháng trước
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ lấp đầy"
              value={dashboardData.room_stats?.occupancy_rate || 0}
              suffix="%"
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <Progress
              percent={dashboardData.room_stats?.occupancy_rate || 0}
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách hàng thân thiết"
              value={customerAnalytics?.returning_customers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary">
              /{customerAnalytics?.total_customers || 0} tổng khách hàng
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="API Test" key="0">
          <RevenueTester />
        </TabPane>
        <TabPane tab="Biểu đồ doanh thu" key="1">
          <Card title="Thống kê doanh thu">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Select
                  value={chartType}
                  onChange={setChartType}
                  style={{ width: '100%' }}
                >
                  <Option value="daily">Theo ngày</Option>
                  <Option value="monthly">Theo tháng</Option>
                  <Option value="yearly">Theo năm</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Select
                  value={chartPeriod}
                  onChange={setChartPeriod}
                  style={{ width: '100%' }}
                >
                  {chartType === 'daily' && (
                    <>
                      <Option value={7}>7 ngày gần nhất</Option>
                      <Option value={30}>30 ngày gần nhất</Option>
                      <Option value={90}>90 ngày gần nhất</Option>
                    </>
                  )}
                  {chartType === 'monthly' && (
                    <>
                      <Option value={6}>6 tháng gần nhất</Option>
                      <Option value={12}>12 tháng gần nhất</Option>
                    </>
                  )}
                  {chartType === 'yearly' && (
                    <>
                      <Option value={3}>3 năm gần nhất</Option>
                      <Option value={5}>5 năm gần nhất</Option>
                    </>
                  )}
                </Select>
              </Col>
            </Row>
            <Column {...columnChartConfig} />
          </Card>
        </TabPane>

        <TabPane tab="Phân tích khách hàng" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Phân bố hạng thành viên">
                <Pie {...pieChartConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Top khách hàng VIP">
                <Table
                  dataSource={dashboardData.top_customers || []}
                  columns={customerColumns}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Thống kê chi tiết" key="3">
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng phòng"
                  value={dashboardData.room_stats?.total_rooms || 0}
                  prefix={<HomeOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Phòng đang sử dụng"
                  value={dashboardData.room_stats?.occupied_rooms || 0}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Phòng còn trống"
                  value={dashboardData.room_stats?.available_rooms || 0}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card title="Khách hàng mới tháng này">
                <Statistic
                  value={customerAnalytics?.new_customers_this_month || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Doanh thu năm nay">
                <Statistic
                  value={dashboardData.this_year?.revenue || 0}
                  formatter={(value) => formatCurrency(value)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Revenue;