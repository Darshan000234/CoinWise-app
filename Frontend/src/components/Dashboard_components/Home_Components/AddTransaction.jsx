import axios from "axios";
import React, { useState, useRef, useEffect } from "react";


const URL = import.meta.env.VITE_URL;
const AddTransaction = () => {
  const [form, setForm] = useState({
    date: "",
    amount: "",
    category: "",
    type: "",
    notes: ""
  });


  const [customCategory, setCustomCategory] = useState(""); // NEW state
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Salary",
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
    setCustomCategory(""); // clear custom when dropdown is selected
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
    const transactionPayload = {
      ...form,
      category: finalCategory,
      date: (!form.date || form.date === "01/01/0001") ? "" : form.date
    };
    try {
      const res = await axios.post(`${URL}/transaction/add`, transactionPayload, { withCredentials: true });
      toast.success(res.data.message);
      setForm({ amount: "", category: "", type: "", notes: "", date: "" });
      setCustomCategory("");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
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
    <div className="w-[450px] h-auto p-6 bg-[#1a1a1a] rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-5 text-white">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 custom-date"
        />

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <div className="flex items-center space-x-8 text-gray-200">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="income"
                checked={form.type === "income"}
                onChange={() =>
                  setForm((prev) => ({ ...prev, type: "income" }))
                }
                required
                className="accent-blue-500"
              />
              <span>Income</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={form.type === "expense"}
                onChange={() =>
                  setForm((prev) => ({ ...prev, type: "expense" }))
                }
                required
                className="accent-red-500"
              />
              <span>Expense</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Optional notes"
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition text-lg"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
