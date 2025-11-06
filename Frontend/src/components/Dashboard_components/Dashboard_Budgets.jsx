import {useEffect, useState } from 'react'
import AddBudget from './Budget_Components/AddBudget'
import AllBudget from './Budget_Components/AllBudget'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = import.meta.env.VITE_URL;
const Dashboard_Budgets = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState([]);
  useEffect(() => {
    const getBudgets = async () => {
      try {
        const res = await axios.get(`${URL}/budget/data`, { withCredentials: true });
        setBudget(res.data.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message);
      }
    };
    getBudgets();
  }, []);
  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await axios.get(`${URL}/user/validate-session`, { withCredentials: true });
        if (!res.data.isValid) navigate('/');
      } catch {
        navigate('/');
      }
    };
    validateSession();
  }, []);
  return (
    <div className='flex rounded-2xl bg-white/5 h-full w-full p-4 flex-col justify-start gap-5'>
      <div>
        <AllBudget budget={budget}/>
      </div>
      <div className='self-center'>
        <AddBudget budget={budget}/>
      </div>
    </div>
  )
}

export default Dashboard_Budgets