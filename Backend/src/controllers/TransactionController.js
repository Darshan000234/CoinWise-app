import Transaction from '../models/Transaction.js'
import mongoose from "mongoose";

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
      .limit(limit > 0 ? limit : undefined)
      .lean();
  
    const formattedData = data.map(txn => ({
      ...txn,
      date: txn.date ? new Date(txn.date).toISOString().split("T")[0] : null
    }));

    res.status(200).json({ data: formattedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};


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
      date,
    });
    res.status(202).json({message : "Transaction Added Successfully"});
  } catch (err) {
    res.status(500).json({ error: "Failed to Add transactions" });
  }
}

export const TransactionDelete = async (req, res) => {
  const { id } = req.body;
  try {
    console.log(id);
    await Transaction.deleteOne({_id:id});
    res.status(202).json({message : "Transaction Delete Successfully"});
  } catch (err) {
    res.status(500).json({ error: "Failed to Delete transactions" });
  }
}

export const TransactionEdit = async (req, res) => { 
  const {_id,...updates} = req.body;
  try {
    await Transaction.findByIdAndUpdate(_id,
      updates,
      { new: true, runValidators: true }
    );
    res.status(202).json({message : "Transaction Update Successfully"});
  } catch (err) {
    res.status(500).json({ error: "Failed to Update transactions" });
  }
}

export const CategoryTransaction = async (req, res) => {
  const matchStage = { user_id:new mongoose.Types.ObjectId(req.user.id) };
  const { start, end } = req.query;

  try {
    if (start && end) {
      matchStage.date = { 
        $gte: new Date(start), 
        $lte: new Date(end) 
      };
    }

    const data = await Transaction.aggregate([
      { $match: matchStage },
      { $project: {
          categoryLower: { $toLower: "$category" },
          amount: 1,
          user_id: 1,
          date: 1,
          description: 1,
          type: 1,
        }
      },
      {
        $group: {
          _id: "$categoryLower",
          totalAmount: { $sum: "$amount" },
          transactions: { $push: "$$ROOT" }
        }
      }
    ]);

    res.status(200).json({ data });
  } catch (error) {
    console.error(error);
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
      user_id: req.user.id,
      amount: item.amount, 
      type: "expense",
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