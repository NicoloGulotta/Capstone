import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Container, Alert, Spinner } from "react-bootstrap";
import { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";// Importazione dei componenti delle pagine
import Profile from "./pages/Profile";
import CreatePostForm from "./pages/CreatePostForm";
import Home from "./pages/Home";
import PostDetails from "./pages/PostDetails";
import Login from "./components/commons/Login";
import RegistrationForm from "./components/commons/Registration";
import { AuthProvider, AuthContext } from "./context/AuthContext";
// Importazione dei componenti di layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
// Importazione del context provider dell'autenticazione e del contesto
import { useFetchUserData } from "./data/useFetchUserData";

// Componente per proteggere le rotte che richiedono autenticazione
function PrivateRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext); // Ottieni lo stato di autenticazione dal contesto
  return isAuthenticated ? children : <Navigate to="/login" />; // Reindirizza al login se non autenticato
}

function App() {
  // Utilizza il custom hook useFetchUserData per gestire i dati dell'utente
  const { isLoading, userData, logout, error } = useFetchUserData();

  // Funzione per gestire il logout
  const handleLogout = () => {
    logout();
  };

  return (
    <BrowserRouter>
      <AuthProvider> {/* Fornisce il contesto di autenticazione all'applicazione */}
        <Navbar onLogout={handleLogout} /> {/* Barra di navigazione con funzione di logout */}
        <Container>
          {/* Visualizzazione degli errori */}
          {error && !isLoading && <Alert variant="danger">{error}</Alert>}

          {/* Spinner di caricamento */}
          {isLoading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "80vh" }}
            >
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Caricamento in corso...</span>
              </Spinner>
            </div>
          ) : (
            // Definizione delle rotte dell'applicazione
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registrazione" element={<RegistrationForm />} />
              <Route path="/create-post" element={<PrivateRoute><CreatePostForm /></PrivateRoute>} />
              <Route path="/post/:postId" element={<PostDetails />} />
              <Route path="/profile:userId" element={<Profile />} />
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          )}
        </Container>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
