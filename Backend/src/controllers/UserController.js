import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/JWT.js';
import axios from 'axios';
import Transaction from '../models/Transaction.js';

export const signUp = async (req, res) => {
    try {
        const { full_name, email, password, currency, monthly_income } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            full_name,
            email,
            password_hash,
            currency,
            monthly_income,
        });

        const token = generateToken(newUser._id, newUser.email);
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ message: 'SignUp successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'SignUp failed', error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.email);
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }
        const { data } = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const { sub, email, name, picture } = data;
        let user = await User.findOne({ email }), message = 'Login Successful';
        if (!user) {
            user = await User.create({
                full_name: name,
                email,
                auth_provider: 'google',
                google_id: sub,
                profile_picture: picture,
                is_verified: true,
            });
            message = 'SignUp Successful';
        }
        const jwtToken = generateToken(user._id, user.email);
        res.cookie('token', jwtToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
};


export const Data = async (req, res) => {
  try {
    const id = req.user.id;
    const { prev } = req.query;
    const currentDate = new Date();
    const monthOffset = prev !== undefined ? 1 : 0;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset + 1, 0);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const baseIncome = user?.monthly_income ?? 0;

    const transactions = await Transaction.find({
      user_id: id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let data = {
      _id: id,
      monthly_income: baseIncome.toFixed(2),
      Expenses: "0",
      Net_Saving: baseIncome.toFixed(2),
      Average: "0",
      Highest: "N/A",
    };

    if (transactions.length === 0) {
      return res.status(200).json(data);
    }

    const incomeTx = transactions.filter(t => t.type === "income");
    const expenseTx = transactions.filter(t => t.type === "expense");

    const totalIncome = baseIncome + incomeTx.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);

    const categoryTotals = {};
    expenseTx.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const highestCategory =
      Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "0";

    data = {
      _id: id,
      full_name: user.full_name,
      monthly_income: totalIncome.toFixed(2),
      Expenses: totalExpense.toFixed(2),
      Net_Saving: (totalIncome - totalExpense).toFixed(2),
      Average: expenseTx.length ? (totalExpense / expenseTx.length).toFixed(2) : "0",
      Highest: highestCategory,
    };
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch data", error: error.message });
  }
};


export const getProfile = async (req, res) => {
    const id = req.user.id;
    try {
        const user = await User.findById(id).select("full_name email monthly_income notifications appearance");
        const Data = {
            profile:{
                full_name: user.full_name,
                email: user.email,
                monthly_income: user.monthly_income
            },
            notifications:{
                monthlyReport: user.notifications.monthlyReport,
                download: user.notifications.download,
                budgetAlerts: user.notifications.budgetAlerts
            },
            apperance: user.appearance
        } 
      res.status(200).json({Data});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
}

export const updateProfile = async (req, res) => {
  const id = req.user.id;
  const section = req.params.section;
  const { data } = req.body;

  try {
    const user = await User.findById(id);
    console.log('hi');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    switch (section) {
      case "profile":
        if (data.full_name) user.full_name = data.full_name;
        if (data.monthly_income) user.monthly_income = data.monthly_income;
        if (data.email) user.email = data.email;
        break;
      case "notifications":
        user.notifications = data;
        console.log(user.notifications);
        break;
      case "security":
        const {Current_Password,New_Password} = data;
        if (!Current_Password || !New_Password) {
          return res.status(400).json({ message: "Current and New passwords are required" });
        }
        const passwordMatch = await bcrypt.compare(Current_Password, user.password_hash);
        if (!passwordMatch) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(New_Password, salt);
        break;
      case "account":
        await User.findByIdAndDelete(id);
        res.clearCookie('token', {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
        });
        return res.status(200).json({ message: 'Account deleted successfully' });
      default:
        return res.status(400).json({ message: "Invalid section" });
    }

    await user.save();
    res.status(200).json({ message: `${section} updated successfully` });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
