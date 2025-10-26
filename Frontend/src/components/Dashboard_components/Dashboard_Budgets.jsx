import React from 'react'
import AddBudget from './Budget_Components/AddBudget'
import AllBudget from './Budget_Components/AllBudget'
const Dashboard_Budgets = () => {
  return (
    <div className='flex rounded-2xl bg-white/5 h-full w-full p-4 flex-col justify-start'>
        <div className='flex gap-12'>
          <div>
            <AddBudget />
          </div>
          <div>
            <AllBudget />
          </div>
        </div>
    </div>
  )
}

export default Dashboard_Budgets