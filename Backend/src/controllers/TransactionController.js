import Transaction from '../models/Transaction.js'


export const TransactionData = async (req, res) => {
    const id = req.user.id;
    try {
    const data = await Transaction.find({ user_id: id });
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};