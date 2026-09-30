import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "./config";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (data: any): string => {
    const detail = data?.detail;

    // FastAPI validation errors
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const location = Array.isArray(item.loc)
              ? item.loc.join(".")
              : "field";

            const message =
              typeof item.msg === "string"
                ? item.msg
                : JSON.stringify(item);

            return `${location}: ${message}`;
          }

          return String(item);
        })
        .join("\n");
    }

    // Normal FastAPI error
    if (typeof detail === "string") {
      return detail;
    }

    // Object error
    if (detail && typeof detail === "object") {
      return Object.entries(detail)
        .map(([key, value]) => {
          if (typeof value === "string") {
            return `${key}: ${value}`;
          }

          return `${key}: ${JSON.stringify(value)}`;
        })
        .join("\n");
    }

    if (
      data &&
      typeof data === "object" &&
      typeof data.message === "string"
    ) {
      return data.message;
    }

    return "Registration failed. Please try again.";
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
        }),
      });

      const data = await response.json();

      console.log("Register status:", response.status);
      console.log("Register response:", data);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      if (!data.access_token) {
        throw new Error(
          "Account was created, but the server did not return an access token."
        );
      }

      // Clear old authentication data
      localStorage.removeItem("talentos_profile_id");

      // Save new authentication token
      localStorage.setItem(
        "talentos_access_token",
        data.access_token
      );

      // Existing profile
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
        // New account → create profile
        navigate("/create-profile");
      }
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Join TalentOS
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >
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
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repeat your password"
              required
              minLength={8}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          {error && (
            <div className="whitespace-pre-line rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-black"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}