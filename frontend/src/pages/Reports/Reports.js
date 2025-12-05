import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  DatePicker, 
  Select, 
  Row, 
  Col, 
  Button,
  Statistic,
  Tag,
  Space,
  message,
  Spin
} from 'antd';
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  CalendarOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import api from '../../services/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);

  // Fetch revenue reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        type: reportType,
        date_from: dateRange[0].format('YYYY-MM-DD'),
        date_to: dateRange[1].format('YYYY-MM-DD')
      };

      const response = await api.get('/revenue/reports/', { params });
      
      if (Array.isArray(response.data)) {
        setReports(response.data);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        setReports(response.data.results);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Không thể tải dữ liệu báo cáo');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate new report
  const generateReport = async () => {
    setLoading(true);
    try {
      const reportData = {
        report_date: moment().format('YYYY-MM-DD'),
        report_type: reportType
      };

      await api.post('/revenue/reports/generate_report/', reportData);
      message.success('Tạo báo cáo thành công!');
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Không thể tạo báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange]);

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
      title: 'Ngày báo cáo',
      dataIndex: 'report_date',
      key: 'report_date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.report_date).unix() - moment(b.report_date).unix(),
    },
    {
      title: 'Loại báo cáo',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (type) => {
        const typeMap = {
          daily: { text: 'Ngày', color: 'blue' },
          weekly: { text: 'Tuần', color: 'green' },
          monthly: { text: 'Tháng', color: 'orange' },
          yearly: { text: 'Năm', color: 'red' }
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Doanh thu phòng',
      dataIndex: 'room_revenue',
      key: 'room_revenue',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => parseFloat(a.room_revenue) - parseFloat(b.room_revenue),
    },
    {
      title: 'Doanh thu dịch vụ',
      dataIndex: 'service_revenue',
      key: 'service_revenue',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => parseFloat(a.service_revenue) - parseFloat(b.service_revenue),
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value) => <strong>{formatCurrency(value)}</strong>,
      sorter: (a, b) => parseFloat(a.total_revenue) - parseFloat(b.total_revenue),
    },
    {
      title: 'Số đặt phòng',
      dataIndex: 'total_bookings',
      key: 'total_bookings',
      sorter: (a, b) => a.total_bookings - b.total_bookings,
    },
    {
      title: 'Tỷ lệ lấp đầy (%)',
      dataIndex: 'occupancy_rate',
      key: 'occupancy_rate',
      render: (value) => `${value}%`,
      sorter: (a, b) => parseFloat(a.occupancy_rate) - parseFloat(b.occupancy_rate),
    },
    {
      title: 'ADR',
      dataIndex: 'adr',
      key: 'adr',
      render: (value) => value ? formatCurrency(value) : '-',
    },
    {
      title: 'RevPAR',
      dataIndex: 'revpar',
      key: 'revpar',
      render: (value) => value ? formatCurrency(value) : '-',
    }
  ];

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reports.length) return null;

    const summary = reports.reduce((acc, report) => {
      acc.totalRevenue += parseFloat(report.total_revenue || 0);
      acc.totalBookings += parseInt(report.total_bookings || 0);
      acc.avgOccupancy += parseFloat(report.occupancy_rate || 0);
      return acc;
    }, { totalRevenue: 0, totalBookings: 0, avgOccupancy: 0 });

    summary.avgOccupancy = summary.avgOccupancy / reports.length;

    return summary;
  };

  const summary = calculateSummary();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <FileTextOutlined /> Báo cáo Doanh thu
      </Title>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
              placeholder="Chọn loại báo cáo"
            >
              <Option value="daily">Báo cáo ngày</Option>
              <Option value="weekly">Báo cáo tuần</Option>
              <Option value="monthly">Báo cáo tháng</Option>
              <Option value="yearly">Báo cáo năm</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button 
              type="primary" 
              onClick={generateReport}
              loading={loading}
              icon={<CalendarOutlined />}
            >
              Tạo báo cáo
            </Button>
          </Col>
          <Col span={4}>
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => message.info('Tính năng xuất báo cáo sẽ sớm được cập nhật')}
            >
              Xuất Excel
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      {summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu trong khoảng thời gian"
                value={summary.totalRevenue}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số đặt phòng"
                value={summary.totalBookings}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tỷ lệ lấp đầy trung bình"
                value={summary.avgOccupancy}
                precision={2}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Reports Table */}
      <Card title={`Danh sách báo cáo ${reportType === 'daily' ? 'ngày' : reportType === 'monthly' ? 'tháng' : 'năm'}`}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={reports}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} báo cáo`,
            }}
            scroll={{ x: 1200 }}
            size="small"
          />
        )}
      </Card>
    </div>
  );
};

export default Reports;