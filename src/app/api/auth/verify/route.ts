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
    const { userData, action } = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    
    // First, verify the token with backend login endpoint
    const loginResponse = await fetch(`${backendUrl}/auth/login`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error("Backend token verification failed:", errorText);
      return NextResponse.json(
        { 
          error: "Token verification failed", 
          details: errorText 
        },
        { status: loginResponse.status }
      );
    }

    const loginData = await loginResponse.json();
    
    if (action === 'login') {
      // For login, check if user exists in database
      const userCheckResponse = await fetch(`${backendUrl}/auth/user/${encodeURIComponent(userData.email)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (userCheckResponse.ok) {
        const userData_response = await userCheckResponse.json();
        console.log("Existing user found:", userData_response);
        
        return NextResponse.json({
          success: true,
          message: "User authenticated successfully",
          clerkData: loginData,
          userData: userData_response,
          isNewUser: false
        });
      } else {
        return NextResponse.json(
          { 
            error: "User not found in database. Please sign up first.", 
            userNotFound: true 
          },
          { status: 404 }
        );
      }
    } else if (action === 'signup') {
      // For signup, first check if user already exists
      const userCheckResponse = await fetch(`${backendUrl}/auth/user/${encodeURIComponent(userData.email)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (userCheckResponse.ok) {
        // User already exists
        return NextResponse.json(
          { 
            error: "User already exists. Please login instead.", 
            userExists: true 
          },
          { status: 409 }
        );
      } else {
        // User doesn't exist, create them
        console.log("Creating new user...");
        
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
          const userData_response = await signupResponse.json();
          console.log("New user created:", userData_response);
          
          return NextResponse.json({
            success: true,
            message: "User created and authenticated successfully",
            clerkData: loginData,
            userData: userData_response,
            isNewUser: true
          });
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
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'login' or 'signup'" },
        { status: 400 }
      );
    }

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