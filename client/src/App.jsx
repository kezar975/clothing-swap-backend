import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import Dashboard from './pages/Dashboard';
import SwapRequests from './pages/SwapRequests';
import Chat from './pages/Chat';
import AdminPanel from './pages/AdminPanel';
import CourierDetails from './pages/CourierDetails';
import CommunityStats from './pages/CommunityStats';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Welcome from './pages/Welcome';
const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/community" element={<CommunityStats />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/" element={<Navigate to="/listings" replace />} />


          <Route path="/dashboard" element={
            <Protected><Dashboard /></Protected>
          } />
          <Route path="/swap-requests" element={
            <Protected><SwapRequests /></Protected>
          } />
          <Route path="/chat/:swapId" element={
            <Protected><Chat /></Protected>
          } />
          <Route path="/courier/:swapId" element={
            <Protected><CourierDetails /></Protected>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminPanel /></AdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;