import React, { useState } from 'react'
import AddTransaction from './Home_Components/AddTransaction'
import Recent_Transaction from './Home_Components/Recent_Transaction'
import FinanceSummary from './Home_Components/FinanceSummary'
import BudgetGoals from './Home_Components/BudgetGoals'
import { useOutletContext } from 'react-router-dom'
import { Upload, FileImage, FileText } from "lucide-react";
import axios from 'axios'
import toast from 'react-hot-toast'

const URL = import.meta.env.VITE_URL;
const Dashboard_Home = () => {
  const { isCollapsed } = useOutletContext();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);              // Save file in state
    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected)); // create a preview link for image
    } else {
      setPreview(null); // No preview for PDFs
    }
  };

  const handleUpload = async (e) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        `${URL}/transaction/uploads`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
    }
  };


  return (
    <div>
      <div>
      </div>
      <div className="mt-6 p-4 flex flex-col gap-6">
        {/* Top 4 summary cards */}
        <div className="flex justify-between gap-4">
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Balance</div>
            <div className="text-2xl font-bold">$5,000</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Income</div>
            <div className="text-2xl font-bold">$3,000</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Expenses</div>
            <div className="text-2xl font-bold">$2,000</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Savings Rate</div>
            <div className="text-2xl font-bold">40%</div>
          </div>
        </div>

        {/* Your next container will come here */}
        <div className='flex rounded-2xl bg-white/5 h-full w-full p-4 flex-col justify-start'>
          <div className='flex gap-12'>
            <div>
              <AddTransaction />
              <div className=" mt-5 ml-1 w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Upload Receipt (Image / PDF)
                </h2>

                {/* Upload box */}
                <label className="flex flex-col items-center justify-center w-full h-25 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    Click or drag & drop to upload
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Preview / file info */}
                {file && (
                  <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}
                {/* Upload button at the end */}
              {file && (
                <button
                  onClick={handleUpload}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
                >
                  Upload
                </button>
              )}
              </div>
            </div>
            <div>
              <Recent_Transaction isCollapsed={isCollapsed} />
              <BudgetGoals isCollapsed={isCollapsed} />
            </div>
          </div>
          <div className="flex justify-start w-full">
            <div className="w-full transition-all duration-500 ease-in-out">
              <FinanceSummary isCollapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard_Home