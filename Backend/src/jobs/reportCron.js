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
        user_id: user._id,
        message: `Your monthly report for ${month} is ready...`
      });
      await transporter.sendMail(mailOptions);
      console.log(`📨 Report sent to ${user.email}`);
    }
  }, { timezone: "Asia/Kolkata" });
};
