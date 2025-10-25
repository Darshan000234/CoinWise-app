
export function generateInsights(current, previous) {
  const insights = [];

  // Compare savings
  const savingsChange = ((current.netSavings - previous.netSavings) / previous.netSavings) * 100;
  if (savingsChange > 0) {
    insights.push(`✅ You saved ${savingsChange.toFixed(1)}% more than last month.`);
  } else if (savingsChange < 0) {
    insights.push(`⚠️ You saved ${Math.abs(savingsChange).toFixed(1)}% less than last month.`);
  } else {
    insights.push(`📊 Your savings remained the same as last month.`);
  }

  // Find biggest category
  const maxCategory = Object.entries(current.categoryData).sort((a, b) => b[1] - a[1])[0];
  const totalSpend = Object.values(current.categoryData).reduce((a, b) => a + b, 0);
  const percent = ((maxCategory[1] / totalSpend) * 100).toFixed(1);
  insights.push(`💡 Your biggest category is ${maxCategory[0]} (${percent}% of total spend).`);

  // Detect improvement in spending (example: Transport)
  for (const [cat, value] of Object.entries(current.categoryData)) {
    const prev = previous.categoryData[cat] || 0;
    const change = ((value - prev) / prev) * 100;
    if (change < 0 && Math.abs(change) > 5) {
      insights.push(`🔥 Great improvement in ${cat.toLowerCase()} expenses (${change.toFixed(1)}% vs last month).`);
    }
  }

  return insights;
}

