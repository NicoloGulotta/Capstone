import React from "react";
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import { Container, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Importazione dei componenti delle pagine
import Profile from "./pages/Profile";
// import CreatePostForm from "./pages/CreatePostForm";
import Home from "./pages/Home";
import PostDetails from "./pages/PostDetails";
import Login from "./components/commons/Login";
import RegistrationForm from "./components/commons/Registration";
import Settings from "./pages/Settings";

// Importazione dei componenti di layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Importazione del context provider dell'autenticazione e del contesto
import { AuthProvider } from "./context/AuthContext";
import { useFetchUserData } from "./data/useFetchUserData";

// Funzione che gestisce l'autenticazione
function App() {
  const { isLoading, error, } = useFetchUserData();

  const logout = (e) => {
    e.preventDefault();

    // Cancella il Local Storage 
    localStorage.clear();

    // Ricarica la pagina e vai a "/home"
    window.location.reload("/");
  };
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar onLogout={logout} />
        <Container>
          {error && !isLoading && <Alert variant="danger">{error}</Alert>}
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/registrazione" element={<RegistrationForm />} />
              {/* <Route
                path="/create-post"
                element={
                  <PrivateRoute>
                    <CreatePostForm />
                  </PrivateRoute>
                }
              /> */}
              <Route path="/post/:postId" element={<PostDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          )}
        </Container>
        <Footer style={{ marginTop: "auto" }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
