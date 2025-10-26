import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, LinearProgress } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { Delete, Edit } from "lucide-react";
import AddBudget from "./AddBudget";

const URL = import.meta.env.VITE_URL;

const AllBudget = () => {
  const [budgets, setBudgets] = useState([
  { category: "Food", limit: 5000, spent: 4200, month: "October 2025" },
  { category: "Transport", limit: 2000, spent: 1800, month: "October 2025" },
  { category: "Shopping", limit: 3000, spent: 2500, month: "October 2025" },
  { category: "Entertainment", limit: 2500, spent: 1900, month: "October 2025" },
  { category: "Health", limit: 4000, spent: 1500, month: "October 2025" },
  { category: "Education", limit: 3500, spent: 3400, month: "October 2025" }
]
);
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState("month");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const itemsPerPage = 10;

  // 🟢 Fetch Budgets
  const getBudgets = async () => {
    try {
      const res = await axios.get(`${URL}/budget/data`, { withCredentials: true });
    //   setBudgets(res.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };
  useEffect(() => {
    if (!isPopupOpen) {
        document.body.style.overflow = ""; // restore default
    } else {
        document.body.style.overflow = "hidden"; // prevent background scroll
    }
  }, [isPopupOpen]);

  useEffect(() => {
    getBudgets();
  }, []);

  const filtered = budgets.filter((b) =>
    b.category.toLowerCase().includes(query.toLowerCase()) ||
    b.month.toLowerCase().includes(query.toLowerCase()) ||
    b.limit.toString().includes(query) ||
    b.spent.toString().includes(query)
  );

  const sorted = [...filtered].sort((a, b) => {
    const dir = order === "asc" ? 1 : -1;

    if (sortField === "limit") return (a.limit - b.limit) * dir;
    if (sortField === "spent") return (a.spent - b.spent) * dir;
    if (sortField === "remaining") return ((a.limit - a.spent) - (b.limit - b.spent)) * dir;

    return a.month.localeCompare(b.month) * dir;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setOrder("asc");
    }
  };

  // ✏️ Edit
  const handleEdit = (b) => {
    setPopup(b);
    setIsPopupOpen(true);
  };

  // ❌ Delete
  const handleDelete = async (b) => {
    try {
      await axios.post(`${URL}/budget/delete`, { id: b._id }, { withCredentials: true });
      toast.success("Budget deleted");
      getBudgets();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleClose = () => {
    setPopup(null);
    setIsPopupOpen(false);
  };

  return (
    <div className="p-6 text-white min-h-screen flex flex-col items-center bg-[#262626] rounded-3xl transition-all duration-[0.7s] ease-in">
      <h2 className="text-3xl font-semibold mb-8 text-center">📊 All Budgets</h2>

      {/* 🔍 Search Bar */}
      <div className="mb-6 w-full flex justify-center">
        <input
          type="text"
          placeholder="🔍 Search by category, month, or amount"
          className="bg-[#1c1c1c] text-white px-4 py-3 rounded-lg w-96 focus:ring-2 focus:ring-blue-500 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-2xl overflow-hidden shadow-md bg-[#1a1a1a] w-full max-w-5xl">
        <table className="w-full border-collapse">
          <thead className="bg-[#0d0d0d] text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                onClick={() => toggleSort("limit")}
              >
                Limit (₹) {sortField === "limit" ? (order === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                onClick={() => toggleSort("spent")}
              >
                Spent (₹) {sortField === "spent" ? (order === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                onClick={() => toggleSort("remaining")}
              >
                Remaining {sortField === "remaining" ? (order === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="px-4 py-3 text-left font-semibold">Month</th>
              <th className="px-4 py-3 text-left font-semibold">Progress</th>
              <th className="px-4 py-3 text-left font-semibold">Edit</th>
              <th className="px-4 py-3 text-left font-semibold">Delete</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((b) => {
                const percent = Math.min((b.spent / b.limit) * 100, 100);
                const remaining = b.limit - b.spent;
                return (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-4 py-3">{b.category}</td>
                    <td className="px-4 py-3">{b.limit.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-red-400">{b.spent.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-green-400">{remaining.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{b.month}</td>
                    <td className="px-4 py-3 w-48">
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: "#333",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: percent > 90 ? "#ef4444" : "#3b82f6",
                          },
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => handleEdit(b)}>
                      Edit <Edit className="inline w-5 h-5 ml-1" />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => handleDelete(b)}>
                      Delete <Delete className="inline w-5 h-5 ml-1" />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  No budgets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            variant="outlined"
            sx={{
              "& .MuiPaginationItem-root": { color: "white", borderColor: "#555" },
              "& .Mui-selected": { backgroundColor: "#2563eb !important", color: "#fff" },
            }}
          />
        </div>
      )}

      {/* Edit Popup */}
      <AnimatePresence>
        {isPopupOpen && (
          <Dialog
            open={isPopupOpen}
            onClose={handleClose}
            disableScrollLock={false}
            PaperProps={{
              sx: { backgroundColor: "transparent", boxShadow: "none" },
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center"
            >
              {popup && <AddBudget budget={popup} onClose={handleClose} />}
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllBudget;
