"use client";

import { SignInButton } from "@clerk/nextjs";
import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type AuthAction = 'login' | 'signup';

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authStep, setAuthStep] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<AuthAction | null>(null);

  // Function to authenticate with backend
  const authenticateWithBackend = async (action: AuthAction) => {
    if (!user || !isLoaded || authStatus === 'loading') return;
    
    setAuthStatus('loading');
    setError(null);
    setSelectedAction(action);
    setAuthStep(`${action === 'login' ? 'Logging in' : 'Signing up'}...`);
    
    try {
      // Get the session token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      setAuthStep('Verifying token with backend...');

      // Send token to your backend via the API route
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userData: {
            id: user?.id,
            email: user?.emailAddresses?.[0]?.emailAddress,
            firstName: user?.firstName,
            lastName: user?.lastName,
            imageUrl: user?.imageUrl,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Authentication successful:", data);
        setUserData(data.userData);
        setIsNewUser(data.isNewUser);
        setAuthStep('');
        setAuthStatus('success');
      } else {
        // Handle specific error cases
        if (data.userNotFound && action === 'login') {
          throw new Error("Account not found. Please sign up first or try signing up instead.");
        } else if (data.userExists && action === 'signup') {
          throw new Error("Account already exists. Please login instead.");
        } else {
          throw new Error(data.error || "Authentication failed");
        }
      }
    } catch (err) {
      console.error("Error authenticating:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setAuthStep('');
      setAuthStatus('error');
    }
  };

  // Reset auth status when switching between signed in/out
  useEffect(() => {
    if (!user && isLoaded) {
      setAuthStatus('idle');
      setUserData(null);
      setIsNewUser(false);
      setError(null);
      setSelectedAction(null);
    }
  }, [user, isLoaded]);

  const resetToIdle = () => {
    setAuthStatus('idle');
    setError(null);
    setSelectedAction(null);
    setAuthStep('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center">
        <SignedOut>
          <div className="max-w-md">
            <h1 className="text-3xl font-bold text-white mb-8">Welcome</h1>
            <p className="text-neutral-400 mb-8">Sign in with Google to continue</p>
            <SignInButton mode="modal">
              <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-neutral-800 border-2 border-neutral-700 rounded-full transition-all duration-300 ease-in-out hover:bg-neutral-700 hover:border-neutral-600 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-950">
                <svg 
                  className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </SignInButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="text-center max-w-md">
            {!isLoaded ? (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-neutral-800 rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-300 mr-2"></div>
                  <span className="text-neutral-300">Loading user data...</span>
                </div>
              </div>
            ) : authStatus === 'idle' ? (
              <>
                <h1 className="text-2xl font-semibold text-neutral-50 mb-2">
                  Hello, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User'}!
                </h1>
                <p className="text-neutral-400 mb-8">
                  You're signed in with Google. Now choose an action:
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => authenticateWithBackend('login')}
                    className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-green-700 border-2 border-green-600 rounded-full transition-all duration-300 ease-in-out hover:bg-green-600 hover:border-green-500 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-neutral-950"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Existing Account
                  </button>
                  
                  <button
                    onClick={() => authenticateWithBackend('signup')}
                    className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-700 border-2 border-blue-600 rounded-full transition-all duration-300 ease-in-out hover:bg-blue-600 hover:border-blue-500 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-950"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create New Account
                  </button>
                </div>
                
                <p className="text-xs text-neutral-500 mt-4">
                  Choose "Login" if you already have an account in our system, or "Create New Account" to register.
                </p>
              </>
            ) : (
              <h1 className="text-2xl font-semibold text-neutral-50 mb-4">
                {isNewUser ? 'Welcome!' : 'Welcome back!'}, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User'}!
              </h1>
            )}
            
            {authStatus === 'loading' && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-neutral-800 rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-300 mr-2"></div>
                  <span className="text-neutral-300">{authStep || 'Processing...'}</span>
                </div>
              </div>
            )}
            
            {authStatus === 'success' && (
              <div className="mb-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                  isNewUser 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-green-900 text-green-300'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isNewUser ? '🎉 Welcome! Account created and authenticated successfully!' : '✅ Welcome back! Authenticated successfully!'}
                </div>
              </div>
            )}
            
            {authStatus === 'error' && error && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-red-900 text-red-300 rounded-full mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
                <button
                  onClick={resetToIdle}
                  className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-full hover:bg-neutral-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {authStatus === 'success' && userData && (
              <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${isNewUser ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                  <p className="text-neutral-300 font-medium">
                    {isNewUser ? 'New Account Created' : 'Existing Account Found'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Username:</span>
                    <span className="text-neutral-300">{userData.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email:</span>
                    <span className="text-neutral-300">{userData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">User ID:</span>
                    <span className="text-neutral-300 font-mono text-xs">{userData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Created:</span>
                    <span className="text-neutral-300">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {authStatus === 'success' && (
              <div className="mt-6 space-y-2">
                <a
                  href="/team"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Go to Team Board
                </a>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}