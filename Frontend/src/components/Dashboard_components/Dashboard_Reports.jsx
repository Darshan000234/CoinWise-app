import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Monthweek_report from "./Report_Components/Monthweek_report";
import { generateInsights } from "./Report_Components/generateInsights";
import MonthComparison_report from "./Report_Components/MonthComparison_report";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_URL;

const Dashboard_Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [reportData, setReportData] = useState(null);
  const reportRef = useRef();
  const chartRefs = [useRef(), useRef(), useRef()];

  useEffect(() => {
    const getData = async () => {
      try {
        const userRes = await axios.get(`${BASE_URL}/user/getdata`, {
          withCredentials: true,
        });
        setUser(userRes.data);
        const reportRes = await axios.get(`${BASE_URL}/dashboard/report/data`, {
          withCredentials: true,
        });
        setReportData(reportRes.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, {
          duration: 3000,
        });
      }
    };

    const validateSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/validate-session`, {
          withCredentials: true,
        });
        if (!res.data.isValid) navigate("/");
        else getData();
      } catch {
        navigate("/");
      }
    };

    validateSession();
  }, []);


  const handleGeneratePDF = async () => {
    if (!reportData || !reportData.current || !reportData.previous || !user?._id) {
      toast.error("Report data not ready");
      return;
    }

    try {

      reportData.current.summary.categoryData = reportData.current.categoryData;
      reportData.previous.summary.categoryData = reportData.previous.categoryData;

      const insights = generateInsights(
        reportData.current.summary,
        reportData.previous.summary
      );

      const payload = {
        userId: user._id,
        full_name: user.full_name,
        month: new Date().toISOString().slice(0, 7),
        data: {
          totalIncome: Number(reportData.current.summary.monthly_income),
          totalSpend: Number(reportData.current.summary.Expenses),
          totalSaved:
            Number(reportData.current.summary.Net_Saving) ||
            (Number(reportData.current.summary.monthly_income) -
              Number(reportData.current.summary.Expenses)),
          categoryData: reportData.current.categoryData ?? [],
          insight: insights,
        },
      };

      const saveRes = await axios.post(
        `${BASE_URL}/dashboard/report/save`,
        payload,
        { withCredentials: true }
      );

      const reportId = saveRes.data.reportId;
      const genRes = await axios.get(
        `${BASE_URL}/dashboard/report/generate/${reportId}`,
        { withCredentials: true }
      );

      const downloadUrl = `${BASE_URL}${genRes.data.downloadUrl}`;
      toast.success("PDF generated successfully!");
      window.location.href = downloadUrl;
    } catch (err) {
      console.error(err, "PDF Generation Error");
      toast.error(err?.response?.data?.error || "Failed to generate PDF");
    }
  };

  return (
    <div>
      <div className="mt-6 p-3 flex flex-col gap-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <SummaryCard
            title="Total Balance"
            value={`₹${Number(user.Net_Saving) || 0}`}
          />
          <SummaryCard
            title="Total Income"
            value={`₹${Number(user.monthly_income) || 0}`}
          />
          <SummaryCard
            title="Total Expenses"
            value={`₹${Number(user.Expenses) || 0}`}
          />
          <SummaryCard
            title="Average of Expenses"
            value={`₹${Number(user.Average) || 0}`}
          />
          <SummaryCard
            title="Highest Spending Category"
            value={user.Highest ?? "N/A"}
          />
        </div>
      </div>

      <div
        ref={reportRef}
        className="bg-white/5 p-6 min-h-screen rounded-3xl"
      >
        <div className="bg-[#1a1a1a] text-white p-8 rounded-2xl mt-10 shadow-xl">
          <Monthweek_report chartRefs={chartRefs} />

          <div className="flex flex-col items-start mt-8">
            <button
              onClick={handleGeneratePDF}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all cursor-pointer"
            >
              Download Monthly Expense Report (PDF)
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Includes summary, charts, and personalized insights
            </p>
          </div>

          <MonthComparison_report
            currentMonthData={reportData?.current?.categoryData || []}
            previousMonthData={reportData?.previous?.categoryData || []}
          />
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
    <div className="text-lg text-gray-400 leading-tight">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default Dashboard_Reports;
