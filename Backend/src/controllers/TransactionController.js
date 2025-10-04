import Transaction from '../models/Transaction.js'

// send data 
export const TransactionData = async (req, res) => {
  const id = req.user.id;
  const limit = parseInt(req.query.limit) || 0;
  try {
    const data = await Transaction.find({ user_id: id })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit > 0 ? limit : undefined);
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// add data
export const TransactionAdd = async (req, res) => {
  const {amount,category,type,notes,date} = req.body;
  const user_id = req.user.id;
  try {
    await Transaction.create({
      user_id,
      amount,
      category,
      type,
      description:notes,
      date
    });
    res.status(202).json({message : "Transaction Added Successfully"});
  } catch (err) {
    res.status(500).json({ error: "Failed to Add transactions" });
  }
}

// delete data
export const TransactionDelete = async (req, res) => {
  const {_id} = req.body;
  try {
    await Transaction.deleteOne({_id});
    res.status(202).json({message : "Transaction Delete Successfully"});
  } catch (err) {
    res.status(500).json({ error: "Failed to Delete transactions" });
  }
}

// edit data 
export const TransactionEdit = async (req, res) => {
  const {_id,feild,value} = req.body;
  try {
    await Transaction.findByIdAndUpdate(_id,
      { [feild] : value },
      { new: true, runValidators: true } // returns the updated doc & validates input
    );
    res.status(202).json({message : "Transaction Update Successfully"});
  } catch (err) {
    res.status(500).json({ error: "Failed to Update transactions" });
  }
}