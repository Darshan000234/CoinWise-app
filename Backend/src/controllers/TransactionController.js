import Transaction from '../models/Transaction.js'
 
const {
  VERYFI_CLIENT_ID,
  VERYFI_USERNAME,
  VERYFI_API_KEY,
  HUGGINGFACE_API_KEY,
} = process.env;

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

export const CategoryTransaction = async (req, res) => {
  const id = req.user.id;
  try {
    const data = await Transaction.aggregate([
      { $match: { user_id: id } },
      {
        $group: {
          _id: { $toLower: "$category" },   // normalize case
          totalAmount: { $sum: "$amount" },
          transactions: { $push: "$$ROOT" }
        }
      }
    ]);

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export async function extractReceiptData(fileBuffer) {
  const imageData = fileBuffer.toString("base64");

  try {
    const response = await axios.post(
      "https://api.veryfi.com/api/v8/partner/documents/",
      { file_data: imageData },
      {
        headers: {
          "Content-Type": "application/json",
          "CLIENT-ID": VERYFI_CLIENT_ID,
          "AUTHORIZATION": `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`,
        },
      }
    );

    const data = response.data;

    console.log("✅ OCR Extracted Data from Veryfi:");
    console.log(JSON.stringify(data, null, 2));

    const items = data.line_items || [];
    const totalAmount = data.total || 0;

    // Pass extracted item descriptions to category prediction
    const categorizedItems = await Promise.all(
      items.map(async (item) => {
        const category = await predictCategory(item.description || "");
        return {
          description: item.description || "Unknown",
          amount: item.total || 0,
          category: category || "Other",
        };
      })
    );

    const result = {
      totalAmount,
      items: categorizedItems,
    };

    console.log("✅ Final Structured Result:");
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("❌ OCR Error:", error.response?.data || error.message);
    throw error;
  }
}

async function predictCategory(text) {
  if (!text) return "Other";

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        inputs: text,
        parameters: {
          candidate_labels: [
            "Food",
            "Shopping",
            "Transport",
            "Rent",
            "Entertainment",
            "Health",
            "Education",
            "Investment",
            "Others",
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const bestLabel = response.data.labels[0];
    return bestLabel;
  } catch (err) {
    console.error("❌ AI Category Error:", err.response?.data || err.message);
    return "Other";
  }
}

export const FileTransaction = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const result = await extractReceiptData(buffer);
    const transactions = result.items.map((item) => ({
      user_id: req.user.id, // make sure req.user is populated via auth middleware
      amount: item.amount, 
      type: "expense", // receipts usually represent expenses
      category: item.category,
      description: item.description,
      date: new Date(),
    }));
    await Transaction.insertMany(transactions);
    if (!text) {
      return res.status(400).json({ error: "No text found in file" });
    }
    res.json({ message: "Processed successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};