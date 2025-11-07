import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const URL = import.meta.env.VITE_URL;

const BudgetGoals = ({ isCollapsed }) => {
  const [Budgets, SetBudgets] = useState([]);

  useEffect(() => {
    const BudgetData = async () => {
      try {
        const res = await axios.get(`${URL}/budget/data`, { withCredentials: true });
        SetBudgets(res.data.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      }
    };

    BudgetData();
    const interval = setInterval(BudgetData, 5000);
    return () => clearInterval(interval);
  }, []);

  const visibleBudgets = Budgets.slice(0, 4);

  const redirectToAllBudgets = () => {
    window.location.href = "/dashboard/budgets";
  };

  return (
    <div
      className="bg-[#1a1a1a] rounded-2xl p-6 shadow-md mt-8 transition-all duration-500 ease-in-out"
      style={{ width: isCollapsed ? "890px" : "750px" }}
    >
      <h2 className="text-xl font-semibold mb-5 text-white">Budget & Goals</h2>

      {Budgets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg mb-2">No budgets have been set yet.</p>
          <p className="text-gray-500 text-sm">
            Start by creating a budget for your categories to track your spending.
          </p>
        </div>
      )}

      {visibleBudgets.map((item, index) => {
        const progress = Number(item.limit)
          ? Math.min((Number(item.spent) / Number(item.limit)) * 100, 100)
          : 0;

        return (
          <div key={index} className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 font-medium">{item.category}</span>
              <span className="text-gray-400 text-sm">
                ₹{Number(item.spent)} / ₹{Number(item.limit)}
              </span>
            </div>

            <div className="w-full h-3 bg-gray-700/30 rounded-full">
              <div
                className={`h-3 rounded-full ${
                  progress >= 100 ? "bg-red-500" : "bg-blue-600"
                } transition-all duration-300`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        );
      })}

      {Budgets.length > 4 && (
        <div className="text-center mt-4">
          <button
            onClick={redirectToAllBudgets}
            className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
          >
            See All Budgets
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetGoals;
