import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "./config";

export default function Register() {
  const navigate = useNavigate();

  // =====================================================
  // REGISTRATION STATE
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =====================================================
  // OTP STATE
  // =====================================================

  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(false);

  // =====================================================
  // UI STATE
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // =====================================================
  // ERROR HANDLER
  // =====================================================

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

    return "Something went wrong. Please try again.";
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    // Validation
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

      // =================================================
      // OTP SENT
      // =================================================

      setEmail(cleanEmail);

      setOtpMode(true);

      setSuccess(
        data.message ||
          "Verification code sent to your email."
      );
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

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanOTP = otp.trim();

    if (!/^\d{6}$/.test(cleanOTP)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: cleanOTP,
          }),
        }
      );

      const data = await response.json();

      console.log("OTP verification status:", response.status);
      console.log("OTP verification response:", data);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      // =================================================
      // JWT RECEIVED
      // =================================================

      if (!data.access_token) {
        throw new Error(
          "Email verified, but no access token was returned."
        );
      }

      // Clear old authentication data
      localStorage.removeItem("talentos_access_token");
      localStorage.removeItem("talentos_profile_id");

      // Save token using the same key as api.ts
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // =================================================
      // SAVE PROFILE ID IF AVAILABLE
      // =================================================

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
        // New account
        navigate("/create-profile");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      console.log("Resend status:", response.status);
      console.log("Resend response:", data);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setSuccess(
        data.message ||
          "A new verification code has been sent."
      );

      setOtp("");
    } catch (error) {
      console.error("Resend OTP failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  // =====================================================
  // OTP SCREEN
  // =====================================================

  if (otpMode) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">

          {/* Header */}
          <div className="mb-7 text-center sm:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Verify Your Email
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              We sent a 6-digit verification code to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-900 sm:text-base">
              {email}
            </p>
          </div>

          {/* OTP Form */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <form
            onSubmit={handleVerifyOTP}
            className="mx-auto w-full max-w-2xl space-y-5"
          >

            {/* OTP */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Verification Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                autoComplete="one-time-code"
                className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.35em] outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:text-2xl sm:tracking-[0.5em]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="whitespace-pre-line break-words rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="break-words rounded-xl bg-green-50 px-4 py-3 text-sm leading-6 text-green-600">
                {success}
              </div>
            )}

            {/* Verify */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>
          </form>
          </div>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="mt-2 font-semibold text-slate-950 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending
                ? "Sending..."
                : "Resend OTP"}
            </button>
          </div>

          {/* Change Email */}
          <button
            type="button"
            onClick={() => {
              setOtpMode(false);
              setOtp("");
              setError("");
              setSuccess("");
            }}
            className="mt-6 block w-full text-center text-sm text-slate-500 transition hover:text-slate-950"
          >
            ← Use a different email
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // REGISTRATION SCREEN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">

        {/* Header */}
        <div className="mb-7 text-center sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Create Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Join TalentOS
          </p>
        </div>

        {/* Register Form */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <form
          onSubmit={handleRegister}
          className="mx-auto w-full max-w-2xl space-y-5"
        >

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
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
              autoComplete="new-password"
              className="w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="whitespace-pre-line break-words rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {error}
            </div>
          )}

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Sending verification code..."
              : "Create Account"}
          </button>
        </form>
        </div>

        {/* Login */}
        <p className="mt-6 text-center text-sm leading-6 text-slate-500">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-slate-950 underline-offset-2 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}