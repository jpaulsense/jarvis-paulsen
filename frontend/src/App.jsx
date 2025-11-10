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
    <Layout
      user={user}
      handleSignIn={handleSignIn}
      handleSignOut={handleSignOut}
    >
      {user ? (
        <div>
          {/* The main content of the application will go here */}
          <h2>Welcome to your personal assistant.</h2>
        </div>
      ) : (
        <h2>Please sign in to continue.</h2>
      )}
    </Layout>
  );
}

export default App;
