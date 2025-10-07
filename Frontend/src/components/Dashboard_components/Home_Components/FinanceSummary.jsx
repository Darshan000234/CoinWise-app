import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { toast } from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const URL = import.meta.env.VITE_URL;

const FinanceSummary = ({ isCollapsed, userId }) => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryData = async () => {
      try {
        const res = await axios.get(`${URL}/transaction/category`, {withCredentials: true});
        if (isMounted) setCategoryData(res.data.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      }
    };

    fetchCategoryData();
    const interval = setInterval(fetchCategoryData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  // Handle empty state
  if (categoryData.length === 0) {
    return (
      <div
        className="flex justify-center mt-10"
      >
        <div
          className="p-6 bg-[#1a1a1a] rounded-2xl shadow-2xl flex flex-col items-center justify-center min-h-[300px]"
          style={{ width: isCollapsed ? "1350px" : "1250px" }}
        >
          <span className="text-5xl text-gray-500 mb-4">📊</span>
          <h2 className="text-xl text-gray-400 font-semibold mb-2 text-center">
            No transactions added yet
          </h2>
          <p className="text-gray-500 text-center">
            Once you add transactions, your category-wise spending will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Chart data
  const lineData = {
    labels: categoryData.map((c) => c._id), // _id is category name
    datasets: [
      {
        label: "Total Spend ($)",
        data: categoryData.map((c) => c.totalAmount),
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
    maintainAspectRatio: false,
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
        min: 0,
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
    <div className="flex justify-center mt-10">
      <div
        className="p-6 bg-[#1a1a1a] rounded-2xl shadow-2xl flex flex-col min-h-[500px] transition-all duration-700 ease-in-out"
        style={{ width: isCollapsed ? "1350px" : "1250px" }}
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Category-wise Spending This Month
        </h2>
        <div className="flex-1">
          <Line data={lineData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;
