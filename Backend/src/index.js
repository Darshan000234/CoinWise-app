const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./models/db');
const UserRoutes = require('./routes/UserRoute');
const TransactionRoutes = require('./routes/TransactionRoute');
const BudgetRoutes = require('./routes/BudgetRoutes');
const cookieParser = require('cookie-parser');
const ReportRoute = require('./routes/ReportRoute');
const NotificationRoutes = require('./routes/NotificationRoutes');
const { startReportCron } = require('./jobs/reportCron');

startReportCron();
const app = express();
dotenv.config();
connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend running successfully!' });
});

app.use('/user', UserRoutes);
app.use('/transaction',TransactionRoutes);
app.use('/budget',BudgetRoutes);
app.use('/dashboard/report',ReportRoute);
app.use('/notification',NotificationRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
