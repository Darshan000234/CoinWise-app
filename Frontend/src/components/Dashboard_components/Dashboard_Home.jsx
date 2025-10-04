import React from 'react'
import AddTransaction from './Home_Components/AddTransaction'
import Recent_Transaction from './Home_Components/Recent_Transaction'
import FinanceSummary from './Home_Components/FinanceSummary'
import BudgetGoals from './Home_Components/BudgetGoals'
import { useOutletContext } from 'react-router-dom'


const Dashboard_Home = () => {
  const {isCollapsed} = useOutletContext();
  return (
    <div>
      <div>
      </div>
      <div className="mt-6 p-4 flex flex-col gap-6">
      {/* Top 4 summary cards */}
      <div className="flex justify-between gap-4">
        <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
          <div className="text-lg text-gray-400">Total Balance</div>
          <div className="text-2xl font-bold">$5,000</div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
          <div className="text-lg text-gray-400">Total Income</div>
          <div className="text-2xl font-bold">$3,000</div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
          <div className="text-lg text-gray-400">Total Expenses</div>
          <div className="text-2xl font-bold">$2,000</div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl p-4 h-[6rem] w-60 bg-white/5">
          <div className="text-lg text-gray-400">Savings Rate</div>
          <div className="text-2xl font-bold">40%</div>
        </div>
      </div>

      {/* Your next container will come here */}
      <div className='flex rounded-2xl bg-white/5 h-full w-full p-4 flex-col justify-start'>
        <div className='flex gap-12'>
          <div>
            <AddTransaction />
          </div>
          <div>
            <Recent_Transaction isCollapsed={isCollapsed}/>
            <BudgetGoals isCollapsed={isCollapsed}/>
          </div>
        </div>
        <div className="flex justify-start w-full">
          <div className="w-full transition-all duration-500 ease-in-out">
            <FinanceSummary isCollapsed={isCollapsed}/>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Dashboard_Home