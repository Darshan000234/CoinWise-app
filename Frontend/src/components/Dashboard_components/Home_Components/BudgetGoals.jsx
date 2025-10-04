import React from "react";

const budgets = [
  { category: "Food", limit: 500, spent: 480 },
  { category: "Travel", limit: 300, spent: 180 },
  { category: "Entertainment", limit: 250, spent: 100 },
  { category: "Bills", limit: 400, spent: 350 },
  { category: "Shopping", limit: 200, spent: 50 },
];

const BudgetGoals = ({isCollapsed}) => {
  return (
    <div
      className="bg-[#1a1a1a] rounded-2xl p-6 shadow-md mt-8 transition-all duration-500 ease-in-out"
      style={{ width: isCollapsed ? "890px" : "750px" }}
    >
      <h2 className="text-xl font-semibold mb-5 text-white">Budget & Goals</h2>

      {budgets.map((item, index) => {
        const progress = Math.min((item.spent / item.limit) * 100, 100);

        return (
          <div key={index} className="mb-5">
            {/* Category & amount */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 font-medium">{item.category}</span>
              <span className="text-gray-400 text-sm">
                ${item.spent} / ${item.limit}
              </span>
            </div>

            {/* Progress bar background */}
            <div className="w-full h-3 bg-gray-700/30 rounded-full">
              {/* Progress bar fill */}
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
    </div>
  );
};

export default BudgetGoals;
