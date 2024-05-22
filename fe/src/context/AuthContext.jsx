import React, { createContext, useState } from 'react';

const AuthContext = createContext({
    isLoggedIn: false,
    userData: null,
    login: (userData) => { },
    logout: () => { },
    error: null, // Aggiunto per la gestione degli errori
});

export default AuthContext;
