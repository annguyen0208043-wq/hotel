import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Tabs, Select, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [userType, setUserType] = useState('customer');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      const success = await login(values, userType);
      if (success) {
        // Redirect based on user type
        switch (userType) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'employee':
            navigate('/employee-dashboard');
            break;
          case 'customer':
            navigate('/customer-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values) => {
    setRegisterLoading(true);
    try {
      const success = await register(values, 'customer');
      if (success) {
        setActiveTab('login');
        setUserType('customer');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form" style={{ width: 500 }}>
        <Title level={2} className="login-title" style={{ textAlign: 'center', marginBottom: 30 }}>
          Hệ thống quản lý khách sạn
        </Title>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="Đăng nhập" key="login">
            <Form
              name="login"
              onFinish={onLogin}
              autoComplete="off"
              size="large"
              layout="vertical"
            >
              <Form.Item label="Loại tài khoản">
                <Select 
                  value={userType} 
                  onChange={setUserType}
                  size="large"
                >
                  <Option value="customer">Khách hàng</Option>
                  <Option value="employee">Nhân viên</Option>
                  <Option value="admin">Quản lý</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên đăng nhập!',
                  },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Tên đăng nhập" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu!',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              {userType === 'customer' && (
                <>
                  <Divider>hoặc</Divider>
                  <Text style={{ textAlign: 'center', display: 'block' }}>
                    Chưa có tài khoản? 
                    <Button 
                      type="link" 
                      onClick={() => setActiveTab('register')}
                      style={{ padding: '0 5px' }}
                    >
                      Đăng ký ngay
                    </Button>
                  </Text>
                </>
              )}
            </Form>
          </TabPane>

          <TabPane tab="Đăng ký" key="register">
            <Form
              name="register"
              onFinish={onRegister}
              autoComplete="off"
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên đăng nhập!',
                  },
                  {
                    min: 3,
                    message: 'Tên đăng nhập phải có ít nhất 3 ký tự!',
                  },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Tên đăng nhập" 
                />
              </Form.Item>

              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="first_name"
                  label="Họ"
                  style={{ width: '50%', marginRight: 8 }}
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập họ!',
                    },
                  ]}
                >
                  <Input placeholder="Họ" />
                </Form.Item>

                <Form.Item
                  name="last_name"
                  label="Tên"
                  style={{ width: '50%' }}
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên!',
                    },
                  ]}
                >
                  <Input placeholder="Tên" />
                </Form.Item>
              </Space.Compact>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập email!',
                  },
                  {
                    type: 'email',
                    message: 'Email không hợp lệ!',
                  },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số điện thoại!',
                  },
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Số điện thoại" 
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input 
                  prefix={<HomeOutlined />} 
                  placeholder="Địa chỉ" 
                />
              </Form.Item>

              <Form.Item
                name="date_of_birth"
                label="Ngày sinh"
              >
                <Input 
                  type="date"
                  prefix={<CalendarOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu!',
                  },
                  {
                    min: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng xác nhận mật khẩu!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={registerLoading}
                  block
                  size="large"
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <Text style={{ textAlign: 'center', display: 'block' }}>
                Đã có tài khoản? 
                <Button 
                  type="link" 
                  onClick={() => setActiveTab('login')}
                  style={{ padding: '0 5px' }}
                >
                  Đăng nhập ngay
                </Button>
              </Text>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;