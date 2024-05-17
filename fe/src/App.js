import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GoogleAuth from './components/GoogleAuth.jsx';
import Profile from './components/Profile.jsx'; // Importa il componente Profile

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GoogleAuth />} />
        <Route path="/auth/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
