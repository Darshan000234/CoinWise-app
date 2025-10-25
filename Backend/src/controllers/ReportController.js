import axios from "axios";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { Data } from "../controllers/UserController.js";
import Report from "../models/Report.js";
import { generatePdfWithPuppeteer } from "../utils/pdfGenerator.js";
// import

const URL = process.env.URL;

const getDateRange = (type, range) => {
  if (!type || !range) return { start: null, end: null };
  if (type === "month") {
    const [year, month] = range.split("-");
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999);
    return { start: firstDay, end: lastDay };
  }

  // Week type (YYYY-Wxx)
  if (type === "week") {
    const base = new Date(range);
    const day = base.getDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = (day + 6) % 7;

    const monday = new Date(base);
    monday.setDate(base.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }

  return { start: null, end: null };
};

// BAR API
export const bar = async (req, res) => {
  const id = req.user.id;
  const { type, range } = req.query;
  try {
    const { start, end } = getDateRange(type, range);
    if (!start || !end) {
      return res.status(200).json({ categoryData: [] });
    }
    const filter = { user_id: id };
    if (start && end) filter.date = { $gte: start, $lte: end };

    const data = await Transaction.find(filter);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No transactions found for the selected range." });
    }

    const userData = await User.findById(id);

    const income = data.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const total = (userData?.monthly_income || 0) + income;
    const saved = total - expense;

    res.status(200).json({ totalSpent: expense, totalSaved: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PIE API
export const pie = async (req, res) => {
  const { type, range } = req.query;

  try {
    const { start, end } = getDateRange(type, range);
    if (!start || !end) {
      return res.status(200).json({ categoryData: [] });
    }
    const result = await axios.get(
      `${URL}/transaction/category?start=${start?.toISOString() || ""}&end=${end?.toISOString() || ""}`,
      { withCredentials: true }
    );

    if (!result.data?.data || result.data.data.length === 0) {
      return res.status(404).json({ message: "No category data found for the selected range." });
    }

    res.status(200).json({ categoryData: result.data.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LINE API
export const line = async (req, res) => {
  const id = req.user.id;
  const { type, range } = req.query;

  try {
    const { start, end } = getDateRange(type, range);
    if (!start || !end) {
      return res.status(200).json({ categoryData: [] });
    }
    const filter = { user_id: id };
    if (start && end) filter.date = { $gte: start, $lte: end };

    const transactions = await Transaction.find(filter);

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for the selected range." });
    }

    const dailySpend = {};

    transactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().slice(0, 10);
      dailySpend[dateKey] = (dailySpend[dateKey] || 0) + t.amount;
    });

    const dailyData = Object.entries(dailySpend).map(([date, amount]) => ({ date, amount }));
    res.status(200).json({ dailyData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const data = async (req, res) => {
  try {
    const id = req.user.id;
    const currentDate = new Date();
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const categoryData = await Transaction.aggregate([
      { $match: { user_id: id, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      { $sort: { totalAmount: -1 } },
    ]);
    const prevMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevCategoryData = await Transaction.aggregate([
      { $match: { user_id: id, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
    ]);
    const prevUserData = await Data({ ...req, query: { prev: "0" } }, res); // simulate internal call
    const result = {
      current : {
        categoryData,
        Highest_category: categoryData[0] || null,
      },
      previous : {
        categoryData : prevCategoryData,
        income: prevUserData.monthly_income,
        Expenses: prevUserData.Expenses,
        netSaving: prevUserData.Net_Saving,
      }
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const save = async (req, res) => {
  try {
    const { userId, month, data, charts } = req.body;
    const newReport = new Report({
      userId,
      month,
      data,
      charts,
    });
    await newReport.save();
    res.status(201).json({ reportId: newReport._id });
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ error: "Failed to save report" });
  }
};

export const generate = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("userId", "name email");

    if (!report) return res.status(404).json({ error: "Report not found" });
    const pdfPath = await generatePdfWithPuppeteer(report);
    report.pdfPath = pdfPath;
    report.generatedAt = new Date();
    await report.save();
    res.status(200).json({ downloadUrl: `/reports/download/${report._id}` });
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

export const download = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report?.pdfPath) {
      return res.status(404).json({ error: "PDF not found" });
    }

    res.download(report.pdfPath);
  } catch (err) {
    console.error("Error downloading PDF:", err);
    res.status(500).json({ error: "Failed to download PDF" });
  }
};