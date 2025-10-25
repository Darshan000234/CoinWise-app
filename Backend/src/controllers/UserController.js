import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/JWT.js';
import axios from 'axios';
import Transaction from '../models/Transaction.js';

// Sign Up
export const signUp = async (req, res) => {
    try {
        const { full_name, email, password, currency, monthly_income } = req.body;

        // Check if user already exists
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
            httpOnly: true,                      // Cannot be accessed by JS
            secure: process.env.NODE_ENV === 'production', // Only over HTTPS
            sameSite: 'Strict',                   // Prevent CSRF
            maxAge: 24 * 60 * 60 * 1000           // 1 day
        });
        res.status(201).json({ message: 'SignUp successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'SignUp failed', error: err.message });
    }
};

// Login
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
            httpOnly: true,                      // Cannot be accessed by JS
            secure: process.env.NODE_ENV === 'production', // Only over HTTPS
            sameSite: 'Strict',                   // Prevent CSRF
            maxAge: 24 * 60 * 60 * 1000           // 1 day
        });
        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};

// Google Authentication
export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body; // token from frontend
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
            httpOnly: true,                      // Cannot be accessed by JS
            secure: process.env.NODE_ENV === 'production', // Only over HTTPS
            sameSite: 'Strict',                   // Prevent CSRF
            maxAge: 24 * 60 * 60 * 1000           // 1 day
        });
        res.status(200).json({ message: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
};

// logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
};


// userData 
export const Data = async (req, res) => {
  try {
    const id = req.user.id;
    const { prev } = req.query;

    const currentDate = new Date();
    const monthOffset = prev !== undefined ? 1 : 0;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset + 1, 0);

    const user = await User.findById(id);
    const baseIncome = user?.monthly_income ?? 0;

    const transactions = await Transaction.find({
      user_id: id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let data = {
      user_id : id,
      monthly_income: baseIncome.toFixed(2),
      Expenses: "0",
      Net_Saving: baseIncome.toFixed(2),
      Average: "0",
      Highest: "0",
    };

    if (transactions.length === 0) return res.status(200).json(data);

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
      monthly_income: totalIncome.toFixed(2),
      Expenses: totalExpense.toFixed(2),
      Net_Saving: (totalIncome - totalExpense).toFixed(2),
      Average: expenseTx.length ? (totalExpense / expenseTx.length).toFixed(2) : "0",
      Highest: highestCategory,
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error: error.message });
  }
};
