import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Monthweek_report from "./Report_Components/Monthweek_report";
import {generateInsights} from "./Report_Components/generateInsights";
import MonthComparison_report from "./Report_Components/MonthComparison_report";
import { useNavigate } from "react-router-dom";

const URL = import.meta.env.VITE_URL;

const Dashboard_Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [reportData, setReportData] = useState(null);
  const reportRef = useRef();
  const chartRefs = [useRef(), useRef(), useRef()];
  useEffect(() => {
    const getData = async () => {
      try {
        const userRes = await axios.get(`${URL}/user/getdata`, {
          withCredentials: true,
        });
        setUser(userRes.data);
        const reportRes = await axios.get(`${URL}/dashboard/report/data`, {
          withCredentials: true,
        });
        setReportData(reportRes.data);
        if(reportData?.current && userRes?.data){
          reportData.current.totalIncome =  userRes.data.monthly_income;
          reportData.current.totalSpend =  userRes.data.Expenses;
          reportData.current.netSaving = userRes.data.Net_Saving;
        }
        } catch (err) {
        toast.error(err?.response?.data?.message || err.message, {
          duration: 3000,
        });
      }
    };
    getData();
    const validateSession = async () => {
      try {
        const res = await axios.get(`${URL}/user/validate-session`, { withCredentials: true });
        if (!res.data.isValid) navigate('/');
      } catch {
        navigate('/');
      }
    };
    validateSession();
  }, []);

  const handleGeneratePDF = async () => {
    if (!reportData || !user?._id) {
      toast.error("Report data not ready");
      return;
    }
    try {
      const chartImages = chartRefs
        .map((ref, i) => {
          const canvas = ref.current?.querySelector("canvas");
          if (!canvas) return null;
          return {
            name: `chart_${i + 1}`,
            dataUrl: canvas.toDataURL("image/png"),
          };
        })
        .filter(Boolean);
      const insights = generateInsights(reportData.current, reportData.previous);
      const payload = {
        userId: user._id,
        month: new Date().toISOString().slice(0, 7), // e.g., 2025-10
        data: {
          totalIncome: reportData.current.totalIncome,
          totalSpend: reportData.current.totalSpend,
          totalSaved: reportData.current.totalIncome - reportData.current.totalSpend,
          categoryData: reportData.current.categoryData ?? [],
          insight: insights,
        },
        charts: chartImages,
      };

      const saveRes = await axios.post(`${URL}/dashboard/report/save`, payload, {
        withCredentials: true,
      });
      const reportId = saveRes.data.reportId;
      const genRes = await axios.post(
        `${URL}/dashboard/report/generate/${reportId}`,
        {},
        { withCredentials: true }
      );
      const downloadUrl = `${URL}${genRes.data.downloadUrl}`;
      toast.success("PDF generated successfully!");
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error(err,"PDF Generation Error");
      toast.error(err?.response?.data?.error || "Failed to generate PDF");
    }
  };

  return (
    <div>
      <div className="mt-6 p-3 flex flex-col gap-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Balance</div>
            <div className="text-2xl font-bold">
              ₹{Number(user.Net_Saving) || "0"}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Income</div>
            <div className="text-2xl font-bold">
              ₹{Number(user.monthly_income) || "0"}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Expenses</div>
            <div className="text-2xl font-bold">
              ₹{Number(user.Expenses) || "0"}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Average of Expenses</div>
            <div className="text-2xl font-bold">
              ₹{Number(user.Average) || "0"}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400 leading-tight">Highest Spending Category</div>
            <div className="text-2xl font-bold">
              {user.Highest ?? "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div  ref={reportRef} className="bg-white/5 p-6 min-h-screen rounded-3xl">
        <div className="bg-[#1a1a1a] text-white p-8 rounded-2xl mt-10 shadow-xl">
          <Monthweek_report chartRefs={chartRefs} />
          <div className="flex flex-col items-start mt-8">
            <button
              onClick={handleGeneratePDF}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
            >
              Download Monthly Expense Report (PDF)
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Includes summary, charts, and personalized insights
            </p>
          </div>
          <div>
            <MonthComparison_report currentMonthData={reportData?.current?.categoryData || []} previousMonthData={reportData?.previous?.categoryData || []}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_Reports;
