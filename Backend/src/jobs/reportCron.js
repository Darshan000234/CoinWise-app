import cron from "node-cron";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { generatePdfWithPuppeteer } from "../utils/pdfGenerator.js";
import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";
import path from "path";
 
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
        userId: user._id,
        message: `Your monthly report for ${month} is ready and has been sent to your email.`,
      });
      await transporter.sendMail(mailOptions);
      console.log(`📨 Report sent to ${user.email}`);
    }
  },{ timezone: "Asia/Kolkata" });

  cron.schedule(
    "0 */6 * * *",
    async () => {
      console.log("Checking budgets for alert thresholds...");
      
      try {
        const budgets = await Budget.find({}).populate("user_id");

        for (const budget of budgets) {
          const { spent, limit, user_id, _id, category } = budget;

          if (!limit || !user_id) continue;
          const usagePercent = (spent / limit) * 100;
          let message = "";

          if (usagePercent >= 80 && usagePercent < 100) {
            message = `⚠️ You have used 80% of your budget for "${category}". Current usage: ₹${spent}/${limit}.`;
          }
          else if (usagePercent >= 100) {
            message = `🚨 You have exceeded your budget limit for "${category}". Spent: ₹${spent}/${limit}.`;
          } else {
            continue; 
          }
          const existing = await Notification.findOne({
            userId: user_id._id,
            budgetId: _id,
            message: message,
          });
          if (existing) continue;
          await Notification.create({
            userId: user_id._id,
            budgetId: _id,
            message,
            type: "budgetAlert",
            date: new Date(),
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
