"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

// A simple component for a loading state
const LoadingSpinner = () => (
  <div
    style={
      {
        /* Add some basic styling for a spinner or message */
      }
    }
  >
    <p>Redirecting to Google Sign-in...</p>
  </div>
);

export default function GoogleSignInPage() {
  const searchParams = useSearchParams();
  // Get the original URL the user was trying to access
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    // Immediately trigger the Google sign-in flow
    signIn("google", { redirectTo: callbackUrl });
  }, [callbackUrl]);

  // Display a loading message while the redirect happens
  return <LoadingSpinner />;
}
