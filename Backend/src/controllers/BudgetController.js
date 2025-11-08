import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const BudgetData = async (req, res) => {
  const userId = req.user.id;

  try {
    const budgets = await Budget.find({ user_id: userId }).populate("user_id");
    
    if (budgets.length === 0) {
      return res.status(200).json({ message: "No budgets found for this user", data: [] });
    }

    const updatedBudgets = [];

    for (const b of budgets) {

      if (!b.month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month)) continue;

      const [year, month] = b.month.split("-");
      const start = new Date(Date.UTC(+year, +month - 1, 1));
      const end = new Date(Date.UTC(+year, +month, 1));

      const spendAgg = await Transaction.aggregate([
        {
          $match: {
            user_id: b.user_id._id,
            category: b.category,
            type: "expense",
            date: { $gte: start, $lt: end }
          }
        },
        {
          $group: { _id: null, totalSpend: { $sum: "$amount" } }
        }
      ]);

      const spent = spendAgg[0]?.totalSpend || 0;

      await Budget.updateOne({ _id: b._id }, { $set: { spent } });

      updatedBudgets.push({
        _id: b._id,
        category: b.category,
        limit: b.limit,
        spent,
        remaining: b.limit - spent,
        month: b.month,
        year: Number(year),
      });

      let type = null;
      let message = null;

      if (spent >= b.limit) {
        type = "exceeded";
        message = `Your ${b.category} budget for ${b.month} is exceeded. Limit: ${b.limit}, Spent: ${spent}.`;
      } else if (spent >= b.limit * 0.8) {
        type = "warning";
        message = `You have used ${Math.round((spent / b.limit) * 100)}% of your ${b.category} budget for ${b.month}.`;
      }

      if (!type) continue;

      const exists = await Notification.findOne({
        user_id: b.user_id._id,
        budget_id: b._id,
        message,
      });

      if (exists) continue; 
      await Notification.create({
        user_id: b.user_id._id,
        budget_id: b._id,
        message
      });
     
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: b.user_id.email,
        subject: "Budget Alert – CoinWise",
        text: message
      });
    }

    return res.status(200).json({
      message: "Budgets updated successfully",
      data: updatedBudgets
    });

  } catch (err) {
    console.error("Error updating budgets:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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
      limit: Number(limit),
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

export const DeleteBudget = async (req, res) => {
  const { id } = req.body;
  try {
    await Budget.findByIdAndDelete(id);
    res.status(200).json({ message: "Budget deleted successfully" });
  }catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
