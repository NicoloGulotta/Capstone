import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Pagine
import Profile from "./pages/Profile";
// import CreatePostForm from "./pages/CreatePostForm"; // Non utilizzato, commentato
import Home from "./pages/Home";
import PostDetails from "./pages/PostDetails";
import Login from "./components/commons/Login";
import RegistrationForm from "./components/commons/Registration";
import Settings from "./pages/Settings";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Context e data fetching
import { AuthProvider } from "./context/AuthContext";
import { useFetchUserData } from "./data/useFetchUserData";

function App() {
  // Utilizza il custom hook useFetchUserData
  const { isLoading, error } = useFetchUserData();

  // Funzione di logout
  const logout = (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.reload("/"); // Ricarica la pagina dopo il logout
  };

  return (
    <BrowserRouter>
      <AuthProvider> {/* Avvolgi l'app nel provider di autenticazione */}
        <Navbar onLogout={logout} />

        <Container>
          {/* Mostra un alert di errore se c'è un errore e non si sta caricando */}
          {error && !isLoading && <Alert variant="danger">{error}</Alert>}
          {isLoading ? (
            // Mostra uno spinner di caricamento durante il caricamento iniziale
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Caricamento in corso...</span>
              </Spinner>
            </div>
          ) : (
            // Definizione delle rotte dell'applicazione
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/register" element={<RegistrationForm />} />
              <Route path="/post/:postId" element={<PostDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          )}
        </Container>
        <Footer style={{ marginTop: "auto" }} /> {/* Footer fisso in fondo */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
