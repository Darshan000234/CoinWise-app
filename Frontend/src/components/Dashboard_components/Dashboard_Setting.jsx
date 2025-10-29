import React, { useState } from "react";
import { motion } from "framer-motion";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { User, Bell, Shield, Paintbrush, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const Dashboard_Setting = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // static data for now
  const [profile, setProfile] = useState({
    name: "Darshan Desale",
    email: "darshan@email.com",
    currency: "INR (₹)",
  });

  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    monthlySummary: true,
    budgetAlerts: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "dark",
  });

  // Simulated save function
  const handleSave = async (section) => {
    try {
      // Example API call placeholder
      // await axios.put(`/api/settings/${section}`, { data });
      toast.success(`${section} settings saved successfully!`);
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: <User size={18} /> },
    { id: "notifications", name: "Notifications", icon: <Bell size={18} /> },
    { id: "appearance", name: "Appearance", icon: <Paintbrush size={18} /> },
    { id: "security", name: "Security", icon: <Shield size={18} /> },
    { id: "account", name: "Account", icon: <Trash2 size={18} /> },
  ];

  return (
    <div className="flex rounded-2xl bg-white/5 h-full w-full p-4 gap-4">
      {/* Left Drawer */}
      <div className="w-[15rem] bg-white/5 rounded-2xl p-3 flex flex-col space-y-2 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
              ${activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-white/10"
              }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Right Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 bg-white/5 rounded-2xl p-6 overflow-y-auto"
      >
        {/* Profile */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
              <input
                type="email"
                className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
              <select
                className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none"
                value={profile.currency}
                onChange={(e) =>
                  setProfile({ ...profile, currency: e.target.value })
                }
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
              <button
                onClick={() => handleSave("profile")}
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              {Object.keys(notifications).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <span className="capitalize text-gray-300">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>

                  {/* ✅ Custom Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={() =>
                        setNotifications({
                          ...notifications,
                          [key]: !notifications[key],
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-300"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                  </label>
                </div>
              ))}
              <button
                onClick={() => handleSave("notifications")}
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 mt-4"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {activeTab === "appearance" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>

            <div className="flex items-center gap-3">
              <span className="text-gray-300">Theme:</span>

              <FormControl
                sx={{
                  minWidth: 160,
                  bgcolor: "#1f1f1f",
                  borderRadius: "0.5rem",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4b5563",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6366f1",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#9ca3af",
                  },
                  "& .MuiSelect-select": {
                    color: "#e5e7eb",
                    py: "8px",
                    px: "12px",
                  },
                }}
                size="small"
              >
                <InputLabel
                  sx={{
                    color: "#9ca3af",
                    "&.Mui-focused": { color: "#6366f1" },
                  }}
                >
                  Theme
                </InputLabel>

                <Select
                  value={appearance.theme}
                  label="Theme"
                  onChange={(e) => setAppearance({ theme: e.target.value })}
                >
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
            </div>

            <button
              onClick={() => handleSave("appearance")}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 mt-4"
            >
              Save Appearance
            </button>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <input
              type="password"
              placeholder="New Password"
              className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none mb-3"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none mb-3"
            />
            <button
              onClick={() => handleSave("security")}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Update Password
            </button>
          </div>
        )}

        {/* Account */}
        {activeTab === "account" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              Danger Zone
            </h2>
            <p className="text-gray-400 mb-4">
              Once you delete your account, all your data will be permanently
              removed.
            </p>
            <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">
              Delete Account
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard_Setting;
