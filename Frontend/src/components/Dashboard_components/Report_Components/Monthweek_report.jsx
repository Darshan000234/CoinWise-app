import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CustomTooltip from "./Custometool";
import CustomBartool from "./Customebartool";
import CustomLineTooltip from "./Customelinetool";
import axios from "axios";

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AF19FF"];

const URL = import.meta.env.VITE_URL;
const Monthweek_report = () => {
  // Filters for each chart
  const [barFilter, setBarFilter] = useState({ type: "month", range: "" });
  const [pieFilter, setPieFilter] = useState({ type: "month", range: "" });
  const [lineFilter, setLineFilter] = useState({ type: "month", range: "" });

  // Data states
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});
  const [lineData, setLineData] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 7); // YYYY-MM
    setBarFilter((f) => ({ ...f, range: today }));
    setPieFilter((f) => ({ ...f, range: today }));
    setLineFilter((f) => ({ ...f, range: today }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const barRes = await axios.get(`${URL}/dashboard/report/bar?type=${barFilter.type}&range=${barFilter.range}`,{withCredentials:true});
        const pieRes = await axios.get(`${URL}/dashboard/report/pie?type=${pieFilter.type}&range=${pieFilter.range}`,{withCredentials:true});
        const lineRes = await axios.get(`${URL}/dashboard/report/line?type=${lineFilter.type}&range=${lineFilter.range}`,{withCredentials:true});
        setBarData(barRes.data);
        setPieData(pieRes.data);
        setLineData(lineRes.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barFilter, pieFilter, lineFilter]);

  const Filter = ({ filter, setFilter }) => (
    <div className="flex gap-3 items-center mb-5">
      <select
        value={filter.type}
        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        className="bg-[#0e0e0e] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 transition"
      >
        <option value="month">Month</option>
        <option value="week">Week</option>
      </select>
      <input
        type={filter.type === "month" ? "month" : "week"}
        value={filter.range}
        onChange={(e) => setFilter({ ...filter, range: e.target.value })}
        className="bg-[#0e0e0e] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 transition"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-20">
        Fetching report data...
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] text-white p-8 rounded-2xl mt-10 shadow-xl">
      <h2 className="text-3xl font-semibold mb-10 text-center tracking-wide">
        Monthly / Weekly Reports
      </h2>

      {/* ================= BAR + PIE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* ---------- BAR CHART ---------- */}
        <div className="bg-[#111] p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Total Spent vs Saved
          </h3>
          <Filter filter={barFilter} setFilter={setBarFilter} />

          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={[
                {
                  name: barFilter.range,
                  Spent: barData.totalSpent,
                  Saved: barData.totalSaved,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                content={<CustomBartool />}
                wrapperStyle={{
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              />
              <Legend />
              <Bar dataKey="Spent" fill="#FF4C4C" barSize={60} radius={[8, 8, 0, 0]} />
              <Bar dataKey="Saved" fill="#4CAF50" barSize={60} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ---------- PIE CHART ---------- */}
        <div className="bg-[#111] p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Category Distribution
          </h3>
          <Filter filter={pieFilter} setFilter={setPieFilter} />

          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={pieData.categoryData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.categoryData?.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- LINE CHART ---------- */}
      <div className="bg-[#111] p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          Daily Spend Trend
        </h3>
        <Filter filter={lineFilter} setFilter={setLineFilter} />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={lineData.dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip content={<CustomLineTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#00C49F"
              strokeWidth={3}
              dot={{ r: 5, stroke: "#00C49F", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Monthweek_report;
