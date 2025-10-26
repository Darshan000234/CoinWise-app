import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CustomLineTooltip from "./Customelinetool";
import CustomTooltip from "./Custometool.jsx";
const MonthComparisonReport = ({ currentMonthData, previousMonthData }) => {
  // Default mock data for current and previous months
  const defaultCurrent = [
    { category: "Food", amount: 2200 },
    { category: "Rent", amount: 5000 },
    { category: "Transport", amount: 1200 },
    { category: "Entertainment", amount: 900 },
    { category: "Others", amount: 600 },
  ];

  const defaultPrevious = [
    { category: "Food", amount: 1800 },
    { category: "Rent", amount: 4800 },
    { category: "Transport", amount: 1000 },
    { category: "Entertainment", amount: 700 },
    { category: "Others", amount: 500 },
  ];

  const currentData = currentMonthData?.length ? currentMonthData : defaultCurrent;
  const previousData = previousMonthData?.length ? previousMonthData : defaultPrevious;

  const chartData = currentData.map((item, index) => ({
    category: item.category,
    Current: item.amount,
    Previous: previousData[index]?.amount || 0,
  }));

  if (!chartData.length) {
    return <div className="text-gray-400 text-center py-8">No data available for comparison</div>;
  }

  return (
    <div className="bg-[#1f1f1f] rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-white text-xl font-semibold mb-4 text-center">
        Month Comparison
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="category" tick={{ fill: "#ccc", fontSize: 14 }} />
          <YAxis tick={{ fill: "#ccc", fontSize: 14 }} />
          <Tooltip
            content={<CustomLineTooltip/>}
            wrapperStyle={{ backgroundColor: "transparent", border: "none" }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />
          <Bar dataKey="Current" fill="#4f9cff" radius={[6, 6, 0, 0]} activeBar={false}/>
          <Bar dataKey="Previous" fill="#ff6b6b" radius={[6, 6, 0, 0]} activeBar={false}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthComparisonReport;
