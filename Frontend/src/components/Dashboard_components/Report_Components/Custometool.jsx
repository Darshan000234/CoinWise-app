import React from 'react'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div
        className="backdrop-blur-md bg-[#1f1f1f]/80 border border-gray-700 rounded-2xl px-4 py-2 shadow-lg text-sm"
        style={{ transition: 'all 0.2s ease-in-out' }}
      >
        <p className="text-gray-300 font-semibold">{name}</p>
        <p className="text-green-400">${value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip
