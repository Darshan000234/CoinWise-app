import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import Transaction from "./Home_Components/AddTransaction";
import transaction from "./Home_Components/Transaction"
import { Dialog } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { Delete,Edit } from "lucide-react";

const URL = import.meta.env.VITE_URL;
const Dashboard_Transaction = () => {
  const [transactions, setTransactions] = useState([{
      _id: "1",
      date: "2025-10-12",
      type : "expense",
      category: "Food",
      amount: 450.75,
      description: "Dinner at restaurant",
    }]);
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [popup, setPopup] = useState(null); // stores selected transaction
  const [isPopupOpen, setIsPopupOpen] = useState(false); // controls popup visibility
  const itemsPerPage = 12;

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${URL}/transaction`,{withCredentials : true});
        // setTransactions(res.data.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      }
    }
    getData();
    const interval = setInterval(getData,3000);
    return () => clearInterval(interval);
  }, [])
  
  const filteredTransactions = transactions.filter((txn) => {
    return (
      txn.category.toLowerCase().includes(query.toLowerCase()) ||
      txn.description.toLowerCase().includes(query.toLowerCase()) ||
      txn.amount.toString().includes(query) ||
      txn.date.includes(query)
    );
  });

  // ✅ Sort by date
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if(order === "Aasc"){
      return (a.amount) - (b.amount);
    }
    if(order === "Adesc"){
      return (b.amount) - (a.amount);
    }
    return order === "asc"
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date);
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ✅ Toggle sort order
  const toggleSort = (value) => {
    if (value === "amount") {
      setOrder(order === "Aasc" ? "Adesc" : "Aasc");
    } else {
      setOrder(order === "asc" ? "desc" : "asc");
    }
    console.log(value);
  };

  const EditData = (txn) => {
    setPopup(txn);           // store transaction data
    setIsPopupOpen(true);    // open dialog
  };

  const handleClose = () => {
    setPopup(null);
    setIsPopupOpen(false);
  };
  const DeleteData = async (txn) => {
    try {
      const id = txn._id;
      const res = await axios.post(`${URL}/transaction/delete`,id,{withCredentials : true});
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
    }
  }
  return (
    <div className="p-6 text-white min-h-screen flex flex-col items-center bg-[#262626] rounded-3xl">
      <h2 className="text-3xl font-semibold mb-8 text-center">
        💰 All Transactions
      </h2>

      {/* Search Bar */}
      <div className="mb-6 w-full flex justify-center">
        <input
          type="text"
          placeholder="🔍 Search by date, category, notes, or amount"
          className="bg-[#1c1c1c] text-white px-4 py-3 rounded-lg w-96 focus:ring-2 focus:ring-blue-500 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Styled Table Wrapper */}
      <div className="rounded-2xl overflow-hidden shadow-md bg-[#1a1a1a] w-full max-w-5xl">
        <table className="w-full border-collapse">
          <thead className="bg-[#0d0d0d] text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                onClick={toggleSort}
              >
                Date {order === "asc" ? "↑" : "↓"}
              </th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">Notes</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th data-value="amount" className="px-4 py-3 text-left font-semibold cursor-pointer select-none" onClick={(e) => toggleSort(e.target.dataset.value)}>
                Amount {order === "Aasc" ? "↑" : "↓"}
              </th>
              <th className="px-4 py-3 text-left font-semibold">Edit</th>
              <th className="px-4 py-3 text-left font-semibold">Delete</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((txn) => (
                <tr
                  key={txn._id}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-4 py-3  ">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 ">
                    <input
                      type="text"
                      readOnly
                      value={txn.category}
                      className="bg-transparent w-full outline-none text-gray-200"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      readOnly
                      value={txn.description || "-"}
                      className="bg-transparent w-full outline-none text-gray-400 break-words"
                    />
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      txn.type === "expense" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                  </td>
                  <td className="px-4 py-3  text-left font-medium text-gray-100">
                    ${txn.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3  text-left font-medium text-gray-100 cursor-pointer" onClick={() => EditData(txn)}>
                    Edit <Edit className="inline w-5 h-5 cursor-pointer ml-[2px]" />
                  </td>
                  <td className="px-4 py-3  text-left font-medium text-gray-100 cursor-pointer" onClick={() => DeleteData(txn)}>
                    Delete <Delete className="inline w-5 h-5 cursor-pointer ml-[2px]" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-400 "
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            variant="outlined"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "white",
                borderColor: "#555",
              },
              "& .Mui-selected": {
                backgroundColor: "#2563eb !important",
                color: "#fff",
                borderColor: "#2563eb",
              },
            }}
          />
        </div>
      )}
      <Dialog
        open={isPopupOpen}
        onClose={handleClose}
      >
        {popup && (
          <Transaction
            txn={popup}        // pass selected transaction as prop
            onClose={handleClose}
          />
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard_Transaction;
