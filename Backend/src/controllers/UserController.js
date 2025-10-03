import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/JWT.js';
import axios from 'axios';

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
    console.log('hi');

    try {
        const { token } = req.body; // token from frontend

        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }
        const { data } = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(data);

        const { sub, email, name, picture } = data;

        // Check if user exists
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