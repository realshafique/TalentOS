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
      // FastAPI OAuth2 login expects form-urlencoded data
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

      // Handle login failure
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid email or password."
        );
      }

      // Backend must return an access token
      if (!data.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      // =====================================================
      // SAVE AUTHENTICATION TOKEN
      // =====================================================

      localStorage.setItem(
        "talentos_access_token",
        data.access_token
      );

      // Remove old profile ID
      localStorage.removeItem("talentos_profile_id");

      // =====================================================
      // SAVE PROFILE ID IF USER ALREADY HAS A PROFILE
      // =====================================================

      if (
        data.user?.profile_id !== null &&
        data.user?.profile_id !== undefined
      ) {
        localStorage.setItem(
          "talentos_profile_id",
          String(data.user.profile_id)
        );

        navigate("/profile");
      } else {
        // User has not created a profile yet
        navigate("/create-profile");
      }
    } catch (error) {
      console.error("Login failed:", error);

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