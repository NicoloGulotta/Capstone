import React from 'react'

export default function GoogleAuth() {
    const hendlegoogleAuth = () => {
        const str = "http://localhost:3001/auth/googlelogin";
        window.open(str, "_self")
    };
    return (
        <button onClick={hendlegoogleAuth}>Accedi con google</button>
    )
};