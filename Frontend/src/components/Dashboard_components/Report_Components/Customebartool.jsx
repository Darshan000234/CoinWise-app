const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-md bg-[#1e1e1e]/80 border border-gray-700 rounded-xl px-4 py-2 text-white shadow-md transition-all duration-200">
        <p className="text-gray-300 font-semibold">{label}</p>
        <p className="text-red-400">Spent: ₹{payload[0].value}</p>
        <p className="text-green-400">Saved: ₹{payload[1].value}</p>
      </div>
    );
  }
  return null;
};

export default CustomBarTooltip;
