import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';
import { checkOnPremStatus } from './api';
import Layout from './components/Layout';
import Chat from './components/Chat';
import CalendarUpload from './components/CalendarUpload';
import EventsList from './components/EventsList';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'chat'
  const [extractedData, setExtractedData] = useState(null);

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

  const handleEventsExtracted = (data) => {
    setExtractedData(data);
  };

  const handleUploadAnother = () => {
    setExtractedData(null);
  };

  const handleComplete = (result) => {
    console.log('Calendar operation complete:', result);
    // Could add analytics or notifications here
  };

  return (
    <Layout
      user={user}
      handleSignIn={handleSignIn}
      handleSignOut={handleSignOut}
    >
      {user ? (
        <>
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              📅 Calendar Assistant
            </button>
            <button
              className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'calendar' ? (
              <div className="calendar-assistant-container">
                {!extractedData ? (
                  <CalendarUpload onEventsExtracted={handleEventsExtracted} />
                ) : (
                  <EventsList
                    events={extractedData.events}
                    ocrText={extractedData.ocrText}
                    onComplete={handleComplete}
                    onUploadAnother={handleUploadAnother}
                  />
                )}
              </div>
            ) : (
              <Chat />
            )}
          </div>

          {/* iOS Install Prompt */}
          <InstallPrompt />
        </>
      ) : (
        <div className="sign-in-prompt">
          <h2>Welcome to Family Assistant</h2>
          <p>Sign in with your Google account to continue</p>
        </div>
      )}
    </Layout>
  );
}

export default App;
