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
      console.log('Fetching bookings for SimpleBookings...');
      const response = await api.get('/api/rooms/bookings/my_bookings/');
      console.log('Simple Bookings Response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      
      let bookingsData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          bookingsData = response.data.results;
        }
      }
      
      // Ensure valid bookings only
      const validBookings = bookingsData.filter(booking => 
        booking && typeof booking === 'object' && booking.id
      );
      
      console.log('Valid bookings count:', validBookings.length);
      setBookings(validBookings);
    } catch (error) {
      console.error('SimpleBookings fetch error:', error);
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
      render: (text) => text || 'N/A'
    },
    {
      title: 'Phòng',
      key: 'room_number',
      render: (_, record) => {
        const roomDetail = record?.room_detail;
        return roomDetail?.room_number || 'N/A';
      }
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in_date',
      key: 'check_in_date',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Check-out', 
      dataIndex: 'check_out_date',
      key: 'check_out_date',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color="blue">{status || 'N/A'}</Tag>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => {
        if (!amount || amount === 0) return '0 VNĐ';
        return `${Number(amount).toLocaleString()} VNĐ`;
      }
    }
  ];

  // Create safe data source with proper structure
  const safeDataSource = React.useMemo(() => {
    console.log('Creating safeDataSource from bookings:', bookings);
    
    if (!Array.isArray(bookings)) {
      console.log('Bookings is not array, returning empty array');
      return [];
    }
    
    const mappedData = bookings.map((booking, index) => {
      if (!booking || typeof booking !== 'object') {
        console.log('Invalid booking at index:', index, booking);
        return null;
      }
      
      return {
        key: booking.id || `booking-${index}`,
        id: booking.id,
        booking_id: booking.booking_id || '',
        check_in_date: booking.check_in_date || '',
        check_out_date: booking.check_out_date || '',
        status: booking.status || '',
        total_amount: booking.total_amount || 0,
        room_detail: booking.room_detail || {}
      };
    }).filter(Boolean); // Remove null entries
    
    console.log('Final mapped data:', mappedData);
    return mappedData;
  }, [bookings]);

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