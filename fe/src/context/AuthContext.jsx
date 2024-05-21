import React, { createContext, useState } from 'react';

const AuthContext = createContext({
    isLoggedIn: false,
    userData: null,
    login: (userData) => { },
    logout: () => { }
});

export default AuthContext;
