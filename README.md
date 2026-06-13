# ClothSwap Marketplace

A modern, full-stack marketplace for swapping clothes. Built with React (Vite) on the frontend and Express + MongoDB on the backend.

## 🚀 Features

- **User Authentication**: Secure register/login with JWT.
- **Clothing Management**: Add, update, and browse clothes for swap.
- **Swap Requests**: Interactive swapping system between users.
- **Courier Integration**: Shipping/Courier status tracking.
- **Dashboard**: User and platform statistics.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Axios, Bootstrap, React Router.
- **Backend**: Node.js, Express, Mongoose (MongoDB), Multer, Nodemailer.
- **Deployment**: Vercel (Frontend), Render (Backend).

## 📦 Deployment Instructions

### 1. GitHub Setup
- Initialize a git repository: `git init`
- Add all files: `git add .`
- Commit: `git commit -m "Initial commit"`
- Push to your GitHub repository.

### 2. Backend Deployment (Render)
- Connect your GitHub repository to **Render**.
- Create a new **Web Service**.
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGO_URI`: Your MongoDB connection string.
  - `JWT_SECRET`: A secure random string for JWT signing.
  - `EMAIL_USER`: Your Gmail address (for notifications).
  - `EMAIL_PASS`: Your Gmail App Password.
  - `PORT`: 10000 (Render usually sets this automatically).

### 3. Frontend Deployment (Vercel)
- Connect your GitHub repository to **Vercel**.
- **Root Directory**: `client`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com/api`).

## ⚠️ Important Note on File Uploads
Currently, this app uses local storage for image uploads (`server/uploads`). Since Render's free tier has an ephemeral filesystem, images will be deleted whenever the server restarts. For a production-ready solution, consider integrating **Cloudinary** or **AWS S3**.

## 📄 License
This project is for educational/portfolio purposes.
