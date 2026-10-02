import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "./config";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // FastAPI OAuth2 expects form-urlencoded data
      const formData = new URLSearchParams();

      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      // Login failed
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid email or password."
        );
      }

      // Make sure backend returned JWT
      if (!data.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      // =====================================================
      // SAVE TOKEN
      // =====================================================

      localStorage.setItem("access_token", data.access_token);

      // Remove old authentication key
      localStorage.removeItem("talentos_access_token");

      // =====================================================
      // SAVE PROFILE ID IF BACKEND RETURNS IT
      // =====================================================

      const profileId =
        data.user?.profile_id ??
        data.profile_id ??
        null;

      if (profileId !== null && profileId !== undefined) {
        localStorage.setItem(
          "talentos_profile_id",
          String(profileId)
        );

        // Existing profile
        navigate("/profile", { replace: true });
        return;
      }

      // =====================================================
      // NO PROFILE ID
      // =====================================================

      // Try to find the user's profile using the authenticated
      // token before deciding that they need to create one.

      try {
        const profileResponse = await fetch(
          `${API_URL}/profiles/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          const foundProfileId =
            profileData?.id ??
            profileData?.profile_id ??
            profileData?.profile?.id ??
            null;

          if (foundProfileId !== null) {
            localStorage.setItem(
              "talentos_profile_id",
              String(foundProfileId)
            );

            navigate("/profile", { replace: true });
            return;
          }
        }
      } catch (profileError) {
        console.warn(
          "Could not check existing profile:",
          profileError
        );
      }

      // No existing profile
      localStorage.removeItem("talentos_profile_id");

      navigate("/create-profile", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      // If something went wrong, don't leave a stale token
      // pretending that the user is logged in.
      localStorage.removeItem("access_token");

      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="mt-2 text-gray-500">
            Login to your TalentOS account
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Email */}
          <div>
            <label className="mb-2 block font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}

              {error.toLowerCase().includes("verify your email") && (
                <div className="mt-3">
                  <Link
                    to="/register"
                    className="font-semibold underline"
                  >
                    Verify your email
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-semibold text-black"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}