import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const URL = import.meta.env.VITE_URL;

const AddBudget = ({ budget, onClose }) => {
  const [form, setForm] = useState(
    budget === undefined
      ? {
          _id: "",
          date: "",
          category: "",
          limit: "",
        }
      : {
          _id: budget._id,
          date:budget.date && !isNaN(new Date(budget.date))
                ? new Date(budget.date).toISOString().split("T")[0]
                : "",
          category: budget.category,
          limit: budget.limit.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
        }
  );

  const [value, setValue] = useState(budget === undefined ? "" : "Update");
  const [customCategory, setCustomCategory] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Rent",
    "Entertainment",
    "Health",
    "Education",
    "Investment",
    "Others",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: cat }));
    setCustomCategory("");
    setOpen(false);
  };

  const handleCustomCategory = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setForm((prev) => ({ ...prev, category: value ? "" : prev.category }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = customCategory || form.category;

    if (!finalCategory) {
      toast.error("Category is required");
      return;
    }

    const budgetPayload = {
      ...form,
      category: finalCategory,
      date: !form.date || form.date === "01/01/0001" ? "" : form.date,
    };

    const destination = value.toLowerCase() === "update" ? "update" : "add";

    try {
      const res = await axios.post(
        `${URL}/budget/${destination}`,
        budgetPayload,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setForm({ _id: "", date: "", category: "", limit: "" });
      setCustomCategory("");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, {
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-[450px] h-auto p-6 bg-[#1a1a1a] rounded-2xl shadow-md m-0">
      <h2 className="text-xl font-semibold mb-5 text-white">
        {budget == undefined ? "Add Budget" : "Update Budget"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Month
          </label>
          <input
            type="month"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Category
          </label>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white text-left"
          >
            {form.category || "Select category"}
          </button>

          {open && (
            <div
              className="absolute left-0 right-0 mt-2 mx-1 bg-[#0d0d0d] border border-gray-600 rounded-md max-h-40 overflow-y-auto z-10 custom-scrollbar"
              style={{
                top: "calc(100% + 4px)",
                paddingRight: "6px",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or Write Your Own Category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={handleCustomCategory}
            placeholder="Enter custom category"
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Budget Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Budget Limit (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              ₹
            </span>
            <input
              type="text"
              name="limit"
              value={form.limit}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setForm({ ...form, limit: value });
              }}
              placeholder="Enter limit amount"
              className="w-full pl-7 pr-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition text-lg"
        >
          {value === "" ? "Add Budget" : "Update Budget"}
        </button>
      </form>
    </div>
  );
};

export default AddBudget;
