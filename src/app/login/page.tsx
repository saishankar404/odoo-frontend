"use client";

import { SignInButton } from "@clerk/nextjs";
import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [tokenSent, setTokenSent] = useState(false);
  const [sendingToken, setSendingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to send token to backend
  const sendTokenToBackend = async () => {
    if (!user || !isLoaded) return;
    
    setSendingToken(true);
    setError(null);
    
    try {
      // Get the session token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Send token to your backend via the API route
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          userData: {
            id: user?.id,
            email: user?.emailAddresses?.[0]?.emailAddress,
            firstName: user?.firstName,
            lastName: user?.lastName,
            imageUrl: user?.imageUrl,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Token sent successfully:", data);
        setTokenSent(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send token to backend");
      }
    } catch (err) {
      console.error("Error sending token:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSendingToken(false);
    }
  };

  // Automatically send token when user is signed in
  useEffect(() => {
    if (isLoaded && user && !tokenSent && !sendingToken) {
      sendTokenToBackend();
    }
  }, [isLoaded, user, tokenSent, sendingToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-black bg-white border-2 border-black rounded-full transition-all duration-300 ease-in-out hover:bg-black hover:text-white hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
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
        </SignedOut>
        
        <SignedIn>
          <div className="text-center max-w-md">
            {!isLoaded ? (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  <span className="text-gray-700">Loading user data...</span>
                </div>
              </div>
            ) : (
              <h1 className="text-2xl font-semibold text-black mb-4">
                Welcome back, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User'}!
              </h1>
            )}
            
            {sendingToken && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  <span className="text-gray-700">Sending token to backend...</span>
                </div>
              </div>
            )}
            
            {tokenSent && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Token sent successfully!
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>You are successfully authenticated with Clerk.</p>
              {tokenSent && (
                <p>Your authentication token has been sent to the backend.</p>
              )}
            </div>
            
            {error && (
              <button
                onClick={sendTokenToBackend}
                className="mt-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Retry sending token
              </button>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
