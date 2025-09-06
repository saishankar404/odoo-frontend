import { auth } from "@clerk/nextjs/server";

/**
 * Get the current user's session token from Clerk
 * This can be used to authenticate with your backend
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    return token;
  } catch (error) {
    console.error("Error getting session token:", error);
    return null;
  }
}

/**
 * Send authentication token to your backend
 * Replace the URL with your actual backend endpoint
 */
export async function sendTokenToBackend(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Token sent to backend successfully:", data);
      return true;
    } else {
      console.error("Failed to send token to backend:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error sending token to backend:", error);
    return false;
  }
}

/**
 * Client-side function to get token and send to backend
 * Use this in your React components
 */
export async function handleAuthentication(): Promise<boolean> {
  try {
    // Get token from Clerk (this works on client side)
    const { useAuth } = await import("@clerk/nextjs");
    // Note: This function should be used within a React component with useAuth hook
    // For server-side usage, use the getSessionToken function above
    
    return false; // This is a placeholder - use the hook in your component
  } catch (error) {
    console.error("Error handling authentication:", error);
    return false;
  }
}
