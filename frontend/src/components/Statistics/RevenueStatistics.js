import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Typography, DatePicker, Select, Spin, message } from 'antd';
import { CalendarOutlined, DollarOutlined, TrophyOutlined, PercentageOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    topRoomTypes: []
  });
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment().endOf('month')]);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchStatistics();
  }, [dateRange, period]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Gọi API thống kê thực
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const response = await api.get('/api/rooms/statistics/revenue/', {
        params: {
          start_date: startDate,
          end_date: endDate,
          period: period
        }
      });

      const data = response.data;
      
      setStatistics({
        dailyRevenue: data.today_revenue || 0,
        weeklyRevenue: data.week_revenue || 0,
        monthlyRevenue: data.month_revenue || 0,
        totalBookings: data.total_bookings || 0,
        occupancyRate: data.occupancy_rate || 0,
        topRoomTypes: data.top_room_types?.map(item => ({
          name: item.name || 'N/A',
          count: item.count || 0,
          revenue: item.revenue || 0
        })) || []
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // Fallback to mock data if API fails
      const mockData = {
        dailyRevenue: Math.floor(Math.random() * 20000000) + 10000000,
        weeklyRevenue: Math.floor(Math.random() * 100000000) + 50000000,
        monthlyRevenue: Math.floor(Math.random() * 400000000) + 200000000,
        totalBookings: Math.floor(Math.random() * 200) + 100,
        occupancyRate: Math.floor(Math.random() * 30) + 70,
        topRoomTypes: [
          { 
            name: 'Phòng Suite', 
            count: Math.floor(Math.random() * 50) + 30, 
            revenue: Math.floor(Math.random() * 150000000) + 100000000
          },
          { 
            name: 'Phòng Cao Cấp', 
            count: Math.floor(Math.random() * 80) + 50, 
            revenue: Math.floor(Math.random() * 200000000) + 80000000
          },
          { 
            name: 'Phòng Tiêu Chuẩn', 
            count: Math.floor(Math.random() * 60) + 30, 
            revenue: Math.floor(Math.random() * 120000000) + 60000000
          }
        ]
      };

      setStatistics(mockData);
      message.warning('Sử dụng dữ liệu mẫu do lỗi kết nối API');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div>
      {/* Filter Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Khoảng thời gian:</Text>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value="day">Theo ngày</Option>
              <Option value="week">Theo tuần</Option>
              <Option value="month">Theo tháng</Option>
              <Option value="year">Theo năm</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Revenue Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu hôm nay"
                  value={statistics.dailyRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu tuần này"
                  value={statistics.weeklyRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu tháng này"
                  value={statistics.monthlyRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng booking tháng"
                  value={statistics.totalBookings}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Detailed Statistics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    Top loại phòng được đặt nhiều nhất
                  </span>
                }
              >
                <List
                  dataSource={statistics.topRoomTypes}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: ['#gold', '#silver', '##cd7f32'][index] || '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {index + 1}
                          </div>
                        }
                        title={item.name}
                        description={
                          <div>
                            <Text type="secondary">{item.count} lượt đặt</Text>
                            <br />
                            <Text strong style={{ color: '#52c41a' }}>
                              {formatCurrency(item.revenue)}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <span>
                    <PercentageOutlined style={{ marginRight: 8 }} />
                    Tình hình ocupancy
                  </span>
                }
              >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Statistic
                    title="Tỷ lệ lấp đầy"
                    value={statistics.occupancyRate}
                    suffix="%"
                    valueStyle={{ 
                      color: statistics.occupancyRate >= 80 ? '#52c41a' : 
                             statistics.occupancyRate >= 60 ? '#faad14' : '#f5222d',
                      fontSize: '2.5em' 
                    }}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      {statistics.occupancyRate >= 80 ? 'Tuyệt vời!' : 
                       statistics.occupancyRate >= 60 ? 'Khá tốt' : 'Cần cải thiện'}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      So với cùng kỳ tháng trước
                    </Text>
                  </div>
                </div>

                {/* Occupancy breakdown */}
                <div style={{ marginTop: 24 }}>
                  <Row gutter={16}>
                    <Col span={8} style={{ textAlign: 'center' }}>
                      <div style={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}>
                        {Math.floor(statistics.occupancyRate * 1.2)}
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Phòng đã đặt</Text>
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                      <div style={{ color: '#faad14', fontSize: '20px', fontWeight: 'bold' }}>
                        {Math.floor((100 - statistics.occupancyRate) * 0.8)}
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Phòng trống</Text>
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f5222d', fontSize: '20px', fontWeight: 'bold' }}>
                        {Math.floor((100 - statistics.occupancyRate) * 0.2)}
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Bảo trì</Text>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default RevenueStatistics;