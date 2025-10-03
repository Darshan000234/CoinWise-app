const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./models/db');
const UserRoutes = require('./routes/UserRoute');
const TransactionRoutes = require('./routes/TransactionRoute');
const cookieParser = require('cookie-parser');

const app = express();
dotenv.config();
connectDB();

// Only one CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true,               // allow cookies
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend running successfully!' });
});

app.use('/user', UserRoutes);
app.use('/transaction',TransactionRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
