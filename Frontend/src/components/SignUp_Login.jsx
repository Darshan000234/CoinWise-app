import React, { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { google } from '../assets/js/index.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const URL = import.meta.env.VITE_URL || "http://localhost:3000";

const SignUp_Login = () => {
  const [Check, setCheck] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'INR',
    monthlyIncome: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await axios.get(`${URL}/user/validate-session`, {
          withCredentials: true
        });
        if (res.data?.isValid) {
          navigate('/dashboard');
          return; // stop further execution
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error('Unexpected error:', err);
        }
      }
    };
    validateSession();
  }, []);
  
  const formVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -25, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const token = response.access_token;
        const res = await axios.post(`${URL}/user/googleAuth`, { token }, { withCredentials: true });
        toast.dismiss(); // clear old toasts
        toast.success(res.data.message,{duration:3000});
        navigate('/dashboard');
      } catch (err) {
        toast.dismiss(); // clear old toasts
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      }
    },
    onError: () => showToast('Google Sign-In failed'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = password => /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(password);

  const validateSignup = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters, include a number & special char';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const isValid = type === 'signup' ? validateSignup() : validateLogin();
    if (!isValid) return;
    try {
      const endpoint = type === 'signup' ? 'signUp' : 'login';
      const payload =
        type === 'signup' ? {
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          currency: formData.currency,
          monthly_income: formData.monthlyIncome,
        }
          : {
            email: formData.email,
            password: formData.password,
          };
      const res = await axios.post(`${URL}/user/${endpoint}`, payload, { withCredentials: true });
      toast.dismiss(); // clear old toasts
      toast.success(res.data.message,{duration:3000});
      navigate('/dashboard');
    } catch (err) {
      toast.dismiss(); // clear old toasts
      toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0d0d0d]">
      <div className="w-[32rem] p-8 bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-xl relative overflow-hidden">
        <div className='flex justify-center mb-4 space-x-4'>
          <button
            onClick={() => setCheck(1)}
            className={`w-[12rem] h-[3rem] rounded-full font-semibold text-lg transition-all duration-300 ${Check === 1
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setCheck(2)}
            className={`w-[12rem] h-[3rem] rounded-full font-semibold text-lg transition-all duration-300 ${Check === 2
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            Login
          </button>
        </div>

        {/* AnimatePresence for smooth transition */}
        <AnimatePresence mode="wait">
          {Check === 1 ? (
            /* SIGN UP FORM */
            <motion.form
              key="signup"
              onSubmit={e => handleSubmit(e, 'signup')}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="cursor-pointer space-y-4 flex flex-col items-center justify-center"
            >
              {/* Full Name */}
              <div className="w-full">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="w-full">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="new-password"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="w-full">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Currency */}
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              >
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
              </select>

              {/* Monthly Income */}
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Monthly Income (Optional)"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-[15rem] py-3 rounded-4xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:from-purple-500 hover:to-blue-500 transform transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                Sign Up
              </button>

              {/* OR Divider */}
              <div className="flex items-center w-full">
                <div className="flex-1 border-t border-gray-800"></div>
                <div className="mx-2 text-[18px] font-medium text-gray-600">or</div>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Google Button */}
              <div
                onClick={() => loginWithGoogle()}
                className="flex items-center justify-center px-3 w-80 h-12 gap-2 rounded-3xl bg-[whitesmoke] text-[gray] font-[Roboto] font-medium text-[16px] cursor-pointer transition duration-200 hover:shadow-md active:bg-[#001d35]/10 focus:bg-[#001d35]/10 disabled:bg-white/40 disabled:cursor-default max-w-[400px] min-w-min"
              >
                <img src={google} className="w-6 h-6 mr-3" alt="Google logo" />
                <span className="truncate">Sign up with Google</span>
              </div>
            </motion.form>
          ) : (
            /* LOGIN FORM */
            <motion.form
              key="login"
              onSubmit={e => handleSubmit(e, 'login')}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="cursor-pointer space-y-4 flex flex-col items-center justify-center"
            >
              {/* Email */}
              <div className="w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="w-full">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="cursor-pointer w-[15rem] py-3 rounded-4xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:from-purple-500 hover:to-blue-500 transform transition-all duration-300 hover:-translate-y-1"
              >
                Login
              </button>

              {/* OR Divider */}
              <div className="flex items-center w-full">
                <div className="flex-1 border-t border-gray-800"></div>
                <div className="mx-2 text-[18px] font-medium text-gray-600">or</div>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Google Login */}
              <div
                onClick={() => loginWithGoogle()}
                className="flex items-center justify-center px-3 w-80 h-12 gap-2 rounded-3xl bg-[whitesmoke] text-[gray] font-[Roboto] font-medium text-[16px] cursor-pointer transition duration-200 hover:shadow-md active:bg-[#001d35]/10 focus:bg-[#001d35]/10 disabled:bg-white/40 disabled:cursor-default max-w-[400px] min-w-min"
              >
                <img src={google} className="w-6 h-6 mr-3" alt="Google logo" />
                <span className="truncate">Login with Google</span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignUp_Login;
