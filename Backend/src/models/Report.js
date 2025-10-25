import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // e.g., "2025-10"
  data: { type: Object, required: true },   // summary, categoryData, insight
  charts: [{ name: String, dataUrl: String }],
  pdfPath: { type: String },
  generatedAt: { type: Date },
  emailedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("Report", ReportSchema);
