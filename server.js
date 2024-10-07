 require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');


const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/home.html', (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/views/dashboard.html');
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
