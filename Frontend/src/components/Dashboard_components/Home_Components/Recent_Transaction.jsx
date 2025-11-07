import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const URL = import.meta.env.VITE_URL;

const Recent_Transaction = ({ isCollapsed }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${URL}/transaction?limit=6`, { withCredentials: true });
        setData(res.data.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      }
    };
    getData();
    const interval = setInterval(getData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (index) => {
    try {
      const id = data[index]._id;
      const res = await axios.post(`${URL}/transaction/delete`, { _id: id }, { withCredentials: true });
      toast.success(res.data.message);
      setData(prev => prev.filter((_, idx) => idx !== index));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
    }
  };

  const moreTransaction = () => {
    window.location.href = '/dashboard/transactions';
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md bg-[#1a1a1a] text-white transition-all duration-500 ease-in-out"
      style={{ width: isCollapsed ? "890px" : "750px" }}
    >
      <table className="w-full border-collapse table-fixed">
        <thead className="bg-[#0d0d0d]">
          <tr>
            <th className="px-4 py-2 text-left font-semibold w-[23%]">Date</th>
            <th className="px-4 py-2 text-left font-semibold w-[23%]">Category</th>
            <th className="px-4 py-2 text-left font-semibold w-[23%]">Amount</th>
            <th className="px-4 py-2 text-left font-semibold w-[31%]">Notes</th>
            {isCollapsed && (
              <th className="px-4 py-2 text-center font-semibold w-[12%]">Delete</th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row._id} className="hover:bg-white/5 transition-colors duration-200">
                <td className="px-4 py-2 truncate">{row.date}</td>
                <td className="px-4 py-2 truncate">{row.category}</td>
                <td className="px-4 py-2 truncate">{row.amount}</td>
                <td className="px-4 py-2 break-words text-gray-400">
                  {row.description || "-"}
                </td>

                {isCollapsed && (
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-400 hover:text-red-600 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={isCollapsed ? 5 : 4}
                className="text-center py-4 text-gray-400"
              >
                No transactions have been added
              </td>
            </tr>
          )}

          {data.length >= 6 && (
            <tr>
              <td
                colSpan={isCollapsed ? 5 : 4}
                className="text-center py-2"
              >
                <button
                  className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
                  onClick={moreTransaction}
                >
                  See All Transactions
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Recent_Transaction;
