import React, { useState } from 'react';
import { Card, Button, message, Typography, Space } from 'antd';
import api from '../../services/api';

const { Title, Text } = Typography;

const RevenueTester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test dashboard endpoint
      console.log('Testing dashboard endpoint...');
      const dashboardResponse = await api.get('/revenue/dashboard/');
      results.dashboard = { success: true, data: dashboardResponse.data };
    } catch (error) {
      results.dashboard = { success: false, error: error.message };
    }

    try {
      // Test chart endpoint
      console.log('Testing chart endpoint...');
      const chartResponse = await api.get('/revenue/chart/?type=daily&period=7');
      results.chart = { success: true, data: chartResponse.data };
    } catch (error) {
      results.chart = { success: false, error: error.message };
    }

    try {
      // Test customer analytics endpoint
      console.log('Testing customer analytics endpoint...');
      const analyticsResponse = await api.get('/revenue/customer-analytics/');
      results.analytics = { success: true, data: analyticsResponse.data };
    } catch (error) {
      results.analytics = { success: false, error: error.message };
    }

    try {
      // Test reports endpoint
      console.log('Testing reports endpoint...');
      const reportsResponse = await api.get('/revenue/reports/');
      results.reports = { success: true, data: reportsResponse.data };
    } catch (error) {
      results.reports = { success: false, error: error.message };
    }

    setTestResults(results);
    setLoading(false);
    
    console.log('All test results:', results);
  };

  return (
    <Card title="Revenue API Tester" style={{ margin: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          type="primary" 
          onClick={testEndpoints}
          loading={loading}
        >
          Test Revenue API Endpoints
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div>
            <Title level={4}>Test Results:</Title>
            {Object.entries(testResults).map(([endpoint, result]) => (
              <Card key={endpoint} size="small" style={{ marginBottom: '10px' }}>
                <Text strong>{endpoint}: </Text>
                <Text type={result.success ? 'success' : 'danger'}>
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </Text>
                {result.error && (
                  <div>
                    <Text type="danger">Error: {result.error}</Text>
                  </div>
                )}
                {result.success && result.data && (
                  <div>
                    <Text type="secondary">
                      Data keys: {Object.keys(result.data).join(', ')}
                    </Text>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default RevenueTester;