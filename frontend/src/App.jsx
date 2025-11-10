import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';
import { checkOnPremStatus } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkOnPremStatus();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .catch((error) => console.error("Authentication error:", error));
  };

  const handleSignOut = () => {
    signOut(auth)
      .catch((error) => console.error("Sign out error:", error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Jarvis Paulsen Assistant</h1>
        {user ? (
          <div>
            <p>Welcome, {user.displayName}!</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleSignIn}>Sign in with Google</button>
        )}
      </header>
    </div>
  );
}

export default App;
