import './App.css';
import { useEffect, useState } from 'react';
import { analytics, auth } from './firebase';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthForm from './components/AuthForm';
import LoggedInView from './components/LoggedInView';
import PublicView from './components/PublicView';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPublicView, setShowPublicView] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    // Log page view when app loads
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: 'Seth Bailey Portfolio',
        page_location: window.location.href,
      });
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser && analytics) {
        logEvent(analytics, 'login', {
          method: 'firebase'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowPublicView(false);
      if (analytics) {
        logEvent(analytics, 'logout');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthForm(false);
    if (analytics) {
      logEvent(analytics, 'sign_up');
    }
  };

  const toggleView = () => {
    setShowPublicView(!showPublicView);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is logged in
  if (user) {
    // Check if user is authorized (only sethb23c@gmail.com)
    const isAuthorized = user.email === 'sethb23c@gmail.com';
    
    if (!isAuthorized) {
      // If user is not authorized, sign them out and show public view
      handleLogout();
      return (
        <div className="App">
          <PublicView onSignIn={() => setShowAuthForm(true)} />
        </div>
      );
    }
    
    // Show public view if toggled, otherwise show logged in view
    if (showPublicView) {
      return (
        <div className="App">
          <div className="bg-gray-800/95 border-b border-gray-700 px-8 py-3 backdrop-blur-sm">
            <div className="max-w-[1600px] mx-auto flex justify-between items-center">
              <p className="text-gray-300 text-sm flex items-center gap-2">
                <span className="text-blue-400">👁️</span> Viewing as public visitor
              </p>
              <button
                onClick={toggleView}
                className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          <PublicView />
        </div>
      );
    }
    
    return (
      <div className="App">
        <LoggedInView 
          onLogout={handleLogout} 
          onToggleView={toggleView}
          showPublicView={showPublicView}
        />
      </div>
    );
  }

  // If user is not logged in, show public view with sign in option
  return (
    <div className="App">
      <PublicView onSignIn={() => setShowAuthForm(true)} />
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthForm(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-sm"
            >
              Close ✕
            </button>
            <AuthForm onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
