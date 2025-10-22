const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="backdrop-blur-md bg-[#1e1e1e]/80 border border-gray-700 rounded-xl px-4 py-2 shadow-md transition-all duration-200"
      >
        <p className="text-gray-300 font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`line-item-${index}`} className="text-[#00C49F]">
            Spent: ₹{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export default CustomLineTooltip;