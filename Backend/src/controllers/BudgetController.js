import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const BudgetData = async (req, res) => {
  const userId = req.user.id;
  try {
    const budgets = await Budget.find({ user_id: userId });

    if (budgets.length === 0) {
      return res.status(200).json({ message: "No budgets found for this user" });
    }

    const updatedBudgets = [];

    for (const b of budgets) {
      const [year, month] = b.month.split("-");

      const startOfMonth = new Date(`${year}-${month}-01`);
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

      b.spent = totalSpent;
      await b.save();

      updatedBudgets.push({
        _id: b._id,
        category: b.category,
        limit: b.limit,
        spent: totalSpent,
        remaining: b.limit - totalSpent,
        month: b.month,
        year: Number(year),
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


export const AddBudget = async (req, res) => {
  const userId = req.user.id;
  const { _id, month, category, limit } = req.body;  
  try {
    const newBudget = new Budget({
      user_id: userId,
      category,
      limit,
      month,
    });
    await newBudget.save();
    res.status(201).json({ message: "Budget added successfully"});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const UpdateBudget = async (req, res) => {
  const userId = req.user.id;
  const { _id, month, category, limit } = req.body;
  try {
    await Budget.findByIdAndUpdate(_id, {
      category,
      limit,
      month,
    },{ new: true });
    res.status(200).json({ message: "Budget updated successfully"});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}