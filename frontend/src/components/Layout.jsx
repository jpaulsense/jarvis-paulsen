import React from 'react';
import Header from './Header';

const Layout = ({ user, handleSignIn, handleSignOut, children }) => {
  return (
    <div className="App">
      <Header
        user={user}
        handleSignIn={handleSignIn}
        handleSignOut={handleSignOut}
      />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;