import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const URL = import.meta.env.VITE_URL || "http://localhost:3000";
const Recent_Transaction = () => {
  const [data, setData] = useState([]);;

  // useEffect(() => {
  //   const getData = async () =>{
  //     try {
  //       let res = await axios.get(`${URL}/transaction`,{withCredentials:true});

  //     } catch (error) {
  //       toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
  //     }
  //   }
  //   getData();
  // }, [])
  
  const handleDelete = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  return (
    <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-md bg-[#1a1a1a] text-white">
      <thead className="bg-[#0d0d0d]">
        <tr>
          <th className="px-4 py-2 text-left font-semibold">Date</th>
          <th className="px-4 py-2 text-left font-semibold">Category</th>
          <th className="px-4 py-2 text-left font-semibold">Amount</th>
          <th className="px-4 py-2 text-left font-semibold">Notes</th>
          <th className="px-4 py-2 text-center font-semibold">Delete</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            className="hover:bg-white/5 transition-colors duration-200"
          >
            <td className="px-4 py-2">
              <input
                type="text"
                value={row.date}
                onChange={(e) => handleChange(index, "date", e.target.value)}
                className="w-full bg-[#0d0d0d] text-white border border-white/20 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="px-4 py-2">
              <input
                type="text"
                value={row.category}
                onChange={(e) => handleChange(index, "category", e.target.value)}
                className="w-full bg-[#0d0d0d] text-white border border-white/20 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="px-4 py-2">
              <input
                type="text"
                value={row.amount}
                onChange={(e) => handleChange(index, "amount", e.target.value)}
                className="w-full bg-[#0d0d0d] text-white border border-white/20 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="px-4 py-2">
              <input
                type="text"
                value={row.notes}
                onChange={(e) => handleChange(index, "notes", e.target.value)}
                className="w-full bg-[#0d0d0d] text-white border border-white/20 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td className="px-4 py-2 text-center">
              <button
                onClick={() => handleDelete(index)}
                className=" bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg shadow-md transition-colors duration-200"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Recent_Transaction;
