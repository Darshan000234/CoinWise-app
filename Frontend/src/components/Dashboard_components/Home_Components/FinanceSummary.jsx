import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const FinanceSummary = () => {
  const categoryData = [
  { category: "Food", total: 800 },
  { category: "Transport", total: 400 },
  { category: "Entertainment", total: 600 },
  { category: "Bills", total: 600 },
  { category: "Shopping", total: 500 },
  { category: "Healthcare", total: 300 },
  { category: "Education", total: 450 },
  { category: "Misc", total: 200 },
  { category: "Travel", total: 700 },
  { category: "Subscriptions", total: 350 },
  { category: "Gifts", total: 250 },
  { category: "Fitness", total: 300 },
  { category: "Savings", total: 900 },
  { category: "Food", total: 800 },
  { category: "Transport", total: 400 },  
];


  const lineData = {
    labels: categoryData.map((c) => c.category),
    datasets: [
      {
        label: "Total Spend ($)",
        data: categoryData.map((c) => c.total),
        borderColor: "#3B82F6",
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.6)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: "#F59E0B",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // important to respect custom height
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        titleColor: "#F59E0B",
        bodyColor: "#fff",
        bodyFont: { weight: "bold" },
        callbacks: {
          label: function (context) {
            return `Total Spend: $${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 1,
        max: 1000,
        title: { display: true, text: "Amount ($)", color: "#fff", font: { size: 14, weight: "bold" } },
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        title: { display: true, text: "Category", color: "#fff", font: { size: 14, weight: "bold" } },
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className="flex justify-center mt-10 transition-all duration-1000 ease-in-out">
  <div className="w-[1278px] p-6 bg-[#1a1a1a] rounded-2xl shadow-2xl flex flex-col min-h-[500px]">
    <h2 className="text-3xl font-bold text-white mb-6 text-center">
      Category-wise Spending In This Month
    </h2>
    <div className="flex-1">
      <Line data={lineData} options={options} />
    </div>
  </div>
</div>

  );
};

export default FinanceSummary;
