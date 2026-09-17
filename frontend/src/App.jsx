import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import StudentAssignments from './pages/student/StudentAssignments';
import GroupManagement from './pages/student/GroupManagement';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ManageAssignments from './pages/admin/ManageAssignments';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Joineazy</h1>
        <p className="text-gray-600 mb-6 text-center">Welcome to the Student & Group Management System.</p>
        
        <div className="space-y-4">
          <Link to="/login" className="block text-center w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200">
            Login
          </Link>
          <Link to="/register" className="block text-center w-full bg-white text-blue-600 border border-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition duration-200">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<StudentAssignments />} />
          <Route path="/dashboard/group" element={<GroupManagement />} />
        </Route>
      </Route>

      {}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AnalyticsDashboard />} />
          <Route path="/admin/assignments" element={<ManageAssignments />} />
        </Route>
      </Route>
      
      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
