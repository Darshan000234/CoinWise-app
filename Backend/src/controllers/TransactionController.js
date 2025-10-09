import Transaction from '../models/Transaction.js'
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import Poppler  from "pdf-poppler";
import os from "os";
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";
 
// send data 
async function preprocessImage(buffer) {
  // Convert to grayscale, normalize contrast, resize if needed
  return await sharp(buffer)
    .grayscale()        // convert to grayscale
    .normalize()        // improve contrast
    .toBuffer();
}

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

async function extractTextFromBuffer(buffer, mimetype) {
  try {
    if (mimetype === "application/pdf") {
      const uniqueId = uuidv4();
      const tempPdfPath = path.join(os.tmpdir(), `temp_${uniqueId}.pdf`);
      fs.writeFileSync(tempPdfPath, buffer);

      const opts = {
        format: "png",
        out_dir: os.tmpdir(),
        out_prefix: `page_${uniqueId}`,
        page: null
      };
      await Poppler.convert(tempPdfPath, opts);

      const images = fs.readdirSync(os.tmpdir())
        .filter(f => f.startsWith(`page_${uniqueId}`) && f.endsWith(".png"))
        .map(f => path.join(os.tmpdir(), f));

      let combinedText = "";
      for (let imgPath of images) {
        const imageBuffer = fs.readFileSync(imgPath);
        const preprocessedBuffer = await preprocessImage(imageBuffer);

        const { data: { text } } = await Tesseract.recognize(preprocessedBuffer, "eng", { 
          logger: () => {} 
        });

        combinedText += text + "\n";
        fs.unlinkSync(imgPath); // cleanup
      }
      fs.unlinkSync(tempPdfPath); // cleanup PDF
      return combinedText;
    } else if (mimetype.startsWith("image/")) {
      const preprocessedBuffer = await preprocessImage(buffer);
      const { data: { text } } = await Tesseract.recognize(preprocessedBuffer, "eng", { 
        logger: () => {} 
      });
      return text;
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (err) {
    console.error("OCR Error:", err);
    return null;
  }
}

async function sendTextToGemini(text) {
  // Replace this with your actual Gemini API logic
  console.log("Sending to Gemini:", text);
  return { status: "success"};
}

export const FileTransaction = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const text = await extractTextFromBuffer(buffer,mimetype);
    if (!text) {
      return res.status(400).json({ error: "No text found in file" });
    }
    const geminiResult = await sendTextToGemini(text);
    res.json({ message: "Processed successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};