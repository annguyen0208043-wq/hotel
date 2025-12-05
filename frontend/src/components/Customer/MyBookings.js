import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, Tag, Button, Space, Modal, Descriptions, 
  message, Typography, Row, Col, Statistic, Empty,
  Popconfirm, Timeline, Rate, Input
} from 'antd';
import SafeTable from '../Common/SafeTable';
import SimpleTable from '../Common/SimpleTable';
import {
  CalendarOutlined, HomeOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, 
  CloseCircleOutlined, EyeOutlined, DeleteOutlined,
  StarOutlined, CommentOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [stats, setStats] = useState({ total: 0, confirmed: 0, checkedIn: 0, completed: 0 });

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('Fetching my bookings...');
      const response = await api.get('/api/rooms/bookings/my_bookings/');
      console.log('API Response:', response);
      
      // Validate and process response
      let bookingsData = [];
      if (response?.data) {
        console.log('Response data type:', typeof response.data);
        console.log('Response data:', response.data);
        
        if (Array.isArray(response.data)) {
          bookingsData = response.data;
          console.log('Data is array, length:', bookingsData.length);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          bookingsData = response.data.results;
          console.log('Data.results is array, length:', bookingsData.length);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      }
      
      // Ensure all bookings have required fields
      const validBookings = bookingsData.filter(booking => 
        booking && 
        typeof booking === 'object' && 
        booking.id
      );
      
      setBookings(validBookings);
      
      // Update statistics
      const newStats = {
        total: validBookings.length,
        confirmed: validBookings.filter(b => b.status === 'confirmed').length,
        checkedIn: validBookings.filter(b => b.status === 'checked_in').length,
        completed: validBookings.filter(b => b.status === 'checked_out').length
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Fetch bookings error:', error);
      message.error('Không thể tải danh sách đặt phòng');
      setBookings([]);
      setStats({ total: 0, confirmed: 0, checkedIn: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      await api.patch(`/api/rooms/bookings/${bookingId}/`, { status: 'cancelled' });
      message.success('Hủy đặt phòng thành công');
      fetchMyBookings();
    } catch (error) {
      message.error('Không thể hủy đặt phòng');
      console.error('Error:', error);
    }
  };

  const viewBookingDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    try {
      // API call to submit review would go here
      message.success('Cảm ơn bạn đã đánh giá!');
      setReviewModalVisible(false);
      setReviewData({ rating: 5, comment: '' });
    } catch (error) {
      message.error('Không thể gửi đánh giá');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'checked_in': 'green',
      'checked_out': 'gray',
      'cancelled': 'red'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'checked_in': 'Đã nhận phòng',
      'checked_out': 'Đã trả phòng',
      'cancelled': 'Đã hủy'
    };
    return statusTexts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <ClockCircleOutlined />,
      'confirmed': <CheckCircleOutlined />,
      'checked_in': <HomeOutlined />,
      'checked_out': <CheckCircleOutlined />,
      'cancelled': <CloseCircleOutlined />
    };
    return icons[status] || <ExclamationCircleOutlined />;
  };



  // Memoize columns to prevent re-renders
  const memoizedColumns = useMemo(() => {
    const columns = [
      {
        title: 'Mã đặt phòng',
        dataIndex: 'booking_id',
        key: 'booking_id',
        render: (text) => <Text code>{text || 'N/A'}</Text>
      },
      {
        title: 'Phòng',
        key: 'room',
        render: (_, record) => {
          const roomDetail = record.room_detail || {};
          return (
            <div>
              <Text strong>Phòng {roomDetail.room_number || 'N/A'}</Text>
              <br />
              <Text type="secondary">{roomDetail.room_type?.name || 'N/A'}</Text>
            </div>
          );
        }
      },
      {
        title: 'Thời gian',
        key: 'dates',
        render: (_, record) => {
          if (!record.check_in_date || !record.check_out_date) {
            return <Text type="secondary">Chưa có thông tin</Text>;
          }
          
          return (
            <div>
              <div>📅 {moment(record.check_in_date).format('DD/MM/YYYY')}</div>
              <div>📅 {moment(record.check_out_date).format('DD/MM/YYYY')}</div>
              <Text type="secondary">
                ({moment(record.check_out_date).diff(moment(record.check_in_date), 'days')} đêm)
              </Text>
            </div>
          );
        }
      },
      {
        title: 'Trạng thái',
        key: 'status',
        render: (_, record) => (
          <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
            {getStatusText(record.status)}
          </Tag>
        )
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (amount) => (
          <Text strong style={{ color: '#1890ff' }}>
            {amount ? new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(amount) : '0 VND'}
          </Text>
        )
      },
      {
        title: 'Hành động',
        key: 'action',
        render: (_, record) => {
          const actions = [];
          
          actions.push(
            <Button 
              key="view"
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => viewBookingDetail(record)}
            >
              Chi tiết
            </Button>
          );

          if (record.status === 'pending' || record.status === 'confirmed') {
            actions.push(
              <Popconfirm
                key="cancel"
                title="Bạn có chắc muốn hủy đặt phòng?"
                onConfirm={() => cancelBooking(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button type="link" danger icon={<CloseCircleOutlined />}>
                  Hủy
                </Button>
              </Popconfirm>
            );
          }

          if (record.status === 'checked_out') {
            actions.push(
              <Button 
                key="review"
                type="link" 
                icon={<StarOutlined />} 
                onClick={() => openReviewModal(record)}
              >
                Đánh giá
              </Button>
            );
          }

          return <Space>{actions}</Space>;
        }
      }
    ];
    
    return columns;
  }, []);

  // Ensure dataSource is always a safe array
  const tableDataSource = useMemo(() => {
    console.log('Creating tableDataSource from bookings:', bookings);
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return [];
    }
    
    return bookings.filter(booking => booking && typeof booking === 'object').map((booking, index) => {
      // Create a completely clean object with only the fields we need
      const safeItem = {
        key: booking.id || `booking-${index}`,
        id: booking.id || null,
        booking_id: booking.booking_id || '',
        status: booking.status || '',
        check_in_date: booking.check_in_date || '',
        check_out_date: booking.check_out_date || '',
        total_amount: booking.total_amount || 0,
        adults: booking.adults || 1,
        children: booking.children || 0,
        special_requests: booking.special_requests || '',
        created_at: booking.created_at || '',
        updated_at: booking.updated_at || '',
        // Keep objects as references for render functions
        room_detail: booking.room_detail || {},
        customer_detail: booking.customer_detail || {},
        created_by_detail: booking.created_by_detail || {}
      };
      
      return safeItem;
    });
  }, [bookings]);

  // Debug log to check final data structure
  console.log('Final tableDataSource:', tableDataSource);
  console.log('TableDataSource type:', typeof tableDataSource);
  console.log('TableDataSource isArray:', Array.isArray(tableDataSource));
  console.log('TableDataSource length:', tableDataSource?.length || 0);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đặt phòng"
              value={stats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã check-in"
              value={stats.checkedIn}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bookings Table */}
      <Card title="Danh sách đặt phòng của tôi">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>Đang tải...</div>
          </div>
        ) : (
          <SimpleTable
            columns={memoizedColumns}
            dataSource={Array.isArray(tableDataSource) ? tableDataSource : []}
            loading={false}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt phòng`,
            }}
            rowKey="key"
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đặt phòng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedBooking && (
          <div>
            <Descriptions title="Thông tin đặt phòng" bordered column={2}>
              <Descriptions.Item label="Mã đặt phòng" span={2}>
                <Text code>{selectedBooking.booking_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">
                Phòng {selectedBooking.room_detail?.room_number}
              </Descriptions.Item>
              <Descriptions.Item label="Loại phòng">
                {selectedBooking.room_detail?.room_type?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Tầng">
                Tầng {selectedBooking.room_detail?.floor}
              </Descriptions.Item>
              <Descriptions.Item label="Sức chứa">
                {selectedBooking.room_detail?.room_type?.max_occupancy} người
              </Descriptions.Item>
              <Descriptions.Item label="Check-in">
                {moment(selectedBooking.check_in_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Check-out">
                {moment(selectedBooking.check_out_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Số đêm">
                {moment(selectedBooking.check_out_date).diff(moment(selectedBooking.check_in_date), 'days')} đêm
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedBooking.status)} icon={getStatusIcon(selectedBooking.status)}>
                  {getStatusText(selectedBooking.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số người lớn">
                {selectedBooking.adults || 1}
              </Descriptions.Item>
              <Descriptions.Item label="Số trẻ em">
                {selectedBooking.children || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  {Number(selectedBooking.total_amount).toLocaleString()} VND
                </Text>
              </Descriptions.Item>
              {selectedBooking.special_requests && (
                <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                  {selectedBooking.special_requests}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày đặt">
                {moment(selectedBooking.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                {moment(selectedBooking.updated_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {/* Timeline */}
            <div style={{ marginTop: '24px' }}>
              <Title level={5}>Lịch sử trạng thái</Title>
              <Timeline>
                <Timeline.Item color="blue" dot={<CalendarOutlined />}>
                  Đặt phòng - {moment(selectedBooking.created_at).format('DD/MM/YYYY HH:mm')}
                </Timeline.Item>
                {selectedBooking.status !== 'pending' && (
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    Xác nhận đặt phòng
                  </Timeline.Item>
                )}
                {selectedBooking.status === 'checked_in' && (
                  <Timeline.Item color="green" dot={<HomeOutlined />}>
                    Nhận phòng
                  </Timeline.Item>
                )}
                {selectedBooking.status === 'checked_out' && (
                  <Timeline.Item color="gray" dot={<CheckCircleOutlined />}>
                    Trả phòng
                  </Timeline.Item>
                )}
                {selectedBooking.status === 'cancelled' && (
                  <Timeline.Item color="red" dot={<CloseCircleOutlined />}>
                    Đã hủy
                  </Timeline.Item>
                )}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Đánh giá dịch vụ"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={submitReview}
        okText="Gửi đánh giá"
        cancelText="Hủy"
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Text>Bạn cảm thấy dịch vụ như thế nào?</Text>
          <br />
          <Rate 
            value={reviewData.rating}
            onChange={(value) => setReviewData({...reviewData, rating: value})}
            style={{ fontSize: '24px', margin: '16px 0' }}
          />
        </div>
        <TextArea
          rows={4}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          value={reviewData.comment}
          onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
        />
      </Modal>
    </div>
  );
};

export default MyBookings;