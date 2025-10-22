import axios from 'axios';
import { useEffect,useState } from 'react'
import toast from 'react-hot-toast';
import Monthweek_report from './Report_Components/Monthweek_report';

const URL = import.meta.env.VITE_URL;
const Dashboard_Reports = () => {
  const [user,setUser] = useState({});
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${URL}/user/getdata`,{withCredentials:true});
        setUser(res.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message, { duration: 3000 });
      }
    }
    getData();
  }, [])
  
  return (
    <div>
      <div className='mt-6 p-3 flex flex-col gap-6'>
        <div className="flex justify-between gap-4">
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Balance</div>
            <div className="text-2xl font-bold">${user.Net_Saving}</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Income</div>
            <div className="text-2xl font-bold">${user.monthly_income}</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Total Expenses</div>
            <div className="text-2xl font-bold">${user.Expenses}</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Average of Expenses</div>
            <div className="text-2xl font-bold">${user.Average}</div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
            <div className="text-lg text-gray-400">Highest Spending Category</div>
            <div className="text-2xl font-bold">${user.Highest}</div>
          </div>
        </div>
      </div>
      <div className='bg-white/5 p-6 min-h-screen rounded-3xl m-4'>
        <Monthweek_report/>
      </div>
    </div>
  )
}

export default Dashboard_Reports