import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Statistic,
  Select,
  DatePicker,
  Typography,
  Progress,
  Tag,
  Spin,
  message,
  Space
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/charts';
import moment from 'moment';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeRevenueStats = () => {
  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);

  // Fetch employee revenue statistics
  const fetchEmployeeStats = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - in real app, this would come from API
      const mockData = [
        {
          id: 1,
          employee_name: 'Nguyễn Văn An',
          position: 'Quản lý',
          total_revenue: 150000000,
          bookings_handled: 45,
          avg_revenue_per_booking: 3333333,
          growth_rate: 12.5,
          performance_score: 95
        },
        {
          id: 2,
          employee_name: 'Trần Thị Bình',
          position: 'Nhân viên lễ tân',
          total_revenue: 120000000,
          bookings_handled: 38,
          avg_revenue_per_booking: 3157895,
          growth_rate: 8.3,
          performance_score: 88
        },
        {
          id: 3,
          employee_name: 'Lê Minh Cường',
          position: 'Nhân viên dịch vụ',
          total_revenue: 95000000,
          bookings_handled: 32,
          avg_revenue_per_booking: 2968750,
          growth_rate: -2.1,
          performance_score: 75
        },
        {
          id: 4,
          employee_name: 'Phạm Thị Diệu',
          position: 'Nhân viên lễ tân',
          total_revenue: 110000000,
          bookings_handled: 35,
          avg_revenue_per_booking: 3142857,
          growth_rate: 15.7,
          performance_score: 92
        },
        {
          id: 5,
          employee_name: 'Hoàng Văn Ean',
          position: 'Nhân viên dịch vụ',
          total_revenue: 85000000,
          bookings_handled: 28,
          avg_revenue_per_booking: 3035714,
          growth_rate: 5.2,
          performance_score: 80
        }
      ];

      setEmployeeStats(mockData);

      // Mock chart data for employee performance over time
      const mockChartData = [];
      for (let i = 0; i < 30; i++) {
        const date = moment().subtract(30 - i, 'days').format('YYYY-MM-DD');
        mockData.forEach(emp => {
          mockChartData.push({
            date,
            employee: emp.employee_name,
            revenue: Math.floor(emp.total_revenue / 30 * (0.8 + Math.random() * 0.4))
          });
        });
      }
      setChartData(mockChartData);

    } catch (error) {
      console.error('Error fetching employee stats:', error);
      message.error('Không thể tải thống kê nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeStats();
  }, [period, dateRange]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Table columns
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.position}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(value)}
        </Text>
      ),
      sorter: (a, b) => a.total_revenue - b.total_revenue,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Số đơn xử lý',
      dataIndex: 'bookings_handled',
      key: 'bookings_handled',
      render: (value) => <Text>{value} đơn</Text>,
      sorter: (a, b) => a.bookings_handled - b.bookings_handled,
    },
    {
      title: 'TB/Đơn',
      dataIndex: 'avg_revenue_per_booking',
      key: 'avg_revenue_per_booking',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.avg_revenue_per_booking - b.avg_revenue_per_booking,
    },
    {
      title: 'Tăng trưởng',
      dataIndex: 'growth_rate',
      key: 'growth_rate',
      render: (value) => (
        <Tag color={value >= 0 ? 'green' : 'red'}>
          {value >= 0 ? '+' : ''}{value}%
        </Tag>
      ),
      sorter: (a, b) => a.growth_rate - b.growth_rate,
    },
    {
      title: 'Hiệu suất',
      dataIndex: 'performance_score',
      key: 'performance_score',
      render: (value) => (
        <div style={{ width: 100 }}>
          <Progress
            percent={value}
            size="small"
            strokeColor={
              value >= 90 ? '#52c41a' : 
              value >= 80 ? '#1890ff' :
              value >= 70 ? '#fa8c16' : '#f5222d'
            }
            format={() => `${value}%`}
          />
        </div>
      ),
      sorter: (a, b) => a.performance_score - b.performance_score,
    },
  ];

  // Chart configuration
  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'revenue',
    seriesField: 'employee',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    slider: {
      start: 0.8,
      end: 1,
    },
  };

  // Calculate summary statistics
  const totalRevenue = employeeStats.reduce((sum, emp) => sum + emp.total_revenue, 0);
  const totalBookings = employeeStats.reduce((sum, emp) => sum + emp.bookings_handled, 0);
  const avgPerformance = employeeStats.reduce((sum, emp) => sum + emp.performance_score, 0) / employeeStats.length;
  const topPerformer = employeeStats.reduce((top, emp) => 
    emp.total_revenue > (top?.total_revenue || 0) ? emp : top, null
  );

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải thống kê nhân viên...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>
          <TrophyOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Thống kê doanh thu nhân viên
        </Title>
        
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text>Khoảng thời gian:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 280 }}
              />
            </Space>
          </Col>
          <Col>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value="week">Tuần</Option>
              <Option value="month">Tháng</Option>
              <Option value="quarter">Quý</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn xử lý"
              value={totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hiệu suất trung bình"
              value={avgPerformance || 0}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Nhân viên xuất sắc"
              value={topPerformer?.employee_name || 'N/A'}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: 16 }}
            />
            {topPerformer && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatCurrency(topPerformer.total_revenue)}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Biểu đồ doanh thu theo thời gian">
            <Line {...chartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Employee Performance Table */}
      <Card title="Bảng chi tiết hiệu suất nhân viên">
        <Table
          columns={columns}
          dataSource={employeeStats}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default EmployeeRevenueStats;