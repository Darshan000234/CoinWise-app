

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(30, 30, 30, 0.95)", // dark tooltip bg
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#fff",
        }}
      >
        <p>{label}</p>
        <p style={{ color: "#FF4C4C" }}>Spent: ₹{payload[0].value}</p>
        <p style={{ color: "#4CAF50" }}>Saved: ₹{payload[1].value}</p>
      </div>
    );
  }
  return null;
};


export default CustomBarTooltip;