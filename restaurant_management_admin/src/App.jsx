import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login from './components/Login';
import MenuManagement from './components/MenuManagement';
import CategoryManagement from './components/CategoryManagement';
import StaffManagement from './components/StaffManagement';
import Orders from './components/Orders';
import { authService } from './services/api';
import { LayoutDashboard, Utensils, ListTree, ClipboardList, Users, Plus } from 'lucide-react';

import Dashboard from './components/Dashboard';

const App = () => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  
  const isAuthenticated = !!(user && (user.role === 'Admin' || user.role === 'Staff'));
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login setAuth={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
        isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <Router>
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-brand-600">AdminPanel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavLink to="/dashboard" className={navLinkClass}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/categories" className={navLinkClass}>
                        <ListTree size={20} /> Categories
                    </NavLink>
                    <NavLink to="/menu" className={navLinkClass}>
                        <Utensils size={20} /> Menu Items
                    </NavLink>
                    <NavLink to="/orders" className={navLinkClass}>
                        <ClipboardList size={20} /> Orders
                    </NavLink>
                    {user?.role === 'Admin' && (
                        <div className="space-y-1">
                            <NavLink to="/staff" className={navLinkClass}>
                                <Users size={20} /> Staff Management
                            </NavLink>
                            <NavLink to="/staff?add=true" className="flex items-center gap-3 px-8 py-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
                                <Plus size={14} /> Add New Member
                            </NavLink>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold uppercase overflow-hidden border-2 border-brand-50">
                            {user.profilePic && user.profilePic !== 'default-profile.png' ? (
                                <img 
                                    src={user.profilePic.startsWith('http') ? user.profilePic : `${apiBaseUrl}${user.profilePic}`} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                user?.name?.charAt(0) || 'A'
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-dark-200">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-gray-500">{user?.role || 'Super Admin'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary">Log Out</button>
                </header>

                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/categories" element={<CategoryManagement />} />
                    <Route path="/menu" element={<MenuManagement />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/staff" element={<StaffManagement />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </main>
        </div>
    </Router>
  );
};

export default App;
