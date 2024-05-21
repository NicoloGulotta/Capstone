import React from 'react';
// Nel tuo file index.js o App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GoogleAuth from './components/GoogleAuth.jsx';
import Profile from './components/Profile.jsx';
import CreatePostForm from './components/CeratePostForm.jsx';
import Home from './components/Home/Home.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// PrivateRoute component (esempio)
function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token'); // Verifica l'autenticazione
  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<PrivateRoute><CreatePostForm /></PrivateRoute>} />
        <Route path="/login" element={<GoogleAuth />} />
        <Route path="/auth/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
