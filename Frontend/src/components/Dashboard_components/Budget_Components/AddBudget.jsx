import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const URL = import.meta.env.VITE_URL;

const AddBudget = ({ budget, onClose }) => {

  const [form, setForm] = useState(
  budget
    ? {
        _id: budget._id || "",
        month: budget.month || "",      
        category: budget.category || "",
        limit: budget.limit ? String(budget.limit) : "",
      }
    : {
        _id: "",
        month: "",
        category: "",
        limit: "",
      }
);

  const [customCategory, setCustomCategory] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCategory = customCategory || form.category;

    if (!finalCategory) {
      toast.error("Category is required");
      return;
    }
    console.log(0);
    
    if (!form.limit) {
      toast.error("Limit is required");
      return;
    }
    console.log(0);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const payload = {
      _id: form._id,
      month: form.month || currentMonth,
      category: finalCategory,
      limit: Number(form.limit),
    };

    const action = budget ? "update" : "add";

    try {
      const res = await axios.post(`${URL}/budget/${action}`, payload, {
        withCredentials: true,
      });
      toast.success(res.data.message);

      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="w-[450px] h-auto p-6 bg-[#1a1a1a] rounded-2xl shadow-md m-0">
      <h2 className="text-xl font-semibold mb-5 text-white">
        {budget === undefined ? "Add Budget" : "Update Budget"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Month
          </label>
          <input
            type="month"
            name="month"
            value={form.month}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white"
          />
        </div>

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
            <div className="absolute left-0 right-0 mt-2 bg-[#0d0d0d] border border-gray-600 rounded-md z-10 max-h-40 overflow-y-auto">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or Write Your Own Category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Enter custom category"
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Budget Limit (₹)
          </label>
          <input
            type="number"
            name="limit"
            value={form.limit}
            onChange={(e) =>
              setForm({ ...form, limit: e.target.value.replace(/[^0-9]/g, "") })
            }
            placeholder="Enter limit amount"
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg cursor-pointer"
        >
          {budget === undefined ? "Add Budget" : "Update Budget"}
        </button>
      </form>
    </div>
  );
};

export default AddBudget;
