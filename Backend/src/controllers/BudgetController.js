import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const BudgetData = async (req, res) => {
  const id = req.user.id;
  const limit = Number(req.query.limit) || undefined;

  try {
    const Budget_Data = await Budget.find({ user_id: id })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit > 0 ? limit : undefined);

    if (Budget_Data.length <= 0) {
      return res.status(202).json({ Budget_Data: [] });
    }
    const Spend_Data = await Transaction.aggregate([
      { $match: { user_id: id } },
      {
        $group: {
          _id: { $toLower: "$category" },
          totalAmount: { $sum: "$amount" },
          transactions: { $push: "$$ROOT" }
        }
      }
    ]);

    const spendMap = {};
    for (let s of Spend_Data) {
      spendMap[s._id] = s.totalAmount;
    }

    const merged = Budget_Data.map((budget) => {
      const cat = budget.category.toLowerCase();
      return {
        category: budget.category,
        budget: budget.budget,
        spend: spendMap[cat] || 0
      };
    });

    res.status(202).json({ merged });
  } catch (error) {
    console.error("BudgetData error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
