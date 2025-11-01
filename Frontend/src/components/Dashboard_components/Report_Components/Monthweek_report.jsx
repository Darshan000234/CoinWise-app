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
import { toast } from "react-hot-toast";
import { Inbox } from "lucide-react";

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AF19FF"];

const URL = import.meta.env.VITE_URL;

const Monthweek_report = ({ chartRefs }) => {
  const [barFilter, setBarFilter] = useState({ type: "month", range: "" });
  const [pieFilter, setPieFilter] = useState({ type: "month", range: "" });
  const [lineFilter, setLineFilter] = useState({ type: "month", range: "" });

  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});
  const [lineData, setLineData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 7);
    setBarFilter((f) => ({ ...f, range: today }));
    setPieFilter((f) => ({ ...f, range: today }));
    setLineFilter((f) => ({ ...f, range: today }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [barRes, pieRes, lineRes] = await Promise.all([
          axios.get(`${URL}/dashboard/report/bar?type=${barFilter.type}&range=${barFilter.range}`, { withCredentials: true }),
          axios.get(`${URL}/dashboard/report/pie?type=${pieFilter.type}&range=${pieFilter.range}`, { withCredentials: true }),
          axios.get(`${URL}/dashboard/report/line?type=${lineFilter.type}&range=${lineFilter.range}`, { withCredentials: true }),
        ]);
        setPieData(pieRes.data || {});
        setBarData(barRes.data || {});
        setLineData(lineRes.data || {});
        console.log(pieRes.data);
      } catch (err) {
        console.log(err.message);
      }
      finally {
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
    return <div className="text-center text-gray-400 py-20">Fetching report data...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-10 text-center tracking-wide">
        Monthly / Weekly Reports
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <div ref={chartRefs[0]} className="bg-[#111] p-6 rounded-xl shadow-lg">
          {(barData && (barData.totalSpent && barData.totalSaved)) ? (
            <>
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Total Spent vs Saved</h3>
              <Filter filter={barFilter} setFilter={setBarFilter} />
              <div ref={chartRefs[0]}>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={[
                      {
                        name: barFilter.range,
                        Spent: barData.totalSpent || 0,
                        Saved: barData.totalSaved || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip cursor={false} content={<CustomBartool />} />
                    <Legend />
                    <Bar dataKey="Spent" fill="#FF4C4C" barSize={60} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Saved" fill="#4CAF50" barSize={60} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 text-gray-400">
              <Inbox size={48} className="mb-4" />
              <span className="text-lg font-medium">No transactions found for this period</span>
            </div>
          )}
        </div>

        <div ref={chartRefs[1]} className="bg-[#111] p-6 rounded-xl shadow-lg">
          {(pieData && pieData.categoryData && pieData.categoryData.length > 0) ? (
            <>
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Category Distribution</h3>
              <Filter filter={pieFilter} setFilter={setPieFilter} />
              <div ref={chartRefs[1]}>
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie
                      data={pieData.categoryData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="totalAmount"
                      nameKey="_id"
                      label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(pieData.categoryData || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />}  />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 text-gray-400">
              <Inbox size={48} className="mb-4" />
              <span className="text-lg font-medium">No category data available</span>
            </div>
          )}
        </div>
      </div>

      <div ref={chartRefs[2]} className="bg-[#111] p-6 rounded-xl shadow-lg">
        {(lineData && lineData.dailyData && lineData.dailyData.length > 0) ? (
          <>
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Daily Spend Trend</h3>
            <Filter filter={lineFilter} setFilter={setLineFilter} />
            <div ref={chartRefs[2]}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineData.dailyData || []}>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <Inbox size={48} className="mb-4" />
            <span className="text-lg font-medium">No daily transactions available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Monthweek_report;
