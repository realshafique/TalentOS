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
      const formData = new URLSearchParams();

      formData.append("username", email.trim());
      formData.append("password", password);

      console.log("Login API:", `${API_URL}/auth/login`);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      console.log("Login status:", response.status);
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid email or password."
        );
      }

      if (!data.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      // Save JWT
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Remove old authentication key
      localStorage.removeItem("talentos_access_token");

      // Get profile ID directly from backend response
      const profileId = data.user?.profile_id;

      console.log("Profile ID:", profileId);

      if (profileId !== null && profileId !== undefined) {
        localStorage.setItem(
          "talentos_profile_id",
          String(profileId)
        );

        console.log("Redirecting to /profile");

        navigate("/profile", {
          replace: true,
        });

        return;
      }

      // User has no profile yet
      localStorage.removeItem("talentos_profile_id");

      console.log(
        "No profile found. Redirecting to /create-profile"
      );

      navigate("/create-profile", {
        replace: true,
      });
    } catch (error) {
      console.error("Login failed:", error);

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
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">

        <div className="w-full">

          {/* Header */}
          <div className="mb-7 text-center sm:mb-8">
            <Link
              to="/"
              className="inline-block text-lg font-bold tracking-tight text-slate-950"
            >
              Talent<span className="text-indigo-600">OS</span>
            </Link>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Login to your TalentOS account
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                  <p className="break-words">
                    {error}
                  </p>

                  {error
                    .toLowerCase()
                    .includes("verify your email") && (
                    <div className="mt-3">
                      <Link
                        to="/register"
                        className="font-semibold underline underline-offset-2"
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
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>
          </div>

          {/* Register */}
          <p className="mt-6 text-center text-sm leading-6 text-slate-500">
            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-slate-950 underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}