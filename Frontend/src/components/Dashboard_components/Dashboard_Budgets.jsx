import {useEffect } from 'react'
import AddBudget from './Budget_Components/AddBudget'
import AllBudget from './Budget_Components/AllBudget'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URL = import.meta.env.VITE_URL;
const Dashboard_Budgets = () => {
  const navigate = useNavigate();
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
        <AllBudget />
      </div>
      <div className='self-center'>
        <AddBudget />
      </div>
    </div>
  )
}

export default Dashboard_Budgets