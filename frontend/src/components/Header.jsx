import React from 'react';

const Header = ({ user, handleSignIn, handleSignOut }) => {
  return (
    <header className="App-header">
      <h1>Jarvis Paulsen Assistant</h1>
      <nav>
        {user ? (
          <div>
            <span>Welcome, {user.displayName}!</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleSignIn}>Sign in with Google</button>
        )}
      </nav>
    </header>
  );
};

export default Header;