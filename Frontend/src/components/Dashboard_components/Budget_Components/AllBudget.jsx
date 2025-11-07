import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Pagination } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { Edit, Delete, Wallet, Search } from "lucide-react";
import AddBudget from "./AddBudget";

const URL = import.meta.env.VITE_URL;

const AllBudget = ({ budget }) => {
  const [budgets, setBudgets] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    setBudgets(budget || []);
  }, [budget])
  
  const safeNum = (val) => Number(val || 0);

  const filtered = budgets.filter((b) =>
    [b.category, b.month, b.limit, b.spent]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-6 text-white w-full bg-[#262626] rounded-3xl flex flex-col">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Wallet className="w-7 h-7 text-blue-400" />
        <h2 className="text-3xl font-semibold text-center">All Budgets</h2>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="bg-[#1c1c1c] text-white pl-10 pr-4 py-3 rounded-lg w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
        <AnimatePresence>
          {paginated.length > 0 ? (
            paginated.map((b) => {
              const limit = safeNum(b.limit);
              const spent = safeNum(b.spent);
              // console.log(spent);
              const remaining = limit - spent;
              const percent = Math.min((spent / limit) * 100 || 0, 100);
              let barColor = "bg-green-500";
              if (percent >= 100) {
                barColor = "bg-red-600";
              } else if (percent >= 80) {
                barColor = "bg-yellow-500";
              }
              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1a1a1a] rounded-2xl p-5 shadow-md relative"
                >
                  <div className="flex justify-between items-center mb-2 mt-3">
                    <h3 className="text-lg font-semibold">{b.category}</h3>
                    <span className="text-sm text-gray-400">{b.month}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-grow h-3 rounded-full bg-[#333] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>

                    <span className="text-sm text-gray-300 font-medium">
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mt-3">
                    <span>Limit: ₹{limit.toLocaleString("en-IN")}</span>
                    <span>Spent: ₹{spent.toLocaleString("en-IN")}</span>
                    <span>Remaining: ₹{remaining.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-3">
                    <Edit
                      className="w-5 h-5 text-blue-400 cursor-pointer"
                      onClick={() => {
                        setPopup(b);
                        setIsPopupOpen(true);
                      }}
                    />
                    <Delete
                      className="w-5 h-5 text-red-400 cursor-pointer"
                      onClick={async () => {
                        try {
                          await axios.post(`${URL}/budget/delete`, { id: b._id }, { withCredentials: true });
                          toast.success("Budget deleted");
                          setBudgets(prev => prev.filter(t => t._id !== b._id));
                        } catch (err) {
                          toast.error(err?.response?.data?.message || err.message);
                        }
                      }}
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

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            variant="outlined"
          />
        </div>
      )}

      <AnimatePresence>
        {isPopupOpen && (
          <Dialog open={true} onClose={() => setIsPopupOpen(false)}>
            <AddBudget budget={popup} onClose={() => setIsPopupOpen(false)} />
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllBudget;
