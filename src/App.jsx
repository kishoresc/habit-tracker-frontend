import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AllHabits from './pages/AllHabits';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import SmtpSettings from './pages/SmtpSettings';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Admin Route Component - Only for Master Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is not master admin, redirect to user dashboard
  if (user.role !== 'masterAdmin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  // Sidebar starts collapsed (icons only) on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <HabitProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <Dashboard toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <PrivateRoute>
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <AllHabits toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <Analytics toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <AdminDashboard toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/smtp"
                element={
                  <AdminRoute>
                    <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <SmtpSettings toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                  </AdminRoute>
                }
              />
              <Route 
                path="/" 
                element={
                  <Navigate to="/login" replace />
                } 
              />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </HabitProvider>
    </AuthProvider>
  );
}

export default App;
