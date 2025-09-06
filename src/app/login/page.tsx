"use client";

import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  username: string;
  createdAt?: string;
  [key: string]: any;
}

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [authStatus, setAuthStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authStep, setAuthStep] = useState<string>("");
  const [hasAuthed, setHasAuthed] = useState(false); // prevent multiple calls

  const authenticateWithBackend = async () => {
    if (!user || !isLoaded || authStatus === "loading" || hasAuthed) return;

    setHasAuthed(true);
    setAuthStatus("loading");
    setError(null);
    setAuthStep("Connecting to authentication server...");

    try {
      // Get Clerk JWT
      const token = await getToken?.();
      if (!token) throw new Error("No auth token found");

      setAuthStep("Verifying user...");

      const response = await fetch("http://localhost:5553/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setUserData(data.user);
      setIsNewUser(data.isNewUser || false);
      setAuthStep("");
      setAuthStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAuthStep("");
      setAuthStatus("error");
    }
  };

  const resetToIdle = () => {
    setAuthStatus("idle");
    setError(null);
    setAuthStep("");
    setUserData(null);
    setIsNewUser(false);
    setHasAuthed(false);
  };

  const goToTeamBoard = () => {
    router.push("/team");
  };

  // 🔹 Auto-authenticate whenever a user is signed in (new or existing)
  useEffect(() => {
    if (isLoaded && user && authStatus === "idle") {
      authenticateWithBackend();
    }
  }, [isLoaded, user]);

  // Reset state if signed out
  useEffect(() => {
    if (!user && isLoaded) resetToIdle();
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center max-w-md">
        <SignedOut>
          <h1 className="text-3xl font-bold text-white mb-8">Welcome</h1>
          <SignInButton mode="modal">
            <button className="px-8 py-4 bg-neutral-800 text-white rounded-full hover:bg-neutral-700">
              Sign in with Google
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="absolute top-4 right-4">
            <SignOutButton>
              <button className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600">
                Sign Out
              </button>
            </SignOutButton>
          </div>

          {!isLoaded || authStatus === "loading" ? (
            <p className="text-neutral-400">
              {authStep || "Loading user data..."}
            </p>
          ) : authStatus === "success" && userData ? (
            <>
              <p className="text-green-300">
                {isNewUser ? "🎉 Account created!" : "✅ Welcome back!"}
              </p>
              <div className="mt-4">
                <p>Username: {userData.username}</p>
                <p>Email: {userData.email}</p>
              </div>
              <button
                onClick={goToTeamBoard}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Go to Team Board
              </button>
            </>
          ) : authStatus === "error" && error ? (
            <div>
              <p className="text-red-500">{error}</p>
              <button
                onClick={resetToIdle}
                className="mt-2 px-4 py-2 bg-neutral-700 text-white rounded-full"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </SignedIn>
      </div>
    </div>
  );
}
