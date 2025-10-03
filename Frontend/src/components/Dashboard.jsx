import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { home, transactions, reports, budgets, settings, logout, minus, plus } from '../assets/js/index.js';
import { Outlet } from 'react-router-dom';


const URL = import.meta.env.VITE_URL || "http://localhost:3000";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false); // sidebar collapsed

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await axios.get(`${URL}/user/validate-session`, { withCredentials: true });
        if (!res.data.isValid) navigate('/');
      } catch {
        navigate('/');
      }
    };
    validateSession();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${URL}/user/logout`, { withCredentials: true });
      if (res.data.message) {
        toast.dismiss();
        toast.success(res.data.message, { duration: 3000 });
        navigate('/Signup_Login');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
    }
  };

  const menuItems = [
    { name: 'Home', icon: home, path: '/dashboard' },
    { name: 'Transactions', icon: transactions, path: '/dashboard/transactions' },
    { name: 'Reports', icon: reports, path: '/dashboard/reports' },
    { name: 'Budgets', icon: budgets, path: '/dashboard/budgets' },
    { name: 'Settings', icon: settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#121212] flex ">

      {/* Collapsible Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 96 : 256 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-[#1F1F1F] flex flex-col justify-between p-4 shadow-lg
             fixed top-0 left-0 h-screen overflow-hidden"
      >
        {/* Top section: toggle, logo, menu */}
        <div className="flex flex-col">
          {/* Toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mb-6 self-end p-2 rounded-md hover:bg-[#333] transition-colors"
          >
            <img
              src={isCollapsed ? plus : minus}
              alt={isCollapsed ? "Expand" : "Collapse"}
              className="h-6 w-6 filter invert brightness-90"
            />
          </button>

          {/* Logo */}
          <div
            className={`flex items-center justify-center mb-10 rounded-2xl text-white font-bold transition-all duration-300
        ${isCollapsed ? 'h-12 text-lg' : 'h-16 text-2xl'}`}
          >
            {!isCollapsed && 'CoinWise'}
          </div>

          {/* Menu (scrollable if needed) */}
          <nav className="flex flex-col gap-4 overflow-hidden max-h-[calc(100vh-200px)]">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} className="w-full">
                  <motion.div
                    className={`flex items-center gap-4 p-3 rounded-xl font-medium text-white transition-all duration-300
                ${isActive ? 'bg-[#333]' : 'hover:bg-[#333]'}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={item.icon}
                      alt={item.name}
                      className={`h-6 w-6 ${isCollapsed ? 'm-2' : ''} filter invert
                  ${isActive ? 'brightness-150' : 'brightness-75'}`}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className={`mt-10 flex items-center justify-center gap-7 p-3 rounded-xl font-medium 
      text-red-500 transition-all duration-300 hover:bg-red-600 hover:text-white`}
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={logout}
            alt="Logout"
            className={`h-6 w-6 ${isCollapsed ? 'm-2' : ''} filter invert brightness-75`}
          />
          {!isCollapsed && <span className="font-semibold">Logout</span>}
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: isCollapsed ? 96 : 256 }}
        className="flex-1 p-6 bg-[#121212] pr-5"
      >
        <motion.div className="bg-[#1A1A1A] rounded-3xl p-6 shadow-lg h-full w-full">
          <Outlet />
        </motion.div>
      </motion.main>

    </div>
  );
};

export default Dashboard;
