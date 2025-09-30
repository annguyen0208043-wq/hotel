import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Auth/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import CustomerDashboard from './pages/Dashboard/CustomerDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import Employees from './pages/Employees/Employees';
import Customers from './pages/Customers/Customers';
import Rooms from './pages/Rooms/Rooms';
import RoomTypes from './pages/Rooms/RoomTypes';
import Bookings from './pages/Bookings/Bookings';
import Services from './pages/Services/Services';
import ServiceOrders from './pages/Services/ServiceOrders';
import Revenue from './pages/Revenue/Revenue';
import Reports from './pages/Reports/Reports';

const { Content } = Layout;

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route component (chỉ cho phép truy cập khi chưa đăng nhập)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    // Redirect based on user type
    switch (user.user_type) {
      case 'admin':
        return <Navigate to="/admin-dashboard" />;
      case 'employee':
        return <Navigate to="/employee-dashboard" />;
      case 'customer':
        return <Navigate to="/customer-dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }
  
  return children;
};

// Role-based Route component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    // Redirect to appropriate dashboard if not authorized
    switch (user.user_type) {
      case 'admin':
        return <Navigate to="/admin-dashboard" />;
      case 'employee':
        return <Navigate to="/employee-dashboard" />;
      case 'customer':
        return <Navigate to="/customer-dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Admin Dashboard - chỉ admin mới truy cập được */}
          <Route 
            path="/admin-dashboard" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            } 
          />

          {/* Employee Dashboard - admin và employee truy cập được */}
          <Route 
            path="/employee-dashboard" 
            element={
              <RoleBasedRoute allowedRoles={['admin', 'employee']}>
                <EmployeeDashboard />
              </RoleBasedRoute>
            } 
          />

          {/* Customer Dashboard - chỉ customer truy cập được */}
          <Route 
            path="/customer-dashboard" 
            element={
              <RoleBasedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </RoleBasedRoute>
            } 
          />

          {/* Protected Routes with MainLayout - chỉ admin và employee */}
          <Route 
            path="/*" 
            element={
              <RoleBasedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout>
                  <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/rooms" element={<Rooms />} />
                      <Route path="/room-types" element={<RoomTypes />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/service-orders" element={<ServiceOrders />} />
                      <Route path="/revenue" element={<Revenue />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/" element={<Navigate to="/admin-dashboard" />} />
                    </Routes>
                  </Content>
                </MainLayout>
              </RoleBasedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;