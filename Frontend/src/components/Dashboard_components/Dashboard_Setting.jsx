import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { User, Bell, Shield, Paintbrush, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const URL = import.meta.env.VITE_URL;

const Dashboard_Setting = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({});
  const [notifications, setNotifications] = useState({});
  const [password, setPassword] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${URL}/user/settings`, {
          withCredentials: true,
        });
        setProfile(response.data.Data.profile || {});
        setNotifications(response.data.Data.notifications || {});
      } catch (err) {
        toast.error("Failed to load settings");
      }
    };
    fetchSettings();
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

  
  const handleSave = async (section, data) => {
    try {
      await axios.post(
        `${URL}/user/settings_update/${section}`,
        { data },
        { withCredentials: true }
      );
      toast.success(`${section} settings saved successfully!`);
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  // ✅ Account Deletion Handler
  const handleDeleteAccount = async () => {
    try {
      const section = "account";
      await axios.get(`${URL}/user/settings_update/${section}`, { withCredentials: true });
      toast.success("Account deleted successfully!");
      setConfirmOpen(false);
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: <User size={18} /> },
    { id: "notifications", name: "Notifications", icon: <Bell size={18} /> },
    { id: "security", name: "Security", icon: <Shield size={18} /> },
    { id: "account", name: "Account", icon: <Trash2 size={18} /> },
  ];

  return (
    <div className="flex rounded-2xl bg-white/5 h-full w-full p-4 gap-4 relative">
      {/* Left Drawer */}
      <div className="w-[15rem] bg-white/5 rounded-2xl p-5 flex flex-col space-y-2 gap-3 h-[23rem] pt-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
              ${
                activeTab === tab.id
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
                placeholder="Full Name"
                className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none"
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none"
                value={profile.email || ""}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                disabled
              />
              <input
                type="number"
                placeholder="Monthly Income"
                className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none"
                value={profile.monthly_income || ""}
                onChange={(e) =>
                  setProfile({ ...profile, monthly_income: e.target.value })
                }
              />
              <button
                onClick={() => handleSave("profile", profile)}
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
                onClick={() => handleSave("notifications", notifications)}
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 mt-4"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <input
              type="password"
              placeholder="Current Password"
              onChange={(e) =>
                setPassword({ ...password, Current_Password: e.target.value })
              }
              className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none mb-3"
            />
            <input
              type="password"
              placeholder="New Password"
              onChange={(e) =>
                setPassword({ ...password, New_Password: e.target.value })
              }
              className="w-full bg-white/10 p-2 rounded-lg text-gray-200 outline-none mb-3"
            />
            <button
              onClick={() => handleSave("security", password)}
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
            <button
              onClick={() => setConfirmOpen(true)}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        )}
      </motion.div>

      {/* ✅ Confirm Delete Popup */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 p-6 rounded-2xl w-[20rem] shadow-lg text-center"
            >
              <h3 className="text-lg text-red-400 font-semibold mb-3">
                Confirm Deletion
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your account permanently?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard_Setting;
