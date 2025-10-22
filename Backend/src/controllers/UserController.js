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
export const Data = async (req,res) => {
    const id = req.user.id;
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        let data = {
        monthly_income: "0",
        Expenses: "0",
        Net_Saving: "0",
        Average: "0",
        Highest: "0"
        };
        const UserData = await User.findOne({ _id: id });
        const GetData = await Transaction.find({
            user_id: id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const baseIncome = UserData.monthly_income ?? 0;
        data.monthly_income = baseIncome; 
        if (!GetData || GetData.length === 0) {
            data.Net_Saving = baseIncome > 0 ? baseIncome.toFixed(2) : "0";
            return res.status(200).json(data);
        }
        const incomeTransactions = GetData.filter(t => t.type === "income");
        const expenseTransactions = GetData.filter(t => t.type === "expense");
        const totalIncomeTx = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        data.Expenses =totalExpenses.toFixed(2);     
        const totalMonthlyIncome = baseIncome + totalIncomeTx;
        data.monthly_income =totalMonthlyIncome.toFixed(2);
        data.Average = expenseTransactions.length > 0
        ? ((totalExpenses / expenseTransactions.length).toFixed(2))
        : "0";

        const categoryTotals = {};
        expenseTransactions.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        data.Highest =
        Object.keys(categoryTotals).length > 0
            ? (Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0])
            : "0";

        data.Net_Saving = (totalMonthlyIncome - totalExpenses).toFixed(2);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });        
    }
}