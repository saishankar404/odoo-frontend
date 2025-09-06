import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the token from Clerk
    const { getToken } = await auth();
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Get the request body
    const { userData } = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    
    // First, try to login with the token (this will verify the token)
    const loginResponse = await fetch(`${backendUrl}/auth/login`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error("Backend login failed:", errorText);
      return NextResponse.json(
        { 
          error: "Backend login failed", 
          details: errorText 
        },
        { status: loginResponse.status }
      );
    }

    const loginData = await loginResponse.json();
    
    // Check if user exists in our database
    const userCheckResponse = await fetch(`${backendUrl}/auth/user/${userData.email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let userData_response = null;
    let isNewUser = false;
    
    if (userCheckResponse.ok) {
      // User exists, return login data
      userData_response = await userCheckResponse.json();
    } else {
      // User doesn't exist, create them
      const signupResponse = await fetch(`${backendUrl}/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.firstName || userData.email.split('@')[0],
          email: userData.email,
        }),
      });

      if (signupResponse.ok) {
        userData_response = await signupResponse.json();
        isNewUser = true;
      } else {
        const signupError = await signupResponse.text();
        console.error("User creation failed:", signupError);
        return NextResponse.json(
          { 
            error: "User creation failed", 
            details: signupError 
          },
          { status: signupResponse.status }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: isNewUser ? "User created and authenticated successfully" : "User authenticated successfully",
      clerkData: loginData,
      userData: userData_response,
      isNewUser
    });

  } catch (error) {
    console.error("Error in auth verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check if user is authenticated
export async function GET() {
  try {
    const { getToken, userId } = await auth();
    const token = await getToken();
    
    if (!token || !userId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      userId,
      hasToken: !!token,
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}