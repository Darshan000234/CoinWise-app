export function generateInsights(current, previous) {
  const insights = [];

  const currSave = Number(current.Net_Saving) || 0;
  const prevSave = Number(previous.Net_Saving) || 0;
  const savingsChange =
    prevSave === 0 ? 0 : ((currSave - prevSave) / prevSave) * 100;

  if (savingsChange > 0) {
    insights.push(`✅ You saved ${savingsChange.toFixed(1)}% more than last month.`);
  } else if (savingsChange < 0) {
    insights.push(`⚠️ You saved ${Math.abs(savingsChange).toFixed(1)}% less than last month.`);
  } else {
    insights.push(`📊 Your savings remained the same as last month.`);
  }

  const currCategories = Object.fromEntries((current.categoryData || []).map(c => [c._id, c.totalAmount]));
  const prevCategories = Object.fromEntries((previous.categoryData || []).map(c => [c._id, c.totalAmount]));

  const entries = Object.entries(currCategories);
  if (entries.length > 0) {
    const maxCategory = entries.slice().sort((a, b) => b[1] - a[1])[0];
    const totalSpend = Object.values(currCategories).reduce((a, b) => a + b, 0);
    const percent = ((maxCategory[1] / totalSpend) * 100).toFixed(1);
    insights.push(`💡 Your biggest category is ${maxCategory[0]} (${percent}% of total spend).`);
  }

  for (const [cat, value] of Object.entries(currCategories)) {
    const prev = prevCategories[cat] || 0;
    if (prev === 0) continue;
    const change = ((value - prev) / prev) * 100;
    if (change < 0 && Math.abs(change) > 5) {
      insights.push(`🔥 Great improvement in ${cat.toLowerCase()} expenses (${change.toFixed(1)}% vs last month).`);
    }
  }

  if (insights.length === 0) {
    insights.push("ℹ️ No significant financial changes detected this month.");
  }

  return insights;
}
