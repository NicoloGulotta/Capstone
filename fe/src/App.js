import React, { useEffect, useContext, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import Profile from './pages/Profile';
import CreatePostForm from './pages/CreatePostForm';
import Home from './pages/Home';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PostDetails from './pages/PostDetails';
import AuthContext from './context/AuthContext';
import { useFetchUserData } from './data/useFetchUserData';
import Login from './components/commons/Login';
import RegistrationForm from './components/commons/Registration';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext); // Estrai solo isAuthenticated
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const { isLoading, isLoggedIn, userData, login, logout, error, clearError } = useFetchUserData();
  const [reloadNavbar, setReloadNavbar] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setReloadNavbar(prev => !prev); // forza il re-render di Navbar
    }
  }, [isLoggedIn]); // Il componente verrà ri-renderizzato quando lo stato cambia

  const handleLogout = () => {
    logout();
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ isLoggedIn, userData, login, logout, error, clearError }}>
        <Navbar onLogout={handleLogout} reloadNavbar={reloadNavbar} />
        <Container>
          {error && !isLoading && <Alert variant="danger">{error}</Alert>}
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Caricamento in corso...</span>
              </Spinner>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registrazione" element={<RegistrationForm />} />
              <Route path="/create-post" element={<PrivateRoute><CreatePostForm /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/post/:postId" element={<PostDetails />} />
            </Routes>
          )}
        </Container>
        <Footer />
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
