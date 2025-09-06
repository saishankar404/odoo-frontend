// app/api/auth/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Route Called ===");

    const { userId, getToken } = await auth();
    const token = await getToken();

    console.log("Clerk Auth - User ID:", userId);
    console.log("Clerk Auth - Has Token:", !!token);

    if (!userId || !token) {
      console.error("No Clerk user ID or authentication token found");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const { action } = await request.json();
    console.log("Requested Action:", action);

    if (!action) {
      console.error("Missing action in request body");
      return NextResponse.json(
        { error: "Missing required field: action" },
        { status: 400 },
      );
    }

    // Both login and signup actions call the same backend endpoint
    // since your backend handles user creation automatically
    if (action === "login" || action === "signup") {
      console.log(`=== Attempting ${action} with backend ===`);
      console.log(`Backend URL: ${backendUrl}/auth/login`);

      const loginResponse = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`Backend response status: ${loginResponse.status}`);
      console.log(`Backend response ok: ${loginResponse.ok}`);

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log("=== Backend Success Response ===", loginData);

        // Your backend should return: { message, user, isNewUser }
        // If it doesn't have isNewUser, we'll detect it from the message
        const isNewUser =
          loginData.isNewUser ||
          (loginData.message && loginData.message.includes("created"));

        const response = {
          success: true,
          message: loginData.message || "User authenticated successfully",
          userData: loginData.user || loginData, // Handle both response formats
          isNewUser: isNewUser,
        };

        console.log("=== Sending Response to Frontend ===", response);
        return NextResponse.json(response);
      } else {
        // Handle error response
        let errorMessage = "Authentication failed";
        let errorDetails = "";

        try {
          const errorData = await loginResponse.json();
          console.log("=== Backend Error Response (JSON) ===", errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch {
          errorDetails = await loginResponse.text();
          console.log("=== Backend Error Response (Text) ===", errorDetails);
          errorMessage = errorDetails || errorMessage;
        }

        console.error("Backend authentication failed:", errorDetails);

        return NextResponse.json(
          {
            error: errorMessage,
            details: errorDetails,
          },
          { status: loginResponse.status },
        );
      }
    }

    console.error("Invalid action:", action);
    return NextResponse.json(
      { error: "Invalid action. Use 'login' or 'signup'" },
      { status: 400 },
    );
  } catch (err) {
    console.error("=== API Route Error ===", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = await getToken();

    return NextResponse.json({
      message: "Auth API is working",
      userId,
      hasToken: !!token,
      backendUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
