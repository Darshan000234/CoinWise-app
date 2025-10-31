import React, { useState, useEffect } from "react";
import { Bell, Trash2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const URL = import.meta.env.VITE_URL;

const Notification = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`${URL}/notification/addNotification`, {
          withCredentials: true,
        });
        setNotifications(
          Array.isArray(response.data.notifications)
            ? response.data.notifications
            : []
        );
      } catch (error) {
        setNotifications([]);
      }
    };
    getData();

    const validateSession = async () => {
      try {
        const res = await axios.get(`${URL}/user/validate-session`, {
          withCredentials: true,
        });
        if (!res.data.isValid) navigate("/");
      } catch {
        navigate("/");
      }
    };
    validateSession();
  }, []);

  const clearAll = async () => {
    try {
      await axios.get(`${URL}/notification/deleteNotification`, {
        withCredentials: true,
      });
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <div className="relative cursor-pointer">
      {/* Bell Icon */}
      <button
        onClick={() => {
          if (notifications.length > 0) setOpen(!open);
        }}
        className={`relative cursor-pointer ${
          notifications.length > 0
            ? "text-gray-300 hover:text-white"
            : "text-gray-500 cursor-not-allowed"
        }`}
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-[5px] py-[1px] rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {open && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-lg z-50"
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
              <h2 className="text-gray-200 font-medium text-sm">Notifications</h2>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              {notifications.map((n, index) => (
                <div
                  key={n._id || index} // ✅ Safe fallback key
                  className="px-4 py-3 border-b border-gray-800 hover:bg-[#222]"
                >
                  <p className="text-gray-200 text-sm">
                    {n.message || n.toString()}
                  </p>
                  {n.time && (
                    <p className="text-gray-500 text-xs mt-1">{n.time}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
