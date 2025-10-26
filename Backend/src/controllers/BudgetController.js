import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const BudgetData = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1️⃣ Fetch all user budgets
    const budgets = await Budget.find({ user_id: userId });

    if (budgets.length === 0) {
      return res.status(200).json({ message: "No budgets found for this user" });
    }

    // 2️⃣ Loop through budgets and calculate spending for that month + category
    const updatedBudgets = [];

    for (const b of budgets) {
      // Extract month + year from the budget’s month field or createdAt
      const monthName = b.month || new Date(b.createdAt).toLocaleString("default", { month: "long" });
      const year = b.year || new Date(b.createdAt).getFullYear();

      // 3️⃣ Find all transactions for that category and same month/year
      const startOfMonth = new Date(`${year}-${new Date(Date.parse(monthName +" 1, "+year)).getMonth() + 1}-01`);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const spendAgg = await Transaction.aggregate([
        {
          $match: {
            user_id: userId,
            category: b.category,
            date: { $gte: startOfMonth, $lt: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalSpend: { $sum: "$amount" },
          },
        },
      ]);

      const totalSpent = spendAgg.length > 0 ? spendAgg[0].totalSpend : 0;

      // 4️⃣ Update the budget’s `spent` field in MongoDB
      b.spent = totalSpent;
      await b.save();

      updatedBudgets.push({
        _id: b._id,
        category: b.category,
        limit: b.limit,
        spent: totalSpent,
        remaining: b.limit - totalSpent,
        month: monthName,
        year,
      });
    }

    res.status(200).json({
      message: "Budgets updated successfully",
      data: updatedBudgets,
    });

  } catch (error) {
    console.error("Error updating budgets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
