require('dotenv').config(); // 👈 Sabse upar

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({
  origin: [
    'https://clothing-swap-marketplace.vercel.app',
    'https://clothing-swap-marketplace-784ljgtn2-kezar975s-projects.vercel.app',
    'https://clothing-swap-marketplace-ten.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    '*'  
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ /uploads folder publicly accessible at http://localhost:5000/uploads');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/clothes', require('./routes/clothes'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/courier', require('./routes/courier'));
app.use('/api/stats', require('./routes/stats'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});