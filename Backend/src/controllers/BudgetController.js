import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const BudgetData = async (req, res) => {
  const userId = req.user.id;

  try {
    const budgets = await Budget.find({ user_id: userId });

    if (budgets.length === 0) {
      return res.status(200).json({
        message: "No budgets found for this user",
        data: []
      });
    }

    const updatedBudgets = [];

    for (const b of budgets) {
      if (!b.month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month)) {
        continue;
      }

      const [year, month] = b.month.split("-");

      const startOfMonth = new Date(`${year}-${month}-01`);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const spendAgg = await Transaction.aggregate([
        {
          $match: {
            user_id: userId,
            category: b.category,
            date: { $gte: startOfMonth, $lt: endOfMonth }
          }
        },
        { $group: { _id: null, totalSpend: { $sum: "$amount" } } }
      ]);

      const totalSpent = spendAgg.length > 0 ? spendAgg[0].totalSpend : 0;

      b.spent = Number(totalSpent) || 0;
      b.limit = Number(b.limit) || 0;

      await b.save();

      updatedBudgets.push({
        _id: b._id,
        category: b.category,
        limit: b.limit,
        spent: b.spent,
        remaining: b.limit - b.spent,
        month: b.month,
        year: Number(year)
      });
    }

    res.status(200).json({
      message: "Budgets updated successfully",
      data: updatedBudgets
    });

  } catch (error) {
    console.error("Error updating budgets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const AddBudget = async (req, res) => {
  const userId = req.user.id;
  const { month, category, limit } = req.body;

  try {
    if (!month || !category || !limit) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newBudget = new Budget({
      user_id: userId,
      month,
      category,
      limit: Number(limit)
    });

    await newBudget.save();

    res.status(201).json({ message: "Budget added successfully" });

  } catch (error) {
    console.error("Error adding budget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const UpdateBudget = async (req, res) => {
  const { _id, month, category, limit } = req.body;

  try {
    if (!_id) {
      return res.status(400).json({ error: "Budget ID is required" });
    }

    const updated = await Budget.findByIdAndUpdate(
      _id,
      {
        month,
        category,
        limit: Number(limit)
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.status(200).json({ message: "Budget updated successfully" });

  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
