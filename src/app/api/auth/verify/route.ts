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

    // Get the request body to see if there's additional data
    const body = await request.json();
    
    // Here you would send the token to your backend
    // Replace this URL with your actual backend endpoint
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/api/auth/verify";
    
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        token,
        userData: body.userData || null,
        timestamp: new Date().toISOString(),
      }),
    });

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      return NextResponse.json({
        success: true,
        message: "Token sent to backend successfully",
        backendResponse: backendData,
      });
    } else {
      console.error("Backend error:", backendResponse.statusText);
      return NextResponse.json(
        { 
          error: "Backend authentication failed",
          status: backendResponse.status 
        },
        { status: backendResponse.status }
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
