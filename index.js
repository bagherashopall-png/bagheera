const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const {connectDB} = require('./config/db');
const categoryRoutes = require('./route/category.route');
const userManageyRoutes = require('./route/userAccess.route');
const shopManageRoutes = require('./route/shop.route');
const menuManageRoutes = require('./route/menuroute');
const dashboardRoutes = require('./route/dashboardroute');
const settingRoutes = require('./route/settingroute');
const orderRoute = require('./route/order.route');
const PORT = process.env.PORT || 3000;
app.use('/uploads', express.static('uploads'));
app.use(cors({
  origin: '*', // later replace with your frontend domain
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

app.use('/category', categoryRoutes);
app.use('/userManage',userManageyRoutes);
app.use('/shopManage',shopManageRoutes);
app.use('/menuManage',menuManageRoutes);
app.use('/dashboardManage',dashboardRoutes);
app.use('/settings',settingRoutes);
app.use('/orderManage',orderRoute);


const startServer = async () => {
  try {
    await connectDB();   // ✅ wait for DB
    

    app.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};
startServer();