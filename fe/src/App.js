import React, { useState, useEffect, useContext, navigate } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import GoogleAuth from './components/common/GoogleAuth';
import Profile from './pages/Profile';
import CreatePostForm from './pages/CreatePostForm';
import Home from './pages/Home';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PostDetails from './pages/PostDetails';
import AuthContext from '../src/layout/';
import { useFetchUserData } from './hooks/useFetchUserData';

// PrivateRoute component (esempio)
function PrivateRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/" />;
}

function App() {
  const { isLoading, isLoggedIn, userData, login, logout, error } = useFetchUserData();

  const handleLogout = () => {
    logout();
    navigate('/'); // Reindirizza alla home dopo il logout
  };

  // Aggiornamento del context value
  const contextValue = {
    isLoggedIn,
    userData,
    login,
    logout: handleLogout, // Passa la funzione handleLogout aggiornata
    error
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider value={contextValue}>
        <Navbar />
        <Container>
          {error && <Alert variant="danger">{error}</Alert>} {/* Mostra l'errore se presente */}
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <GoogleAuth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create-post" element={<PrivateRoute><CreatePostForm /></PrivateRoute>} />
            <Route path="/auth/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/posts/:postId" element={<PostDetails />} />
          </Routes>
        </Container>
        <Footer />
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
