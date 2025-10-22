import Transaction from "../models/Transaction";
import User from '../models/User.js';

export const bar = async (req, res) => {
  const id = req.user.id;
  const {type,range} = req.query;
  try {
    const data = await Transaction.find({ user_id : id,
        date : { $gte : , $lte : }
     });
    const userData = await User.find({ _id : id });
    const incomeTransactions = data.filter(t => t.type === "income");
    const expenseTransactions = data.filter(t => t.type === "expense");
    const income = incomeTransactions.reduce((sum,t)=> sum + t.amount,0);
    const expense = expenseTransactions.reduce((sum,t)=> sum + t.amount,0);
    const Total = (data?.monthly_income || 0) + income;
    const saved = Total - expense;
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
}