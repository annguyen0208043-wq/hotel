import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Space, 
  Divider,
  message,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { Title, Text } = Typography;

const ProfileInfo = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/accounts/profile/');
      setProfileData(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      message.error('Không thể tải thông tin profile');
    }
  };

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue(profileData);
  };

  const handleCancel = () => {
    setEditing(false);
    form.setFieldsValue(profileData);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await api.put('/api/accounts/profile/', values);
      setProfileData(response.data);
      setEditing(false);
      if (updateUser) {
        updateUser(response.data);
      }
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return <Card loading />;
  }

  return (
    <div>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                src={profileData.avatar}
                style={{ marginBottom: 16 }}
              />
              <Title level={4}>{profileData.last_name}</Title>
              <Text type="secondary">@{profileData.username}</Text>
              <div style={{ marginTop: 16 }}>
                <Tag color={profileData.is_verified ? 'green' : 'orange'}>
                  {profileData.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
                <Tag color={profileData.is_active ? 'blue' : 'red'}>
                  {profileData.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card 
            title="Thông tin cá nhân"
            extra={
              !editing ? (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Space>
                  <Button 
                    icon={<SaveOutlined />}
                    type="primary"
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    Lưu
                  </Button>
                  <Button 
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                </Space>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={profileData}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="first_name"
                    label="Họ"
                    rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="last_name"
                    label="Tên"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  disabled={!editing}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                  >
                    <Input 
                      prefix={<PhoneOutlined />}
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="id_card_number"
                    label="Số CCCD/CMND"
                    rules={[
                      {
                        pattern: /^\d{9,12}$/,
                        message: 'Số CCCD/CMND phải từ 9-12 chữ số'
                      }
                    ]}
                  >
                    <Input 
                      prefix={<IdcardOutlined />}
                      disabled={!editing}
                      placeholder="Chưa cập nhật"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input.TextArea 
                  rows={2}
                  disabled={!editing}
                  placeholder="Chưa cập nhật"
                />
              </Form.Item>

              <Form.Item
                name="date_of_birth"
                label="Ngày sinh"
              >
                <Input 
                  type="date"
                  prefix={<CalendarOutlined />}
                  disabled={!editing}
                />
              </Form.Item>
            </Form>

            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Tên đăng nhập: </Text>
                <Text>{profileData.username}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày tham gia: </Text>
                <Text>{new Date(profileData.date_joined).toLocaleDateString('vi-VN')}</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileInfo;