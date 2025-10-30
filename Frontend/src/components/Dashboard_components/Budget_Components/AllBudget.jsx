import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Pagination } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { Edit, Delete, Wallet, Search } from "lucide-react"; // ✅ Added icons
import AddBudget from "./AddBudget";

const URL = import.meta.env.VITE_URL;

const AllBudget = () => {
  const [budgets, setBudgets] = useState([
    { category: "Food", limit: 5000, spent: 4200, month: "October 2025" },
    { category: "Transport", limit: 2000, spent: 1800, month: "October 2025" },
    { category: "Shopping", limit: 3000, spent: 2500, month: "October 2025" },
    { category: "Entertainment", limit: 2500, spent: 1900, month: "October 2025" },
    { category: "Health", limit: 4000, spent: 1500, month: "October 2025" },
    { category: "Education", limit: 3500, spent: 3400, month: "October 2025" },
  ]);

  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState("month");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    const getBudgets = async () => {
      try {
        const res = await axios.get(`${URL}/budget/data`, { withCredentials: true });
        // setBudgets(res.data.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message);
      }
    };
    getBudgets();
  }, []);

  const filtered = budgets.filter(
    (b) =>
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

  const handleEdit = (b) => {
    setPopup(b);
    setIsPopupOpen(true);
  };

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
    <div className="p-6 text-white min-h-screen w-full bg-[#262626] rounded-3xl flex flex-col">
      {/* Title with Wallet Icon */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Wallet className="w-7 h-7 text-blue-400" />
        <h2 className="text-3xl font-semibold text-center">All Budgets</h2>
      </div>

      {/* Search */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by category, month, or amount"
            className="bg-[#1c1c1c] text-white pl-10 pr-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Budget Cards */}
      <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
        <AnimatePresence>
          {paginated.length > 0 ? (
            paginated.map((b) => {
              const percent = Math.min((b.spent / b.limit) * 100, 100);
              const remaining = b.limit - b.spent;

              return (
                <motion.div
                  key={b.category + b.month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1a1a1a] rounded-2xl p-5 shadow-md hover:shadow-lg transition-all relative group"
                >
                  <div className="flex justify-between items-center mb-2 mt-3">
                    <h3 className="text-lg font-semibold">{b.category}</h3>
                    <span className="text-sm text-gray-400">{b.month}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative flex-grow h-3 rounded-full bg-[#333] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                          background:
                            percent > 90
                              ? "linear-gradient(90deg, #ef4444, #dc2626)"
                              : percent > 70
                              ? "linear-gradient(90deg, #facc15, #eab308)"
                              : "linear-gradient(90deg, #3b82f6, #2563eb)",
                          boxShadow: `0 0 10px ${
                            percent > 90 ? "#dc2626" : percent > 70 ? "#eab308" : "#2563eb"
                          }`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">{percent.toFixed(0)}%</span>
                  </div>

                  {/* Amount Info */}
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-gray-400">
                      Limit: ₹{b.limit.toLocaleString("en-IN")}
                    </span>
                    <span className="text-red-400">
                      Spent: ₹{b.spent.toLocaleString("en-IN")}
                    </span>
                    <span className="text-green-400">
                      Remaining: ₹{remaining.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Hover Icons */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                    <Edit
                      className="w-5 h-5 text-blue-400 cursor-pointer hover:text-blue-300"
                      onClick={() => handleEdit(b)}
                    />
                    <Delete
                      className="w-5 h-5 text-red-400 cursor-pointer hover:text-red-300"
                      onClick={() => handleDelete(b)}
                    />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 py-10">No budgets found</p>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
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

      {/* Popup */}
      <AnimatePresence>
        {isPopupOpen && (
          <Dialog
            open={isPopupOpen}
            onClose={handleClose}
            disableScrollLock={false}
            TransitionProps={{ timeout: 300 }}
            PaperProps={{
              sx: { backgroundColor: "transparent", boxShadow: "none" },
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center overflow-hidden"
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
