import React, { useState, useEffect } from 'react';
import { Card, Tag, message } from 'antd';
import SafeTable from '../Common/SafeTable';
import api from '../../services/api';
import moment from 'moment';

const SimpleBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/rooms/bookings/my_bookings/');
      console.log('Simple Bookings Response:', response.data);
      
      const data = Array.isArray(response.data) ? response.data : [];
      setBookings(data);
    } catch (error) {
      console.error('Error:', error);
      message.error('Không thể tải danh sách đặt phòng');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'booking_id',
      key: 'booking_id',
    },
    {
      title: 'Phòng',
      key: 'room_number',
      render: (_, record) => record.room_detail?.room_number || 'N/A'
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in_date',
      key: 'check_in_date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Check-out', 
      dataIndex: 'check_out_date',
      key: 'check_out_date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag>{status}</Tag>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `${amount?.toLocaleString() || 0} VNĐ`
    }
  ];

  const safeDataSource = Array.isArray(bookings) ? bookings : [];

  return (
    <Card title="Lịch sử đặt phòng" style={{ margin: '20px' }}>
      <SafeTable
        columns={columns}
        dataSource={safeDataSource}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default SimpleBookings;