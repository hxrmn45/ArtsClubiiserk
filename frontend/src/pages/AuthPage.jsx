import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Palette, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (isAuthenticated) return <Navigate to="/community" replace />;

  const handleChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        await register(form.name, form.email, form.password);
        toast.success("Welcome to Canvas Club!");
      }

      navigate("/community");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cyan-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 mb-4">
            <Palette className="w-7 h-7 text-white" />
          </div>

          <h1 className="font-outfit font-extrabold text-3xl text-stone-900">
            Canvas Club
          </h1>

          <p className="font-manrope text-stone-500 mt-1">
            {mode === "login"
              ? "Welcome back, artist!"
              : "Join the creative community"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8">

          <div className="flex rounded-xl bg-stone-100 p-1 mb-8">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-outfit font-semibold transition-colors ${
                  mode === m
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {mode === "register" && (
              <div>
                <label className="block font-outfit font-medium text-sm text-stone-700 mb-1.5">
                  Full Name
                </label>

                <input
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            )}

            <div>
              <label className="block font-outfit font-medium text-sm text-stone-700 mb-1.5">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="block font-outfit font-medium text-sm text-stone-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    mode === "register"
                      ? "At least 6 characters"
                      : "Your password"
                  }
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-orange-500 text-white font-outfit font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 shadow-lg shadow-orange-100"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>

          </form>

          <p className="text-center font-manrope text-sm text-stone-500 mt-6">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() =>
                setMode(mode === "login" ? "register" : "login")
              }
              className="text-orange-500 font-semibold hover:underline"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
