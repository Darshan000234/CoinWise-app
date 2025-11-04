import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";

const VIEWS_DIR = path.join(process.cwd(), "views");
const OUTPUT_DIR = path.join(process.cwd(), "reports");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

export async function generatePdfWithPuppeteer(report) {
  const templatePath = path.join(VIEWS_DIR, "reportTemplate.ejs");

  const templateData = {
    name: report.full_name || "User",
    month: report.month,
    totalIncome: report.data?.totalIncome || 0,
    totalSpend: report.data?.totalSpend || 0,
    totalSaved: report.data?.totalSaved || 0,
    categoryData: report.data?.categoryData || [],
    insight: report.data?.insight || "",
    generatedAt: new Date().toLocaleString(),
  };

  const html = await ejs.renderFile(templatePath, templateData);

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const fileName = `report_${report.userId}_${report.month}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", bottom: "16mm" },
  });

  await browser.close();

  return filePath;
}