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
import { Inbox } from "lucide-react";
import CustomLineTooltip from "./Customelinetool";

const MonthComparisonReport = ({ currentMonthData = [], previousMonthData = [] }) => {
  const chartData = currentMonthData.map((item) => {
    const prevMatch = previousMonthData.find((p) => p._id === item._id);
    return {
      category: item._id || "Unknown",
      Current: item.totalAmount || 0,
      Previous: prevMatch ? prevMatch.totalAmount || 0 : 0,
    };
  });

  if ( !currentMonthData.length || !previousMonthData.length || chartData.every(d => d.Current === 0 && d.Previous === 0)) {
    return (
      <div className="bg-[#1f1f1f] rounded-2xl p-6 mt-6 shadow-lg flex flex-col items-center justify-center h-80 text-gray-400">
        <Inbox size={48} className="mb-4" />
        <span className="text-lg font-medium">No comparison data available</span>
      </div>
    );
  }

  return (
    <div className="bg-[#1f1f1f] rounded-2xl p-6 mt-6 shadow-lg">
      <h2 className="text-white text-xl font-semibold mb-4 text-center">
        Month Comparison
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="category" tick={{ fill: "#ccc", fontSize: 14 }} />
          <YAxis tick={{ fill: "#ccc", fontSize: 14 }} />
          <Tooltip
            cursor={false}
            content={<CustomLineTooltip />}
            wrapperStyle={{ backgroundColor: "transparent", border: "none" }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />
          <Bar dataKey="Current" fill="#4f9cff" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Previous" fill="#ff6b6b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthComparisonReport;
