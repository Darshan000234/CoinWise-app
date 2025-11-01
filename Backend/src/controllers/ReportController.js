import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Report from "../models/Report.js";
import { generatePdfWithPuppeteer } from "../utils/pdfGenerator.js";
import Notification from "../models/Notification.js";

const getDateRange = (type, range) => {
  if (!type || !range) return { start: null, end: null };

  if (type === "month") {
    const [year, month] = range.split("-");
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { start, end };
  }

  if (type === "week") {
    const base = new Date(range);
    const day = base.getUTCDay();
    const diffToMonday = (day + 6) % 7;

    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }

  return { start: null, end: null };
};

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
      return res.status(200).json({ message: "No transactions found for the selected range." });
    }

    const userData = await User.findById(id);

    const income = data.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const total = (userData?.monthly_income || 0) + income;
    const saved = total - expense;

    return res.status(200).json({ totalSpent: expense, totalSaved: saved });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const pie = async (req, res) => {
  const { type, range } = req.query;
  const userId = req.user.id;

  try {
    const { start, end } = getDateRange(type, range);
    if (!start || !end) {
      return res.status(200).json({ categoryData: [] });
    }
    const categoryData = await Transaction.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          categoryLower: { $toLower: "$category" },
          amount: 1,
          type: 1,
        },
      },
      {
        $group: {
          _id: "$categoryLower",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    if (!categoryData || categoryData.length === 0) {
      return res
        .status(200)
        .json({ message: "No category data found for the selected range." });
    }
    return res.status(200).json({ categoryData });
  } catch (err) {
    console.error("Error generating pie data:", err);
    if (!res.headersSent) return res.status(500).json({ error: err.message });
  }
};

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
      return res.status(200).json({ message: "No transactions found for the selected range." });
    }

    const dailySpend = {};

    transactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().slice(0, 10);
      dailySpend[dateKey] = (dailySpend[dateKey] || 0) + t.amount;
    });

    const dailyData = Object.entries(dailySpend).map(([date, amount]) => ({ date, amount }));
    return res.status(200).json({ dailyData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const data = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    const baseIncome = user?.monthly_income ?? 0;

    const currentDate = new Date();

    const currStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const prevStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const [currTx, prevTx] = await Promise.all([
      Transaction.find({ user_id: id, date: { $gte: currStart, $lte: currEnd } }),
      Transaction.find({ user_id: id, date: { $gte: prevStart, $lte: prevEnd } }),
    ]);

    const getSummary = (txList, baseIncomeValue) => {
      const incomeTx = txList.filter(t => t.type === "income");
      const expenseTx = txList.filter(t => t.type === "expense");

      const totalIncome = baseIncomeValue + incomeTx.reduce((s, t) => s + t.amount, 0);
      const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);

      const categoryTotals = {};
      expenseTx.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      const highestCategory =
        Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      return {
        monthly_income: totalIncome.toFixed(2),
        Expenses: totalExpense.toFixed(2),
        Net_Saving: (totalIncome - totalExpense).toFixed(2),
        Average: expenseTx.length ? (totalExpense / expenseTx.length).toFixed(2) : "0",
        Highest: highestCategory,
        categoryTotals,
      };
    };

    const currentSummary = getSummary(currTx, baseIncome);
    const previousSummary = getSummary(prevTx, baseIncome);

    const [currCategoryData, prevCategoryData] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
            date: { $gte: currStart, $lte: currEnd },
          },
        },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
        { $sort: { totalAmount: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
            date: { $gte: prevStart, $lte: prevEnd },
          },
        },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
        { $sort: { totalAmount: -1 } },
      ]),
    ]);

    const result = {
      current: {
        summary: currentSummary,
        categoryData: currCategoryData,
        Highest_category: currCategoryData[0]?._id || "N/A",
      },
      previous: {
        summary: previousSummary,
        categoryData: prevCategoryData,
        Highest_category: prevCategoryData[0]?._id || "N/A",
      },
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in data API:", error);
    res.status(500).json({ message: "Failed to fetch report data", error: error.message });
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
    await Notification.create({
      user_id: report.userId,
      message: `Your report for ${report.month}  was downloaded.`,
    });
    res.download(report.pdfPath);
  } catch (err) {
    console.error("Error downloading PDF:", err);
    res.status(500).json({ error: "Failed to download PDF" });
  }
};