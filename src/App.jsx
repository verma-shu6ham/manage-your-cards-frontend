import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CardDetails from './pages/CardDetails';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute element={<Home />} />} />
            <Route path="/card/:id" element={<PrivateRoute element={<CardDetails />} />} />
            <Route path="/add-transaction" element={<PrivateRoute element={<AddTransaction />} />} />
            <Route path="/transactions" element={<PrivateRoute element={<Transactions />} />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
