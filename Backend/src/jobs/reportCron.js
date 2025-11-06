import cron from "node-cron";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { generatePdfWithPuppeteer } from "../utils/pdfGenerator.js";
import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";
import path from "path";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

export const startReportCron = () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  cron.schedule("0 8 1 * *", async () => {
    console.log("Running monthly PDF report job...");

    const users = await User.find({});
    for (const user of users) {
      const month = new Date().toISOString().slice(0, 7);
      const report = await Report.findOne({ userId: user._id, month });
      await Notification.deleteMany({ user_id: user._id, isRead: true });
      if (!report) continue;

      const pdfPath = await generatePdfWithPuppeteer(report);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Your CoinWise Report - ${month}`,
        text: `Hi ${user.name},\n\nHere’s your financial summary for ${month}.`,
        attachments: [{ filename: path.basename(pdfPath), path: pdfPath }],
      };
      Notification.create({
        user_id: user._id,
        message: `Your monthly report for ${month} is ready...`
      });
      await transporter.sendMail(mailOptions);
      console.log(`📨 Report sent to ${user.email}`);
    }
  }, { timezone: "Asia/Kolkata" });

  cron.schedule(
  "*/2 * * * * *",
  async () => {
    console.log("Checking budgets for alert thresholds...");

    try {
      const budgets = await Budget.find({}).populate("user_id");

      for (const budget of budgets) {
        const { user_id, _id, category, limit, month } = budget;

        if (!user_id || !limit) continue;

        const startOfMonth = new Date(`${month}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const spendAgg = await Transaction.aggregate([
          {
            $match: {
              user_id: user_id._id,
              category: category,
              date: { $gte: startOfMonth, $lt: endOfMonth },
            },
          },
          { $group: { _id: null, totalSpend: { $sum: "$amount" } } },
        ]);

        const totalSpent = spendAgg.length > 0 ? spendAgg[0].totalSpend : 0;

        budget.spent = totalSpent;
        await budget.save();

        const usagePercent = (totalSpent / limit) * 100;

        let message = "";
        if (usagePercent >= 80 && usagePercent < 100) {
          message = `⚠️ You have used 80% of your budget for "${category}". Current usage: ₹${totalSpent}/${limit}.`;
        } else if (usagePercent >= 100) {
          message = `🚨 You have exceeded your budget limit for "${category}". Spent: ₹${totalSpent}/${limit}.`;
        } else {
          continue;
        }

        const existing = await Notification.findOne({
          user_id: user_id._id,
          budget_id: _id,
          message,
        });

        if (existing) continue;

        await Notification.create({
          user_id: user_id._id,
          budget_id: _id,
          message,
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user_id.email,
          subject: "Budget Alert – CoinWise",
          text: message
        });
        console.log(`🔔 Notification added for ${user_id.email}: ${message}`);
      }
    } catch (err) {
      console.error("❌ Error checking budget alerts:", err);
    }
  },
  { timezone: "Asia/Kolkata" }
);


};
