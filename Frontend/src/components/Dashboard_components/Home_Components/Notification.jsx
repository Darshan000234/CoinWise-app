import React, { useState, useEffect } from "react";
import { Bell, Trash2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Notification = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // useEffect(() => {
  //   // Fetch notifications from backend
  //   // axios.get("/api/notifications")
  //   //   .then((res) => setNotifications(res.data))
  //   //   .catch((err) => console.error(err));
  // }, []);

  // const clearAll = async () => {
  //   await axios.delete("/api/notifications/clear");
  //   setNotifications([]);
  // };

  return (
    <div className="relative cursor-pointer">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-300 hover:text-white cursor-pointer"
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
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-lg z-50"
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
              <h2 className="text-gray-200 font-medium text-sm">Notifications</h2>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Clear All
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className="px-4 py-3 border-b border-gray-800 hover:bg-[#222]"
                  >
                    <p className="text-gray-200 text-sm">{n.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
