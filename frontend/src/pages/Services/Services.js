import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tabs, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Space, 
  Popconfirm,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import './Services.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Services = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Modal states
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Forms
  const [serviceForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading services data...');
      
      const categoriesRes = await api.get('/api/services/categories/');
      console.log('Categories API response:', categoriesRes);
      
      const servicesRes = await api.get('/api/services/services/');
      console.log('Services API response:', servicesRes);
      
      // Handle different response formats
      const categoriesData = categoriesRes.data?.results || categoriesRes.data || [];
      const servicesData = servicesRes.data?.results || servicesRes.data || [];
      
      console.log('Processed categories:', categoriesData);
      console.log('Processed services:', servicesData);
      
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      message.success(`Đã tải ${servicesData.length} dịch vụ và ${categoriesData.length} danh mục`);
      
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Không thể tải dữ liệu: ' + (error.response?.data?.detail || error.message));
      // Set empty arrays on error
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter services by category
  const filteredServices = selectedCategory && Array.isArray(services) 
    ? services.filter(service => service.category === selectedCategory)
    : (Array.isArray(services) ? services : []);

  // Service table columns
  const serviceColumns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 150,
      render: (categoryName) => (
        <Tag color="blue">{categoryName}</Tag>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => `${price?.toLocaleString('vi-VN')} VND`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'Thời gian chuẩn bị',
      dataIndex: 'preparation_time',
      key: 'preparation_time',
      width: 120,
      render: (time) => `${time} phút`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_available',
      key: 'is_available',
      width: 100,
      render: (available) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'Có sẵn' : 'Ngừng phục vụ'}
        </Tag>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditService(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa dịch vụ này?"
            onConfirm={() => handleDeleteService(record.id)}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Category table columns
  const categoryColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: 'Số dịch vụ',
      dataIndex: 'services_count',
      key: 'services_count',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sort_order',
      key: 'sort_order',
      sorter: (a, b) => a.sort_order - b.sort_order,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record.id)}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handle service CRUD
  const handleAddService = () => {
    setEditingService(null);
    serviceForm.resetFields();
    setServiceModalVisible(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    serviceForm.setFieldsValue(service);
    setServiceModalVisible(true);
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await api.delete(`/api/services/services/${serviceId}/`);
      message.success('Xóa dịch vụ thành công');
      loadData();
    } catch (error) {
      message.error('Không thể xóa dịch vụ');
    }
  };

  const handleSaveService = async (values) => {
    try {
      if (editingService) {
        await api.patch(`/api/services/services/${editingService.id}/`, values);
        message.success('Cập nhật dịch vụ thành công');
      } else {
        await api.post('/api/services/services/', values);
        message.success('Thêm dịch vụ thành công');
      }
      setServiceModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Không thể lưu dịch vụ');
    }
  };

  // Handle category CRUD
  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/api/services/categories/${categoryId}/`);
      message.success('Xóa danh mục thành công');
      loadData();
    } catch (error) {
      message.error('Không thể xóa danh mục');
    }
  };

  const handleSaveCategory = async (values) => {
    try {
      if (editingCategory) {
        await api.patch(`/api/services/categories/${editingCategory.id}/`, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await api.post('/api/services/categories/', values);
        message.success('Thêm danh mục thành công');
      }
      setCategoryModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Không thể lưu danh mục');
    }
  };

  // Statistics
  const stats = {
    totalServices: Array.isArray(services) ? services.length : 0,
    activeServices: Array.isArray(services) ? services.filter(s => s.is_available).length : 0,
    totalCategories: Array.isArray(categories) ? categories.length : 0,
    avgPrice: Array.isArray(services) && services.length > 0 
      ? services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length 
      : 0
  };

  return (
    <div className="services-management">
      <Card>
        <Title level={3}>
          <ShoppingOutlined /> Quản lý dịch vụ
        </Title>

        {/* Statistics */}
        <Row gutter={16} className="stats-row">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng dịch vụ"
                value={stats.totalServices}
                prefix={<CoffeeOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Đang phục vụ"
                value={stats.activeServices}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Danh mục"
                value={stats.totalCategories}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Tabs defaultActiveKey="services">
          <TabPane 
            tab={
              <span>
                <CoffeeOutlined />
                Dịch vụ
              </span>
            } 
            key="services"
          >
            <div className="services-header">
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Text>Lọc theo danh mục:</Text>
                    <Select
                      style={{ width: 200 }}
                      placeholder="Tất cả danh mục"
                      allowClear
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                    >
                      <Option value={null}>Tất cả danh mục</Option>
                      {(categories || []).map(cat => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddService}
                  >
                    Thêm dịch vụ
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              columns={serviceColumns}
              dataSource={filteredServices}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} dịch vụ`
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <AppstoreOutlined />
                Danh mục
              </span>
            } 
            key="categories"
          >
            <div className="categories-header">
              <Row justify="end">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddCategory}
                >
                  Thêm danh mục
                </Button>
              </Row>
            </div>

            <Table
              columns={categoryColumns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Service Modal */}
      <Modal
        title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
        visible={serviceModalVisible}
        onCancel={() => setServiceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={serviceForm}
          layout="vertical"
          onFinish={handleSaveService}
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
          >
            <Input placeholder="Ví dụ: Cơm gà" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              {(categories || []).map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VND"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
              >
                <Input placeholder="phần, ly, chai..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="preparation_time"
            label="Thời gian chuẩn bị (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian chuẩn bị' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
              max={300}
              addonAfter="phút"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về dịch vụ..."
            />
          </Form.Item>

          <Form.Item
            name="is_available"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Có sẵn" 
              unCheckedChildren="Ngừng phục vụ" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setServiceModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingService ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        visible={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleSaveCategory}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Đồ ăn" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả về danh mục..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="Icon"
              >
                <Input placeholder="restaurant, coffee..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort_order"
                label="Thứ tự sắp xếp"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="1"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Tạm dừng" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setCategoryModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Services;