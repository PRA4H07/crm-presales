import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

// flip to true when real API login is hooked up
const API_LOGIN_ENABLED = true;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectBasedOnRole = (role) => {
    if (role === "system_admin") return "/insights";
    return "/dashboard";
  };

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    const email = form.email.trim();

    if (!API_LOGIN_ENABLED) {
      let role = "employee";

      if (typeof user.role === "string") {
        const fromServer = user.role.toUpperCase();

        if (fromServer === "SYSTEM_ADMIN") role = "system_admin";
        else if (fromServer === "ADMIN") role = "admin";
        else if (fromServer === "EMPLOYEE") role = "employee";
      }
      login({ name: "User", email, role }, "test-token");
      navigate(redirectBasedOnRole(role), { replace: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginRequest({ email, password: form.password });
      const body = response.data;

      let token = null;
      if (body && typeof body === "object") {
        token =
          body.token ||
          body.accessToken ||
          body.jwt ||
          (body.data && (body.data.token || body.data.accessToken)) ||
          null;
      }

      let user = null;
      if (body && typeof body === "object") {
        if (body.user && typeof body.user === "object") {
          user = body.user;
        } else if (body.data && typeof body.data === "object") {
          if (body.data.user && typeof body.data.user === "object") {
            user = body.data.user;
          } else if (
            body.data.id != null ||
            body.data._id != null ||
            body.data.email
          ) {
            user = body.data;
          }
        }
      }

      if (!token || !user) {
        throw new Error(
          "Invalid sign-in response. Expected user and token from the server.",
        );
      }

      let role = email.includes("system")
        ? "system_admin"
        : email.includes("manager")
          ? "admin"
          : "employee";

      if (typeof user.role === "string") {
        const fromServer = user.role.toUpperCase();

        if (fromServer === "SYSTEM_ADMIN") role = "system_admin";
        else if (fromServer === "ADMIN") role = "admin";
        else if (fromServer === "EMPLOYEE") role = "employee";
      }

      login({ ...user, role }, String(token));
      console.log("LOGIN USER:", user);
      console.log("mustChangePassword:", user.mustChangePassword);

      if (user.mustChangePassword) {
        navigate("/change-password", { replace: true });
      } else {
        navigate(redirectBasedOnRole(role), { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Sign in failed. Please check your credentials.";
      setError(
        typeof message === "string"
          ? message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinueAs(role) {
    setError("");
    const email = form.email.trim() || `${role}@crm.com`;
    login({ name: "User", email, role }, "test-token");

    navigate(redirectBasedOnRole(role), { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <section className="mx-auto grid min-h-[88vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-indigo-100/40 lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-8 right-2 h-56 w-56 rounded-full bg-rose-200 blur-3xl" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold tracking-wide text-indigo-100">
              CRM Hub
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Manage your pre-sales pipeline efficiently
            </h1>
            <p className="mt-4 max-w-md text-indigo-100/95">
              Unified lead tracking, communication history, tasks, and
              forecasting in one modern workspace.
            </p>
          </div>
          <div className="relative z-10 rounded-2xl border border-white/30 bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-indigo-50">
              Trusted by high-performing pre-sales teams to close deals faster.
            </p>
          </div>
        </aside>

        <div className="grid place-items-center p-6 sm:p-10">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to continue to your CRM workspace.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-indigo-100 transition focus:ring-4"
                  placeholder="you@company.com"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-indigo-100 transition focus:ring-4"
                  placeholder="Enter your password"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                />
                Remember me
              </label>
              <Link
                to="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="crm-gradient-bg crm-gradient-bg-hover mt-5 h-11 w-full rounded-xl text-sm font-semibold text-white shadow-md shadow-fuchsia-200 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {!API_LOGIN_ENABLED ? (
              <>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleContinueAs("admin")}
                    className="h-11 rounded-xl border border-violet-200 bg-violet-50 px-3 text-sm font-medium text-violet-900 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Continue as Pre-Sales Manager
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleContinueAs("employee")}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Continue as Employee
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleContinueAs("system_admin")}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Continue as System Admin
                </button>
              </>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-10 rounded-lg border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Google
              </button>
              <button
                type="button"
                className="h-10 rounded-lg border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Microsoft
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
